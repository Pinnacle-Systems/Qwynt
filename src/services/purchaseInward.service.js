import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import fs from "fs";
import path from "path";
import {
  createApprovalLog,
  getModuleApprovalSetup,
  evaluateConfigTrigger,
  getTriggeredConfig,
  buildIncludeForModule,
} from "../utils/approvalHelper.js";

const REFERENCE_PAGE = "PURCHASE INWARD";

// ── Doc ID ────────────────────────────────────────────────────────────────────
async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.purchaseInward.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PI/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.purchaseInward.findMany({
        select: { docId: true },
        where: {
          branchId: parseInt(branchId),
          AND: [
            { createdAt: { gte: startTime } },
            { createdAt: { lte: endTime } },
          ],
        },
      });
      const maxDocId = records.reduce((max, current) => {
        const currentNo = Number(current.docId.split("/").pop());
        const maxNo = max ? Number(max.split("/").pop()) : 0;
        return currentNo > maxNo ? current.docId : max;
      }, null);
      newDocId = `${branchObj.branchCode}/${shortCode}/PI/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PI/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}

// ── Status ────────────────────────────────────────────────────────────────────
function getPurchaseInwardStatus(inward) {
  if (inward.receiptType === "AGAINST_INVOICE") {
    if (inward.inwardType !== "Direct Inward") {
      let isFullyReceived = true;
      let isPartiallyReceived = false;
      (inward.inwardItems || []).forEach((item) => {
        const poQty = item.poQty || 0;
        const inwardQty = item.inwardQty || 0;
        if (inwardQty < poQty) isFullyReceived = false;
        if (inwardQty > 0 && inwardQty < poQty) isPartiallyReceived = true;
      });
      if (isFullyReceived) return "Fully Billed";
      if (isPartiallyReceived) return "Partially Billed";
      return "Not Billed";
    }
    if (inward.inwardType === "Direct Inward") return "Fully Billed";
  } else {
    const inwardItems = inward.inwardItems || [];
    const returnItems = inward.purchaseReturnItems || [];
    const billItems = inward.purchaseBillEntryItems || [];
    const totalInwardQty = inwardItems.reduce(
      (sum, item) => sum + (item.inwardQty || 0),
      0,
    );
    const totalReturnQty = returnItems.reduce(
      (sum, item) => sum + (item.returnQty || 0),
      0,
    );
    const totalBilledQty = billItems.reduce(
      (sum, item) => sum + (item.inwardQty || 0),
      0,
    );

    if (totalInwardQty === 0) return "Pending";
    if (totalReturnQty >= totalInwardQty) return "Fully Returned";
    if (totalBilledQty >= totalInwardQty) return "Fully Billed";
    if (totalBilledQty > 0 && totalReturnQty > 0)
      return "Partially Billed & Returned";
    if (totalBilledQty > 0) return "Partially Billed";
    if (totalReturnQty > 0) return "Partially Returned";
    return "Not Billed";
  }
}

// ── Approval Status ───────────────────────────────────────────────────────────
function getApprovalStatus(log, isApprovalTriggered = false) {
  if (!log) {
    return isApprovalTriggered
      ? {
          status: "NOTAPPROVED",
          label: "Not Approved",
          color: "orange",
          currentLevel: 1,
          levelLogs: [],
        }
      : {
          status: "NOT_CONFIGURED",
          label: "No Approval",
          color: "gray",
          currentLevel: null,
          levelLogs: [],
        };
  }
  const base = {
    currentLevel: log.currentLevel,
    levelLogs: log.LevelLogs ?? [],
    remarks: log.remarks,
  };
  const map = {
    APPROVED: {
      ...base,
      status: "APPROVED",
      label: "Approved",
      color: "green",
    },
    REJECTED: { ...base, status: "REJECTED", label: "Rejected", color: "red" },
    PENDING: { ...base, status: "PENDING", label: "Pending", color: "orange" },
    NOTAPPROVED: {
      ...base,
      status: "NOTAPPROVED",
      label: "Not Approved",
      color: "orange",
    },
    SUPERSEDED: {
      ...base,
      status: "SUPERSEDED",
      label: "Re-approval Needed",
      color: "yellow",
    },
  };
  return (
    map[log.status] ?? {
      ...base,
      status: "UNKNOWN",
      label: "Unknown",
      color: "gray",
    }
  );
}

// ── Shared config evaluator ───────────────────────────────────────────────────
function evaluateConfigs(activeConfigs, record) {
  if (!activeConfigs?.length) return false;
  const valid = activeConfigs
    .filter(
      (c) =>
        c.approvalLevels?.length > 0 &&
        c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
    )
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  return valid.some((config) => evaluateConfigTrigger(config, record));
}

// ── GET LIST ──────────────────────────────────────────────────────────────────
async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    searchInwardType,
    finYearId,
    searchSupplier,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(finYearDate?.startTime, finYearDate?.endTime)
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
  );

  let data = await prisma.purchaseInward.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      inwardType: Boolean(searchInwardType)
        ? { contains: searchInwardType }
        : undefined,
      Store: { storeName: searchStore ? { contains: searchStore } : undefined },
      supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      Store: { select: { id: true, storeName: true } },
      inwardItems: true,
      purchaseReturnItems: { select: { returnQty: true } },
      purchaseBillEntryItems: { select: { inwardQty: true } },
      supplier: { select: { id: true, name: true } },
      _count: {
        select: {
          purchaseReturnItems: true,
          purchaseBillEntryItems: true,
          stocks: {
            where: { itemStatus: "PACKED" },
          },
        },
      },
    },
    orderBy: { docId: "desc" },
  });

  let totalCount = data.length;

  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

  const ids = data.map((i) => i.id);
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  const approvalLogs = hasApproval
    ? await prisma.approvalLog.findMany({
        where: { referencePage: REFERENCE_PAGE, referenceId: { in: ids } },
        select: {
          id: true,
          referenceId: true,
          status: true,
          remarks: true,
          currentLevel: true,
          LevelLogs: {
            select: {
              action: true,
              levelNo: true,
              userId: true,
              createdAt: true,
              User: { select: { id: true, username: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : [];

  const logMap = approvalLogs.reduce((acc, log) => {
    acc[log.referenceId] = log;
    return acc;
  }, {});

  // ✅ Fetch configs once for condition evaluation (same as PO service)
  const activeConfigs =
    hasApproval && module
      ? await prisma.approvalConfig.findMany({
          where: {
            moduleId: module.id,
            branchId: parseInt(branchId),
            active: true,
          },
          include: {
            ConfigConditions: {
              include: { Field: true, Operator: true, CompareField: true },
            },
            approvalLevels: {
              include: { LevelUsers: true },
              orderBy: { levelNo: "asc" },
            },
          },
          orderBy: { priority: "asc" },
        })
      : [];

  return {
    statusCode: 0,
    data: data.map((item) => {
      const log = logMap[item.id] ?? null;

      // ✅ FIX: evaluate per-record, not just hasApproval
      let shouldTrigger = false;
      if (!log && hasApproval && activeConfigs.length > 0) {
        shouldTrigger = evaluateConfigs(activeConfigs, item);
      }

      return {
        ...item,
        status: getPurchaseInwardStatus(item),
        approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
        childRecord:
          (item._count?.purchaseReturnItems || 0) +
          (item._count?.purchaseBillEntryItems || 0) +
          (item._count?.stocks || 0),
      };
    }),
    nextDocId: newDocId,
    totalCount,
  };
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
async function getOne(id) {
  const data = await prisma.purchaseInward.findUnique({
    where: { id: parseInt(id) },
    include: {
      attachments: true,
      Store: { select: { locationId: true, storeName: true } },
      Branch: { select: { branchName: true } },
      supplier: { select: { name: true } },
      inwardItems: {
        include: {
          Po: true,
          inwardItemsStockEntries: {
            include: {
              stock: {
                select: {
                  id: true,
                  qrCode: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");

  const itemsWithQty = await Promise.all(
    data.inwardItems.map(async (item) => {
      const [cancelAgg, inwardAgg, returnAgg] = await Promise.all([
        prisma.purchaseCancelItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            poId: item.poId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            gsmId: item.gsmId,
          },
          _sum: { cancelQty: true },
        }),
        prisma.inwardItems.aggregate({
          where: {
            // styleItemId: item.styleItemId,
            // poId: item.poId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            purchaseInwardId: { not: data.id },
            gsmId: item.gsmId,
          },
          _sum: { inwardQty: true },
        }),
        prisma.purchaseReturnItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            purchaseInwardId: data.id,
            gsmId: item.gsmId,
          },
          _sum: { returnQty: true },
        }),
      ]);
      return {
        ...item,
        alreadyCancelQty: cancelAgg?._sum?.cancelQty ?? 0,
        alreadyInwardQty: inwardAgg?._sum?.inwardQty ?? 0,
        alreadyReturnQty: returnAgg?._sum?.returnQty ?? 0,
        balQty:
          item.poQty -
          ((inwardAgg?._sum?.inwardQty ?? 0) +
            (cancelAgg?._sum?.cancelQty ?? 0)),
      };
    }),
  );

  const [childRecordReturn, childRecordBill, childRecordStock, approvalLog] =
    await Promise.all([
      prisma.purchaseReturnItems.count({
        where: { purchaseInwardId: data.id },
      }),
      prisma.purchaseBillEntryItems.count({
        where: { purchaseInwardId: data.id },
      }),
      prisma.stock.count({
        where: { PurchaseInwardId: data.id, itemStatus: "PACKED" },
      }),
      prisma.approvalLog.findFirst({
        where: { referenceId: parseInt(id), referencePage: REFERENCE_PAGE },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          currentLevel: true,
          remarks: true,
          ApprovalConfig: {
            select: {
              approvalLevels: {
                orderBy: { levelNo: "asc" },
                select: {
                  id: true,
                  levelNo: true,
                  approveType: true,
                  LevelUsers: {
                    select: {
                      userId: true,
                      User: { select: { id: true, username: true } },
                    },
                  },
                },
              },
            },
          },
          LevelLogs: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              levelNo: true,
              action: true,
              remarks: true,
              createdAt: true,
              User: { select: { id: true, username: true } },
            },
          },
        },
      }),
    ]);

  const { hasApproval, module } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    data.branchId,
  );

  // ✅ FIX: evaluate if THIS specific record triggers any config (same as PO getOne)
  let isApprovalTriggered = false;
  if (!approvalLog && hasApproval && module) {
    const activeConfigs = await prisma.approvalConfig.findMany({
      where: { moduleId: module.id, branchId: data.branchId, active: true },
      include: {
        ConfigConditions: {
          include: { Field: true, Operator: true, CompareField: true },
        },
        approvalLevels: {
          include: { LevelUsers: true },
          orderBy: { levelNo: "asc" },
        },
      },
      orderBy: { priority: "asc" },
    });
    isApprovalTriggered = activeConfigs
      .filter(
        (c) =>
          c.approvalLevels?.length > 0 &&
          c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
      )
      .some((config) => evaluateConfigTrigger(config, data));
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      inwardItems: itemsWithQty,
      childRecord: childRecordReturn + childRecordBill + childRecordStock,
      // ✅ FIX: use isApprovalTriggered not hasApproval
      approvalStatus: getApprovalStatus(
        approvalLog,
        !!approvalLog || isApprovalTriggered,
      ),
      approvalLog: approvalLog ?? null,
    },
  };
}

async function getOneBillEntry(req) {
  const { supplierId } = req.query;
  const data = await prisma.purchaseInward.findMany({
    where: { supplierId: parseInt(supplierId) },
    include: {
      Store: { select: { locationId: true, storeName: true } },
      Branch: { select: { branchName: true } },
      supplier: { select: { name: true } },
      inwardItems: { include: { Hsn: true, Uom: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");
  return { statusCode: 0, data };
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    docDate,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    remarks,
    vehicleNo,
    inwardItems: rawInwardItems,
    finYearId,
    draftSave,
    locationId,
    invNo,
    receiptType,
    taxTemplateId,
    discountType,
    discountValue,
    netBillValue,
    attachments,
  } = await body;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  let newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
    draftSave,
  );

  const safeNetBillValue =
    netBillValue && !isNaN(Number(netBillValue))
      ? parseFloat(netBillValue)
      : null;

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseInward.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        supplierId: parseInt(supplierId),
        inwardType,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        vehicleNo,
        locationId: parseInt(locationId),
        invNo,
        receiptType,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
        discountType,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        netBillValue: safeNetBillValue,
        attachments:
          JSON.parse(attachments)?.length > 0
            ? {
                createMany: {
                  data: JSON.parse(attachments).map((sub) => ({
                    date: sub?.date ? new Date(sub.date) : undefined,
                    filePath: sub?.filePath || undefined,
                    name: sub?.name || undefined,
                  })),
                },
              }
            : undefined,
      },
    });

    const inwardItems =
      typeof rawInwardItems === "string"
        ? JSON.parse(rawInwardItems)
        : rawInwardItems;
    await createInwardItems(
      tx,
      inwardItems,
      data,
      userId,
      locationId,
      storeId,
      inwardType,
      invNo,
      dcNo,
    );

    if (receiptType === "AGAINST_INVOICE") {
      await tx.purchaseLedger.create({
        data: {
          docId: newDocId ?? "",
          docDate: docDate ? new Date(docDate) : null,
          supplierId: parseInt(supplierId),
          remarks: remarks ?? "",
          netBillValue: parseFloat(netBillValue) ?? null,
          purchaseInwardId: parseInt(data.id),
        },
      });
    }
  });

  return { statusCode: 0, data };
}

// ── CREATE INWARD ITEMS ───────────────────────────────────────────────────────
async function createInwardItems(
  tx,
  inwardItems,
  purchaseInward,
  userId,
  locationId,
  storeId,
  inwardType,
  invNo,
  dcNo,
) {
  const promises = inwardItems?.map(async (stockDetail) => {
    const createdItem = await tx.inwardItems.create({
      data: {
        purchaseInwardId: parseInt(purchaseInward.id),
        itemVariantId: stockDetail?.itemVariantId
          ? parseInt(stockDetail.itemVariantId)
          : null,
        poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
        poItemsId: stockDetail?.poItemsId
          ? parseInt(stockDetail.poItemsId)
          : null,
        printingDesignId: stockDetail?.printingDesignId
          ? parseInt(stockDetail.printingDesignId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
        gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        poQty: stockDetail?.poQty ? parseInt(stockDetail.poQty) : null,
        inwardQty: stockDetail?.inwardQty
          ? parseInt(stockDetail.inwardQty)
          : null,
        price: stockDetail?.price ? parseInt(stockDetail.price) : null,
        discountType: stockDetail?.discountType ?? undefined,
        discountValue: stockDetail?.discountValue
          ? parseInt(stockDetail.discountValue)
          : null,
        taxPercent: stockDetail?.taxPercent
          ? parseInt(stockDetail.taxPercent)
          : null,
        qrCode: stockDetail?.qrCode ?? "",
        inwardType: inwardType || "",
        invNo: invNo || "",
        dcNo: dcNo || "",
      },
    });
    if (stockDetail.qrCodes && stockDetail.qrCodes.length > 0) {
      // qrCodes is an array of objects: [{ stockId, qrCode }]
      const stockIds = stockDetail.qrCodes.map((q) => parseInt(q.stockId));

      await tx.inwardItemsStockEntry.createMany({
        data: stockIds.map((id) => ({
          inwardItemId: createdItem.id,
          stockId: id,
        })),
      });

      await tx.stock.updateMany({
        where: { id: { in: stockIds } },
        data: {
          inwardItemsId: createdItem.id,
          PurchaseInwardId: parseInt(purchaseInward.id),
          itemStatus: "INWARDED",
          storeId: parseInt(storeId),
        },
      });
    }

    return createdItem;
  });
  return Promise.all(promises);
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function update(id, body, files) {
  const {
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    remarks,
    vehicleNo,
    inwardItems: rawInwardItems,
    invNo,
    receiptType,
    taxTemplateId,
    discountType,
    discountValue,
    netBillValue,
    attachments,
  } = await body;

  const safeNetBillValue =
    netBillValue && !isNaN(Number(netBillValue))
      ? parseFloat(netBillValue)
      : null;
  const safeDiscountValue =
    discountValue && !isNaN(Number(discountValue))
      ? parseFloat(discountValue)
      : null;
  const safeTaxTemplateId =
    taxTemplateId && !isNaN(Number(taxTemplateId))
      ? parseInt(taxTemplateId)
      : null;

  const parseAttachments = JSON.parse(attachments || "[]");
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const dataFound = await prisma.purchaseInward.findUnique({
    where: { id: parseInt(id) },
    include: {
      inwardItems: { select: { id: true } },
      attachments: { select: { id: true, filePath: true } },
      supplier: true,
      Branch: true,
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Inward");

  const removedAttachments = dataFound.attachments.filter(
    (existing) => !incomingIds.includes(existing.id),
  );
  const updatedAttachmentsWithNewFile = dataFound.attachments.filter(
    (existing) => {
      const incoming = parseAttachments.find(
        (i) => parseInt(i.id) === existing.id,
      );
      return (
        incoming &&
        existing.filePath &&
        (!incoming.filePath || incoming.filePath !== existing.filePath)
      );
    },
  );

  const unlinkFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join("./uploads", filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete file: ${fullPath}`, err.message);
    });
  };

  removedAttachments.forEach((att) => unlinkFile(att.filePath));
  updatedAttachmentsWithNewFile.forEach((att) => unlinkFile(att.filePath));

  const inwardItems =
    typeof rawInwardItems === "string"
      ? JSON.parse(rawInwardItems)
      : rawInwardItems;
  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseInward.update({
      where: { id: parseInt(id) },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        storeId: parseInt(storeId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        supplierId: parseInt(supplierId),
        inwardType,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        vehicleNo,
        invNo,
        receiptType,
        taxTemplateId: safeTaxTemplateId,
        discountType,
        discountValue: safeDiscountValue,
        netBillValue: safeNetBillValue,
        attachments: {
          deleteMany:
            incomingIds.length > 0 ? { id: { notIn: incomingIds } } : {},
          update: parseAttachments
            .filter((item) => item.id)
            .map((sub) => ({
              where: { id: parseInt(sub.id) },
              data: {
                date: sub?.date ? new Date(sub.date) : undefined,
                filePath: (() => {
                  const f = files?.find((f) => f.originalname === sub.filePath);
                  return f ? f.filename : sub.filePath || undefined;
                })(),
                name: sub?.name || undefined,
              },
            })),
          create: parseAttachments
            .filter((item) => !item.id)
            .map((sub) => ({
              date: sub?.date ? new Date(sub.date) : undefined,
              filePath: (() => {
                const f = files?.find((f) => f.originalname === sub.filePath);
                return f ? f.filename : sub.filePath;
              })(),
              name: sub?.name || undefined,
            })),
        },
      },
    });

    await updateinwardItems(
      tx,
      inwardItems,
      data,
      userId,
      locationId,
      storeId,
      inwardType,
      invNo,
      dcNo,
    );

    if (receiptType === "AGAINST_INVOICE") {
      const ledger = await tx.purchaseLedger.findFirst({
        where: { purchaseInwardId: parseInt(data.id) },
      });
      if (ledger) {
        await tx.purchaseLedger.update({
          where: { id: ledger.id },
          data: {
            docDate: docDate ? new Date(docDate) : null,
            supplierId: parseInt(supplierId),
            remarks: remarks ?? "",
            netBillValue: parseFloat(netBillValue) ?? null,
          },
        });
      }
    }
  });

  return { statusCode: 0, data };
}

