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

const REFERENCE_PAGE = "PACKING";

// ── Doc ID ────────────────────────────────────────────────────────────────────
async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.packing.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PK/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.packing.findMany({
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
      newDocId = `${branchObj.branchCode}/${shortCode}/PK/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PK/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
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

  let data = await prisma.packing.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      Store: { storeName: searchStore ? { contains: searchStore } : undefined },
      supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      Store: { select: { id: true, storeName: true } },
      packingBoxItems: true,
      supplier: { select: { id: true, name: true } },
      _count: {
        select: {
          packingBoxItems: true,
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

      let shouldTrigger = false;
      if (!log && hasApproval && activeConfigs.length > 0) {
        shouldTrigger = evaluateConfigs(activeConfigs, item);
      }

      return {
        ...item,
        status: item.active ? "Active" : "Inactive",
        approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
        childRecord: item._count?.packingBoxItems || 0,
      };
    }),
    nextDocId: newDocId,
    totalCount,
  };
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
async function getOne(id) {
  const data = await prisma.packing.findUnique({
    where: { id: parseInt(id) },
    include: {
      attachments: true,
      Store: { select: { locationId: true, storeName: true } },
      branch: { select: { branchName: true } },
      supplier: { select: { name: true } },
      packingBoxItems: {
        include: {
          box: { include: { boxStyleItems: true } },
          packingItems: {
            include: {
              stock: {
                include: {
                  Po: true,
                  ItemVariant: {
                    include: { styleMaster: { include: { modelName: true } } },
                  },
                  Hsn: true,
                  Color: true,
                  Uom: true,
                  Size: true,
                  printingDesign: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!data) return NoRecordFound("Packing");

  const childRecord = await prisma.packingBoxItems.count({
    where: { packingId: data.id },
  });

  //   const { hasApproval, module } = await getModuleApprovalSetup(
  //     REFERENCE_PAGE,
  //     data.branchId,
  //   );

  // ✅ FIX: evaluate if THIS specific record triggers any config (same as PO getOne)
  //   let isApprovalTriggered = false;
  //   if (!approvalLog && hasApproval && module) {
  //     const activeConfigs = await prisma.approvalConfig.findMany({
  //       where: { moduleId: module.id, branchId: data.branchId, active: true },
  //       include: {
  //         ConfigConditions: {
  //           include: { Field: true, Operator: true, CompareField: true },
  //         },
  //         approvalLevels: {
  //           include: { LevelUsers: true },
  //           orderBy: { levelNo: "asc" },
  //         },
  //       },
  //       orderBy: { priority: "asc" },
  //     });
  //     isApprovalTriggered = activeConfigs
  //       .filter(
  //         (c) =>
  //           c.approvalLevels?.length > 0 &&
  //           c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
  //       )
  //       .some((config) => evaluateConfigTrigger(config, data));
  //   }

  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord,
      // ✅ FIX: use isApprovalTriggered not hasApproval
      //   approvalStatus: getApprovalStatus(
      //     approvalLog,
      //     !!approvalLog || isApprovalTriggered,
      //   ),
      //   approvalLog: approvalLog ?? null,
    },
  };
}

// ── VALIDATION ─────────────────────────────────────────────────────────────────
async function validatePackingBoxItems(packingBoxItemsArray) {
  if (!packingBoxItemsArray || !Array.isArray(packingBoxItemsArray)) return null;
  for (const boxItem of packingBoxItemsArray) {
    if (!boxItem.boxId) continue;
    const validPackedItems = boxItem.packedItems?.filter((p) => p.id) || [];
    
    const boxStyleItems = await prisma.boxStyleItems.findMany({
      where: { boxId: parseInt(boxItem.boxId) },
      include: { styleMaster: true },
    });

    const box = await prisma.box.findUnique({
      where: { id: parseInt(boxItem.boxId) },
    });
    
    let expectedTotal = 0;
    const expectedQtyByStyle = {};
    for (const config of boxStyleItems) {
      expectedQtyByStyle[config.styleId] = config.qty || 0;
      expectedTotal += config.qty || 0;
    }

    if (validPackedItems.length !== expectedTotal) {
      return {
        statusCode: 1,
        message: `Total packed items (${validPackedItems.length}) does not match expected quantity (${expectedTotal}) for box ${box?.docId || boxItem.boxId}.`,
      };
    }

    if (validPackedItems.length > 0) {
      const packedStockRecords = await prisma.stock.findMany({
        where: { id: { in: validPackedItems.map((p) => parseInt(p.id)) } },
        include: { ItemVariant: true },
      });

      const packedQtyByStyle = {};
      for (const stock of packedStockRecords) {
        const styleId = stock.ItemVariant?.styleId;
        if (styleId) {
          packedQtyByStyle[styleId] = (packedQtyByStyle[styleId] || 0) + 1;
        }
      }

      for (const config of boxStyleItems) {
        const packedQty = packedQtyByStyle[config.styleId] || 0;
        if (packedQty !== config.qty) {
          return {
            statusCode: 1,
            message: `Packed quantity (${packedQty}) does not match expected quantity (${config.qty}) for style ${config.styleMaster?.name || config.styleId} in box ${box?.docId || boxItem.boxId}.`,
          };
        }
      }
    }
  }
  return null;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function create(body) {
  const {
    id,
    docDate,
    userDate,
    branchId,
    userId,
    locationId,
    storeId,
    supplierId,
    companyId,
    remarks,
    vehicleNo,
    packingBoxItems: rawInwardItems,
    finYearId,

    attachments,
  } = await body;
  console.log(body, "packingbody");

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
  );

  //   const { module, hasApproval } = await getModuleApprovalSetup(
  //     REFERENCE_PAGE,
  //     branchId,
  //   );

  const packingBoxItemsArray =
    typeof rawInwardItems === "string"
      ? JSON.parse(rawInwardItems)
      : rawInwardItems;
  const validationError = await validatePackingBoxItems(packingBoxItemsArray);
  if (validationError) return validationError;

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.packing.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        userDate: userDate ? new Date(userDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        companyId: parseInt(companyId),
        storeId: parseInt(storeId),
        supplierId: parseInt(supplierId),
        finYearId: parseInt(finYearId),
        remarks,
        vehicleNo,

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

    await createPackingBoxItems(
      tx,
      packingBoxItemsArray,
      data,
      userId,
      locationId,
      storeId,
    );
  });

  return { statusCode: 0, data };
}

// ── CREATE PACKING BOX ITEMS ──────────────────────────────────────────────────
async function createPackingBoxItems(
  tx,
  packingBoxItemsData,
  packing,
  userId,
  locationId,
  storeId,
) {
  const promises = packingBoxItemsData?.map(async (boxItem) => {
    // Create PackingBoxItems
    const createdBox = await tx.packingBoxItems.create({
      data: {
        packingId: parseInt(packing.id),
        boxId: parseInt(boxItem.boxId),
      },
    });

    const validPackedItems = boxItem.packedItems?.filter((p) => p.id);

    if (validPackedItems?.length > 0) {
      // Create PackingItems
      await tx.packingItems.createMany({
        data: validPackedItems.map((p) => ({
          packingBoxItemsId: createdBox.id,
          stockId: parseInt(p.id),
        })),
      });

      // Update Stock table for all matched items
      await tx.stock.updateMany({
        where: { id: { in: validPackedItems.map((p) => parseInt(p.id)) } },
        data: {
          itemStatus: "PACKED",
          packingStoreId: parseInt(storeId),
          packingBoxItemsId: createdBox.id,
        },
      });
    }
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
    remarks,
    vehicleNo,
    packingBoxItems: rawPackingBoxItems,
    attachments,
    submitApproval,
    finYearId,
  } = await body;

  const parseAttachments = JSON.parse(attachments || "[]");
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  // ✅ Always get module setup first
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  const dynamicInclude =
    hasApproval && module ? await buildIncludeForModule(module.id) : {};

  const dataFound = await prisma.packing.findUnique({
    where: { id: parseInt(id) },
    include: {
      ...dynamicInclude,
      packingBoxItems: { select: { id: true } },
      attachments: { select: { id: true, filePath: true } },
      supplier: true,
      branch: true,
    },
  });
  if (!dataFound) return { statusCode: 1, message: "Packing not found" };

  // ── Get latest approval log ───────────────────────────────────────────────
  const latestLog = await prisma.approvalLog.findFirst({
    where: { referenceId: parseInt(id), referencePage: REFERENCE_PAGE },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });

  // ✅ Block edits while PENDING
  if (latestLog?.status === "PENDING") {
    return {
      statusCode: 1,
      message: "This Packing is pending approval and cannot be edited.",
    };
  }

  // ✅ NEW: Approved Locking (Core Fields vs Remarks/Attachments)
  const isApproved = latestLog?.status === "APPROVED";

  if (isApproved) {
    const parsedItems =
      typeof rawPackingBoxItems === "string"
        ? JSON.parse(rawPackingBoxItems)
        : rawPackingBoxItems;

    const coreFieldsChanged =
      parseInt(dataFound.supplierId || 0) !== parseInt(supplierId || 0) ||
      parseInt(dataFound.storeId || 0) !== parseInt(storeId || 0) ||
      parseInt(dataFound.locationId || 0) !== parseInt(locationId || 0) ||
      (dataFound.docDate &&
        docDate &&
        new Date(dataFound.docDate).toISOString().split("T")[0] !==
          new Date(docDate).toISOString().split("T")[0]);

    if (coreFieldsChanged) {
      return {
        statusCode: 1,
        message:
          "This Packing is Approved. Only remarks, vehicle number, and attachments can be modified.",
      };
    }
  }

  // ✅ Determine approval action needed
  let needsFirstApproval = false;

  if (hasApproval && module) {
    if (!latestLog || latestLog?.status === "SUPERSEDED") {
      const prospectiveRecord = {
        ...dataFound,
        supplierId: parseInt(supplierId),
        supplier: dataFound.supplier,
      };
      const triggeredConfig = await getTriggeredConfig(
        branchId,
        module.id,
        prospectiveRecord,
      );
      if (triggeredConfig) needsFirstApproval = true;
    }
  }

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

  const fs = require("fs");
  const path = require("path");
  const unlinkFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join("./uploads", filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete file: ${fullPath}`, err.message);
    });
  };

  removedAttachments.forEach((att) => unlinkFile(att.filePath));
  updatedAttachmentsWithNewFile.forEach((att) => unlinkFile(att.filePath));

  const packingBoxItemsArray =
    typeof rawPackingBoxItems === "string"
      ? JSON.parse(rawPackingBoxItems)
      : rawPackingBoxItems;
  const validationError = await validatePackingBoxItems(packingBoxItemsArray);
  if (validationError) return validationError;

  let data;
  await prisma.$transaction(async (tx) => {
    if (!isApproved) {
      // Disconnect all stock associated with this packing
      await tx.stock.updateMany({
        where: { PackingBoxItems: { packingId: parseInt(id) } },
        data: {
          itemStatus: "INWARDED",
          packingStoreId: null,
          packingBoxItemsId: null,
        },
      });
      // Delete old packingBoxItems (which cascades and deletes packingItems)
      await tx.packingBoxItems.deleteMany({
        where: { packingId: parseInt(id) },
      });
    }

    data = await tx.packing.update({
      where: { id: parseInt(id) },
      data: {
        remarks,
        vehicleNo,
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

    if (!isApproved) {
      await createPackingBoxItems(
        tx,
        packingBoxItemsArray,
        data,
        userId,
        locationId,
        storeId,
      );
    }

    // ✅ CASE 2: No log / SUPERSEDED → first-time approval triggered
    if (needsFirstApproval && hasApproval && module) {
      const fullRecord = await tx.packing.findUnique({
        where: { id: parseInt(id) },
        include: {
          ...(await buildIncludeForModule(module.id)),
          supplier: true,
          branch: true,
          packingBoxItems: true,
        },
      });
      await createApprovalLog(
        tx,
        branchId,
        module.id,
        data.id,
        REFERENCE_PAGE,
        fullRecord,
        data.docId,
        userId,
      );
    }
    // ✅ CASE 3: Explicit resubmit after REJECTED/NOTAPPROVED
    else if (submitApproval && hasApproval && module) {
      await tx.approvalLog.deleteMany({
        where: {
          referenceId: parseInt(id),
          referencePage: REFERENCE_PAGE,
          status: { in: ["REJECTED", "NOTAPPROVED"] },
        },
      });
      const fullRecord = await tx.packing.findUnique({
        where: { id: parseInt(id) },
        include: {
          ...(await buildIncludeForModule(module.id)),
          supplier: true,
          branch: true,
          packingBoxItems: true,
        },
      });
      await createApprovalLog(
        tx,
        branchId,
        module.id,
        data.id,
        REFERENCE_PAGE,
        fullRecord,
        data.docId,
        userId,
      );
    }
  });

  const message = needsFirstApproval
    ? "Packing updated and submitted for approval."
    : submitApproval
      ? "Packing updated and submitted for approval."
      : "Packing updated successfully.";

  return { statusCode: 0, data, message };
}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const dataFound = await prisma.packing.findUnique({
    where: { id: parseInt(id) },
    include: { attachments: { select: { filePath: true } } },
  });

  if (!dataFound) return { statusCode: 1, message: "Packing not found" };

  const fs = require("fs");
  const path = require("path");
  dataFound?.attachments?.forEach((att) => {
    if (!att.filePath) return;
    const fullPath = path.join("./uploads", att.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete: ${fullPath}`, err.message);
    });
  });

  await prisma.approvalLog.deleteMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: parseInt(id) },
  });

  await prisma.$transaction(async (tx) => {
    // Disconnect all stock associated with this packing
    await tx.stock.updateMany({
      where: { PackingBoxItems: { packingId: parseInt(id) } },
      data: {
        itemStatus: "INWARDED",
        packingStoreId: null,
        packingBoxItemsId: null,
      },
    });

    await tx.packing.delete({
      where: { id: parseInt(id) },
    });
  });
  return { statusCode: 0, data: dataFound };
}

export { get, getOne, create, update, remove };