// ── UPDATE INWARD ITEMS ───────────────────────────────────────────────────────
async function updateinwardItems(
  tx,
  inwardItems,
  purchaseInward,
  userId,
  locationId,
  storeId,
  inwardType,
  invNo,
  dcNo,
) {
  const promises = inwardItems?.map(async (stockDetail) => {
    if (stockDetail.id) {
      console.log("Truecondition");

      const inwardItemId = parseInt(stockDetail.id);

      // Ensure all currently linked stocks get the potentially new storeId
      await tx.stock.updateMany({
        where: { inwardItemsId: inwardItemId },
        data: { storeId: parseInt(storeId) },
      });

      // Process QR codes to append any NEW ones added to this existing row
      if (stockDetail.qrCodes) {
        const incomingStockIds = stockDetail.qrCodes
          .map((q) => parseInt(q.stockId))
          .filter(Boolean);

        const existingEntries = await tx.inwardItemsStockEntry.findMany({
          where: { inwardItemId: inwardItemId },
          select: { stockId: true },
        });
        const existingStockIds = existingEntries.map((e) => e.stockId);

        const addedStockIds = incomingStockIds.filter(
          (id) => !existingStockIds.includes(id),
        );

        if (addedStockIds.length > 0) {
          await tx.inwardItemsStockEntry.createMany({
            data: addedStockIds.map((id) => ({
              inwardItemId: inwardItemId,
              stockId: id,
            })),
          });

          await tx.stock.updateMany({
            where: { id: { in: addedStockIds } },
            data: {
              inwardItemsId: inwardItemId,
              PurchaseInwardId: parseInt(purchaseInward.id),
              itemStatus: "INWARDED",
              storeId: parseInt(storeId),
            },
          });

          // Update the inwardQty of the existing InwardItems to reflect the additions
          if (stockDetail.inwardQty) {
            await tx.inwardItems.update({
              where: { id: inwardItemId },
              data: { inwardQty: parseInt(stockDetail.inwardQty) },
            });
          }
        }
      }

      return stockDetail;
    } else {
      console.log(stockDetail, "stockDetailhotted");
      const createdItem = await tx.inwardItems.create({
        data: {
          purchaseInwardId: parseInt(purchaseInward.id),
          itemVariantId: stockDetail?.itemVariantId
            ? parseInt(stockDetail.itemVariantId)
            : null,
          poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
          poItemsId: stockDetail?.poItemsId
            ? parseInt(stockDetail.poItemsId)
            : null,
          printingDesignId: stockDetail?.printingDesignId
            ? parseInt(stockDetail.printingDesignId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
          poQty: stockDetail?.poQty ? parseInt(stockDetail.poQty) : null,
          inwardQty: stockDetail?.inwardQty
            ? parseInt(stockDetail.inwardQty)
            : null,
          price: stockDetail?.price ? parseInt(stockDetail.price) : null,
          discountType: stockDetail?.discountType ?? undefined,
          discountValue: stockDetail?.discountValue
            ? parseInt(stockDetail.discountValue)
            : null,
          taxPercent: stockDetail?.taxPercent
            ? parseInt(stockDetail.taxPercent)
            : null,
          inwardType: inwardType || "",
          invNo: invNo || "",
          dcNo: dcNo || "",
        },
      });
      if (stockDetail.qrCodes && stockDetail.qrCodes.length > 0) {
        const stockIds = stockDetail.qrCodes.map((q) => parseInt(q.stockId));

        await tx.inwardItemsStockEntry.createMany({
          data: stockIds.map((id) => ({
            inwardItemId: createdItem.id,
            stockId: id,
          })),
        });

        await tx.stock.updateMany({
          where: { id: { in: stockIds } },
          data: {
            inwardItemsId: createdItem.id,
            PurchaseInwardId: parseInt(purchaseInward.id),
            itemStatus: "INWARDED",
            storeId: parseInt(storeId),
          },
        });
      }
      return createdItem;
    }
  });
  return Promise.all(promises);
}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const dataFound = await prisma.purchaseInward.findUnique({
    where: { id: parseInt(id) },
    include: { attachments: { select: { filePath: true } } },
  });

  dataFound?.attachments?.forEach((att) => {
    if (!att.filePath) return;
    const fullPath = path.join("./uploads", att.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete: ${fullPath}`, err.message);
    });
  });

  await prisma.stock.updateMany({
    where: { PurchaseInwardId: parseInt(id) },
    data: {
      PurchaseInwardId: null,
      inwardItemsId: null,
      itemStatus: "PURCHASEORDER",
      storeId: null,
    },
  });

  const data = await prisma.purchaseInward.delete({
    where: { id: parseInt(id) },
  });
  return { statusCode: 0, data };
}

// ── Remaining functions unchanged ─────────────────────────────────────────────
async function getPurchaseDetail(req) {
  const { invNo } = req.query;
  let data = await prisma.purchaseInward.findFirst({
    where: { invNo },
    include: {
      fabricInwardItems: {
        select: {
          materialStocks: true,
          id: true,
          purchaseInwardId: true,
          styleNo: true,
          fabricId: true,
          // styleItemId: true,
          styleId: true,
          hsnId: true,
          fabWidth: true,
          fabMeter: true,
          uomId: true,
          noOfPcs: true,
          accessoryId: true,
          accessoryGroupId: true,
          accessoryItemId: true,
          qty: true,
          price: true,
          Fabric: true,
          Color: true,
          StyleItem: true,
          Accessory: true,
          AccessoryGroup: true,
          Uom: true,
          Size: true,
          filePath: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");
  return { statusCode: 0, data };
}

async function getPurchaseDetailStock(req) {
  const { invNo, storeId, branchId, returnType } = req.query;
  let purchaseData = await prisma.purchaseInward.findFirst({
    where: { invNo, inwardType: returnType },
    include: { inwardItems: true },
  });
  if (!purchaseData || purchaseData.length === 0)
    return NoRecordFound("Invoice");

  const isMaterial =
    returnType?.toLowerCase().includes("fabric") ||
    returnType?.toLowerCase().includes("accessory");
  let data;

  if (isMaterial) {
    data = await prisma.materialStock.groupBy({
      by: [
        "fabricId",
        "hsnId",
        "fabWidth",
        "accessoryId",
        "accessoryGroupId",
        "uomId",
        "styleId",
        "invNo",
        "portionId",
      ],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        invNo,
      },
      _sum: { qty: true, fabMeter: true },
    });
  } else {
    const rg =
      purchaseData.inwardItems.filter((item) => item.styleId && item.uomId) ||
      [];
    data = await prisma.stock.groupBy({
      by: ["fabricId", "hsnId", "uomId", "styleId", "styleNo"],
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        storeId: storeId ? parseInt(storeId) : undefined,
        OR: rg.map((item) => ({
          styleId: item.styleId,
          // styleItemId: item.styleItemId,
          hsnId: item.hsnId,
          uomId: item.uomId,
        })),
      },
      _sum: { qty: true },
    });
  }

  if (!data || data.length === 0) return NoRecordFound("Invoice not found");

  return {
    statusCode: 0,
    data: isMaterial
      ? data.map((d) => ({
          invNo: d.invNo,
          // styleItemId: d.styleItemId,
          fabricId: d.fabricId,
          hsnId: d.hsnId,
          uomId: d.uomId,
          fabWidth: d.fabWidth,
          fabMeter: d._sum.fabMeter,
          accessoryId: d.accessoryId,
          accessoryGroupId: d.accessoryGroupId,
          qty: d._sum.qty,
          styleId: d.styleId,
          portionId: d.portionId,
        }))
      : data.map((d) => ({
          invNo: purchaseData.invNo,
          // styleItemId: d.styleItemId,
          fabricId: d.fabricId,
          hsnId: d.hsnId,
          uomId: d.uomId,
          stkQty: d._sum.qty,
          styleId: d.styleId,
          styleNo: d.styleNo,
        })),
    returnType: purchaseData.inwardType,
    supplierId: purchaseData.supplierId,
  };
}

function manualFilterSearchDataPurchaseInwardItems(
  searchDocDate,
  searchDcDate,
  returnType,
  data,
) {
  const returnTypeToSearch =
    returnType === "General Return"
      ? ["Direct Inward"]
      : ["Order Purchase Inward", "General Purchase Inward"];
  return data.filter(
    (item) =>
      (searchDocDate
        ? String(getDateFromDateTime(item.PurchaseInward.docDate)).includes(
            searchDocDate,
          )
        : true) &&
      (searchDcDate
        ? String(getDateFromDateTime(item.PurchaseInward.dcDate)).includes(
            searchDcDate,
          )
        : true) &&
      (returnTypeToSearch
        ? returnTypeToSearch.includes(item.PurchaseInward.inwardType)
        : true),
  );
}

async function getAllDataPurInwardItems(data) {
  const results = await Promise.all(
    data?.map(async (item) => {
      const res = await getPurInwardItemById(item.id);
      return res.data;
    }),
  );
  return results.filter((item) => item.balQty > 0);
}

async function getPurInwardItemById(id) {
  let data = await prisma.inwardItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      PurchaseInward: { select: { docId: true, dcDate: true, docDate: true } },
      Uom: { select: { name: true } },
      // StyleItem: { select: { name: true } },
      Hsn: { select: { name: true } },
      Itemgroup: { select: { name: true } },
      Size: { select: { name: true } },
      Color: { select: { name: true } },
      Gsm: { select: { name: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Inward");

  const [itemWithPoQty, returnItems] = await Promise.all([
    prisma.poItems.findFirst({
      where: {
        styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        gsmId: data.gsmId,
      },
    }),
    prisma.purchaseReturnItems.findMany({
      where: {
        styleItemId: data.styleItemId,
        purchaseInwardId: data.purchaseInwardId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        gsmId: data.gsmId,
      },
      select: { returnQty: true },
    }),
  ]);

  const returnQty = returnItems.reduce(
    (sum, item) => sum + (item.returnQty ?? 0),
    0,
  );
  return {
    statusCode: 0,
    data: {
      ...data,
      poQty: itemWithPoQty?.qty ?? 0,
      alreadyReturnQty: returnQty,
      balQty: data.inwardQty - returnQty,
    },
  };
}

async function getPurchaseInwardItems(req) {
  const {
    branchId,
    active,
    supplierId,
    pagination,
    searchDocId,
    searchDocDate,
    searchDcDate,
    returnType,
  } = req.query;

  let data;
  let totalCount;
  if (pagination) {
    data = await prisma.inwardItems.findMany({
      where: {
        PurchaseInward: {
          docId: Boolean(searchDocId) ? { contains: searchDocId } : undefined,
          supplierId: supplierId ? parseInt(supplierId) : undefined,
        },
      },
      include: {
        PurchaseInward: {
          select: {
            supplierId: true,
            docDate: true,
            dcDate: true,
            inwardType: true,
          },
        },
        Uom: { select: { name: true } },
      },
    });
    data = manualFilterSearchDataPurchaseInwardItems(
      searchDocDate,
      searchDcDate,
      returnType,
      data,
    );
    data = data?.filter((i) => i.PurchaseInward.supplierId == supplierId);
    data = await getAllDataPurInwardItems(data);
  } else {
    data = await prisma.inwardItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }
  return { statusCode: 0, data, totalCount };
}

async function getAllDataPoItems(data) {
  const results = await Promise.all(
    data?.map(async (item) => {
      const res = await getPoItemById(item.id);
      return res.data;
    }),
  );
  return results.filter((item) => item.balQty > 0);
}

async function getPoItemById(id) {
  const data = await prisma.inwardItems.findUnique({
    where: { id: parseInt(id) },
    include: {
      Po: { select: { docId: true, dueDate: true, docDate: true } },
      Uom: { select: { name: true } },
      StyleItem: { select: { name: true } },
      Hsn: { select: { name: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Order");

  const [inwardItems, cancelItems] = await Promise.all([
    prisma.inwardItems.findMany({
      where: {
        // styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
      },
      select: { purchaseInwardId: true, inwardQty: true },
    }),
    prisma.purchaseCancelItems.findMany({
      where: {
        styleItemId: data.styleItemId,
        poId: data.poId,
        uomId: data.uomId,
        hsnId: data.hsnId,
      },
      select: { cancelQty: true },
    }),
  ]);

  const inwardQty = inwardItems.reduce(
    (sum, item) => sum + (item.inwardQty ?? 0),
    0,
  );
  const cancelQty = cancelItems.reduce(
    (sum, item) => sum + (item.cancelQty ?? 0),
    0,
  );
  const inwardIds = inwardItems.map((i) => i.purchaseInwardId).filter(Boolean);

  let returnQty = 0;
  if (inwardIds.length > 0) {
    const returnAgg = await prisma.purchaseReturnItems.aggregate({
      where: {
        styleItemId: data.styleItemId,
        uomId: data.uomId,
        hsnId: data.hsnId,
        purchaseInwardId: { in: inwardIds },
      },
      _sum: { returnQty: true },
    });
    returnQty = returnAgg._sum.returnQty ?? 0;
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      poQty: data.qty,
      cancelQty,
      alreadyInwardQty: inwardQty,
      alreadyReturnQty: returnQty,
      balQty: data.qty - (inwardQty + cancelQty),
      balQtyCancel: data.qty - (inwardQty - returnQty),
    },
  };
}

function manualFilterSearchDataPIItems(searchPIDate, data) {
  return data.filter((item) =>
    searchPIDate
      ? String(getDateFromDateTime(item.PurchaseInward?.docDate)).includes(
          searchPIDate,
        )
      : true,
  );
}

async function getPurchaseInwardBillEntryItems(req) {
  const {
    branchId,
    active,
    supplierId,
    searchInvNo,
    pagination,
    dataPerPage,
    searchDocId,
    searchPIDate,
    searchDcNo,
    billType,
  } = req.query;

  let data;
  let totalCount;

  if (pagination) {
    const billedInwardItemIds = await prisma.purchaseBillEntryItems.findMany({
      where: { purchaseInwardId: { not: null } },
      select: {
        docId: true,
        styleItemId: true,
        sizeId: true,
        colorId: true,
        gsmId: true,
        purchaseInwardId: true,
      },
    });
    const billedKeys = new Set(
      billedInwardItemIds.map(
        (b) =>
          `${b.purchaseInwardId}_${b.styleItemId}_${b.sizeId}_${b.colorId}_${b.gsmId}`,
      ),
    );

    data = await prisma.inwardItems.findMany({
      where: {
        PurchaseInward: {
          docId: Boolean(searchDocId) ? { contains: searchDocId } : undefined,
          invNo: searchInvNo ? { contains: searchInvNo } : undefined,
          dcNo: Boolean(searchDcNo) ? { contains: searchDcNo } : undefined,
          AND: [
            {
              OR: [
                { receiptType: { not: "AGAINST_INVOICE" } },
                { receiptType: null },
                { receiptType: "" },
              ],
            },
          ],
          supplierId: supplierId ? parseInt(supplierId) : undefined,
          inwardType: billType ? { contains: billType } : undefined,
        },
      },
      include: {
        PurchaseInward: {
          select: {
            supplierId: true,
            docDate: true,
            docId: true,
            invNo: true,
            dcNo: true,
            id: true,
          },
        },
        Hsn: { select: { name: true, tax: true } },
        StyleItem: { select: { name: true } },
        Uom: { select: { name: true } },
        Size: { select: { name: true } },
        Color: { select: { name: true } },
        Gsm: { select: { name: true } },
      },
    });

    data = manualFilterSearchDataPIItems(searchPIDate, data);
    data = data.filter((item) => {
      const key = `${item.purchaseInwardId}_${item.styleItemId}_${item.sizeId}_${item.colorId}_${item.gsmId}`;
      return !billedKeys.has(key);
    });
    data = data.filter((i) => i.PurchaseInward?.supplierId == supplierId);
  } else {
    data = await prisma.inwardItems.findMany({
      where: {
        branchId: branchId ? parseInt(branchId) : undefined,
        active: active ? Boolean(active) : undefined,
      },
    });
  }

  return { statusCode: 0, data, totalCount };
}

export {
  get,
  getOne,
  create,
  update,
  remove,
  getPurchaseDetail,
  getPurchaseDetailStock,
  getPurchaseInwardItems,
  getOneBillEntry,
  getPurchaseInwardBillEntryItems,
};
