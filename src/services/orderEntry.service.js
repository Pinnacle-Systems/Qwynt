import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
  buildDateRange,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import fs from "fs";
import path from "path";
import {
  getModuleApprovalSetup,
  getApprovalStatus,
  evaluateConfigs,
  buildIncludeForModule,
  createApprovalLog,
} from "../utils/approvalHelper.js";
import moment from "moment";
import { itemGroup, jobCard } from "../routes/index.js";
const REFERENCE_PAGE = "ORDER ENTRY";

async function getNextDocId(
  branchId,
  shortCode,
  startTime,
  endTime,
  saveType,
  docId,
  isUpdate,
) {
  // Case 1: Draft save
  if (saveType) {
    return "Draft Save";
  } else if (isUpdate === "drift") {
    lastObject = await prisma.orderEntry.findFirst({
      where: {
        branchId: parseInt(branchId),
        draftSave: false,
        AND: [
          { createdAt: { gte: startTime } },
          { createdAt: { lte: endTime } },
        ],
      },
      orderBy: { id: "desc" },
    });
    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}${getYearShortCode(
      new Date(),
    )}/ORD/1`;

    if (lastObject) {
      newDocId = `${branchObj.branchCode}${getYearShortCode(new Date())}/ORD/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }

    return newDocId;
  } else {
    let lastObject = await prisma.orderEntry.findFirst({
      where: {
        branchId: parseInt(branchId),
        AND: [
          {
            createdAt: {
              gte: startTime,
            },
          },
          {
            createdAt: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        id: "desc",
      },
    });

    const branchObj = await getTableRecordWithId(branchId, "branch");
    let newDocId = `${branchObj.branchCode}/${shortCode}/ORD/1`;
    if (lastObject) {
      if (lastObject.docId === "Draft Save") {
        const records = await prisma.orderEntry.findMany({
          select: {
            docId: true,
          },
          where: {
            branchId: parseInt(branchId),
            AND: [
              {
                createdAt: {
                  gte: startTime,
                },
              },
              {
                createdAt: {
                  lte: endTime,
                },
              },
            ],
          },
        });
        const maxDocId = records.reduce((max, current) => {
          const currentNo = Number(current.docId.split("/").pop());
          const maxNo = max ? Number(max.split("/").pop()) : 0;

          return currentNo > maxNo ? current.docId : max;
        }, null);
        newDocId = `${branchObj.branchCode}/${shortCode}/ORD/${
          parseInt(maxDocId.split("/").at(-1)) + 1
        }`;
      } else {
        newDocId = `${branchObj.branchCode}/${shortCode}/ORD/${
          parseInt(lastObject.docId.split("/").at(-1)) + 1
        }`;
      }
    }
    return newDocId;
  }
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchOrderType,
    finYearId,
    searchCustomer,
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
  let data;
  let totalCount;
  data = await prisma.orderEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            {
              createdAt: {
                gte: finYearDate.startTime,
              },
            },
            {
              createdAt: {
                lte: finYearDate.endTime,
              },
            },
          ]
        : undefined,
      docId: Boolean(serachDocNo)
        ? {
            contains: serachDocNo,
          }
        : undefined,
      orderType: Boolean(searchOrderType)
        ? { contains: searchOrderType }
        : undefined,
      customer: {
        name: searchCustomer ? { contains: searchCustomer } : undefined,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          JobCard: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  totalCount = data.length;

  // if (pagination) {
  //   data = data.slice(
  //     (pageNumber - 1) * parseInt(dataPerPage),
  //     pageNumber * dataPerPage,
  //   );
  // }

  // ── approval setup check ──────────────────────────────────────────────────
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );

  // ── fetch all relevant approval logs in one query ─────────────────────────
  const orderIds = data.map((o) => o.id);

  const approvalLogs = await prisma.approvalLog.findMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: { in: orderIds } },
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
  });

  const approvalLogMap = approvalLogs.reduce((acc, log) => {
    acc[log.referenceId] = log;
    return acc;
  }, {});

  // ── fetch active configs only if approval is set up ───────────────────────
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
        })
      : [];

  // ── resolve approval status per record ───────────────────────────────────
  let resolvedData = data.map((order) => {
    const log = approvalLogMap[order.id] ?? null;

    let shouldTrigger = false;
    if (!log && hasApproval && activeConfigs.length > 0) {
      shouldTrigger = evaluateConfigs(activeConfigs, order);
    }

    return {
      ...order,
      childRecord: order._count.JobCard,
      approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
    };
  });

  if (pagination) {
    resolvedData = resolvedData.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * parseInt(dataPerPage),
    );
  }

  return {
    statusCode: 0,
    data: resolvedData,
    nextDocId: newDocId,
    totalCount,
  };
}

async function getRefList(req) {
  const { branchId, companyId, isRefDistinct } = req.query;

  let data = await prisma.orderEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
    },
    select: {
      id: true,
      refNo: true,
      docId: true,
      customerId: true,
      orderItems: {
        select: {
          id: true,
          styleItemId: true,
          jobCards: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              jobCards: true,
            },
          },
        },
      },
    },
    distinct: isRefDistinct === "true" ? ["refNo"] : ["docId"],
    orderBy: {
      refNo: "asc",
    },
  });

  // ── only for non-distinct ref mode ─────────────────────────
  if (isRefDistinct !== "true") {
    const { module, hasApproval } = await getModuleApprovalSetup(
      REFERENCE_PAGE,
      branchId,
    );

    const orderIds = data.map((o) => o.id);

    const approvalLogs = await prisma.approvalLog.findMany({
      where: {
        referencePage: REFERENCE_PAGE,
        referenceId: { in: orderIds },
      },
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
            User: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const approvalLogMap = approvalLogs.reduce((acc, log) => {
      acc[log.referenceId] = log;
      return acc;
    }, {});

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
                include: {
                  Field: true,
                  Operator: true,
                  CompareField: true,
                },
              },
              approvalLevels: {
                include: {
                  LevelUsers: true,
                },
                orderBy: {
                  levelNo: "asc",
                },
              },
            },
          })
        : [];

    data = data.map((order) => {
      const totalItems = order.orderItems.length;

      const createdItems = order.orderItems.filter(
        (item) => item._count.jobCards > 0,
      ).length;

      let creationStatus = "NOT_CREATED";

      if (totalItems > 0 && createdItems === totalItems) {
        creationStatus = "FULLY_CREATED";
      } else if (createdItems > 0) {
        creationStatus = "PARTIALLY_CREATED";
      }
      const log = approvalLogMap[order.id] ?? null;

      let shouldTrigger = false;

      if (!log && hasApproval && activeConfigs.length > 0) {
        shouldTrigger = evaluateConfigs(activeConfigs, order);
      }

      return {
        ...order,
        creationStatus,
        approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
        orderItems: order.orderItems.map((item) => ({
          ...item,
          childRecordCount: item._count.jobCards,
        })),
      };
    });
  }

  return { statusCode: 0, data };
}

async function geOrderItemsList(req) {
  const { orderEntryId } = req.query;

  let data = await prisma.orderItems.findMany({
    where: {
      orderEntryId: parseInt(orderEntryId),
    },
    select: {
      id: true,
      styleItemId: true,
      itemGroupId: true,
      ItemGroup: {
        select: {
          name: true,
        },
      },
      StyleItem: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          jobCards: true,
        },
      },
    },
  });

  const result = data.map((item) => ({
    id: item.styleItemId,
    childRecord: item._count.jobCards,
    name: item.StyleItem?.name || "",
    itemGroupId: item.itemGroupId,
    itemGroupName: item.ItemGroup?.name,
  }));

  return { statusCode: 0, data: result };
}

async function getOne(id) {
  const data = await prisma.orderEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: true,
      orderItems: {
        include: {
          sizeBreakup: true,
          ItemGroup: {
            select: {
              name: true,
            },
          },
          Hsn: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              jobCards: true,
            },
          },
        },
      },
      Branch: {
        select: {
          branchName: true,
        },
      },
      customer: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          JobCard: true,
        },
      },
    },
  });

  if (!data) return NoRecordFound("Purchase Inward");
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    data.branchId,
  );
  let log = null;
  let shouldTrigger = false;

  if (hasApproval && module) {
    // 🔹 get approval log for this record
    log = await prisma.approvalLog.findFirst({
      where: {
        referencePage: REFERENCE_PAGE,
        referenceId: data.id,
      },
      include: {
        LevelLogs: {
          include: {
            User: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 🔹 if no log → check config condition
    if (!log) {
      const activeConfigs = await prisma.approvalConfig.findMany({
        where: {
          moduleId: module.id,
          branchId: parseInt(data.branchId),
          active: true,
        },
        include: {
          ConfigConditions: {
            include: {
              Field: true,
              Operator: true,
              CompareField: true,
            },
          },
        },
      });

      if (activeConfigs.length > 0) {
        shouldTrigger = evaluateConfigs(activeConfigs, data);
      }
    }
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      orderItems: data.orderItems.map((item) => ({
        ...item,
        childRecord: item._count.jobCards,
        _count: undefined,
      })),
      approvalStatus: getApprovalStatus(log, !!log || shouldTrigger),
      childRecord: data._count.JobCard,
      approvalLog: log,
    },
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    docDate,
    customerId,
    orderType,
    deliveryDate,
    remarks,
    requirements,
    finYearId,
    orderQty,
    attachments,
    draftSave,
    termsAndCondition,
    termsId,
    orderItems,
    productionType,
    proFormaId,
    refNo,
    isRepeatedPI,
    validDays,
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
  // ✅ Single universal check OUTSIDE transaction — covers all 3 scenarios
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );
  let data;
  // const safeorderQty =
  //   orderQty && !isNaN(Number(orderQty)) ? parseFloat(orderQty) : null;
  const parsedOrderItems =
    typeof orderItems === "string" ? JSON.parse(orderItems) : orderItems;
  const safeOrderItems =
    parsedOrderItems?.length > 0
      ? parsedOrderItems.map((item) => ({
          styleItemId: item?.styleItemId ? parseInt(item.styleItemId) : null,
          itemGroupId: item?.itemGroupId ? parseInt(item.itemGroupId) : null,
          trackingType: item?.trackingType,
          orderQty:
            item?.orderQty && !isNaN(Number(item.orderQty))
              ? parseInt(item.orderQty)
              : null,
          uomId: item?.uomId ? parseInt(item.uomId) : null,
          hsnId: item?.hsnId ? parseInt(item.hsnId) : null,
          sizeTemplateId: item?.sizeTemplateId
            ? parseInt(item.sizeTemplateId)
            : null,
          sizeBreakup:
            item?.sizeBreakup?.length > 0
              ? {
                  create: item.sizeBreakup.map((s) => ({
                    sizeId: s.sizeId ? parseInt(s.sizeId) : null,
                    qty: s.qty ? parseInt(s.qty) : null,
                    barcodeFrom: s.barcodeFrom,
                    barcodeTo: s.barcodeTo,
                  })),
                }
              : undefined,
          // sizeId: item?.sizeId ? parseInt(item.sizeId) : null,
        }))
      : [];
  let finalRefNo = refNo || null;
  if (productionType === "SAMPLE" && newDocId) {
    const parts = newDocId.split("/");
    // ["MP", "26-27", "ORD", "1"]

    if (parts.length >= 4) {
      const finYear = parts[1]; // 26-27
      const number = parts[3]; // 1

      finalRefNo = `${finYear}/SAM/${number}`;
    }
  }
  const validTo = moment(docDate).add(validDays, "days").endOf("day").toDate();
  await prisma.$transaction(async (tx) => {
    data = await tx.orderEntry.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        customerId: parseInt(customerId),
        orderType,
        productionType,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        remarks,
        requirements,
        termsId: termsId ? parseInt(termsId) : null,
        termsAndCondition,
        proFormaId: proFormaId ? parseInt(proFormaId) : null,
        isRepeatedPI: isRepeatedPI === true || isRepeatedPI === "true",
        refNo: finalRefNo ?? "",
        validDays: validDays ? parseInt(validDays) : null,
        validTo: validTo,
        orderItems:
          safeOrderItems.length > 0
            ? {
                create: safeOrderItems,
              }
            : undefined,
        attachments:
          JSON.parse(attachments)?.length > 0
            ? {
                createMany: {
                  data: JSON.parse(attachments).map((sub) => ({
                    date: sub?.date ? new Date(sub?.date) : undefined,
                    filePath: sub?.filePath ? sub?.filePath : undefined,
                    name: sub?.name ? sub?.name : undefined,
                  })),
                },
              }
            : undefined,
      },
    });
    // ✅ Only runs if: module exists AND active config exists for this branch
    // If PO has no rules configured → hasApproval=false → skipped, form saves normally
    if (hasApproval && module) {
      // ✅ Dynamic include — pulls every relation any Field master references
      const includeClause = await buildIncludeForModule(module.id);

      const fullRecord = await tx.orderEntry.findUnique({
        where: { id: data.id },
        include: includeClause,
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
  return { statusCode: 0, data };
}

async function update(id, body, files) {
  const {
    userId,
    branchId,
    docDate,
    customerId,
    orderType,
    deliveryDate,
    remarks,
    requirements,
    orderQty,
    attachments,
    termsId,
    termsAndCondition,
    orderItems,
    submitApproval,
    productionType,
    proFormaId,
    refNo,
    isRepeatedPI,
    validDays,
  } = await body;

  const safeorderQty =
    orderQty && !isNaN(Number(orderQty)) ? parseFloat(orderQty) : null;

  const parseAttachments = JSON.parse(attachments || "[]");
  const incomingIds = parseAttachments
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));

  const parsedItems = JSON.parse(orderItems || "[]");
  const incomingItemIds = parsedItems
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));
  const { module, hasApproval } = await getModuleApprovalSetup(
    REFERENCE_PAGE,
    branchId,
  );
  let data;
  const dataFound = await prisma.orderEntry.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      attachments: { select: { id: true, filePath: true } },
      orderItems: true,
    },
  });
  if (!dataFound) return NoRecordFound("Purchase Inward");
  const removedItemIds = dataFound.orderItems
    .filter((item) => !incomingItemIds.includes(item.id))
    .map((item) => item.id);
  const removedAttachments = dataFound.attachments.filter(
    (existing) => !incomingIds.includes(existing.id),
  );
  const updatedAttachmentsWithNewFile = dataFound.attachments.filter(
    (existing) => {
      const incoming = parseAttachments.find(
        (i) => parseInt(i.id) === existing.id,
      );
      // If incoming filePath is empty/changed and old had a file
      return (
        incoming &&
        existing.filePath &&
        (!incoming.filePath || incoming.filePath !== existing.filePath)
      );
    },
  );

  // ✅ Unlink removed attachment files
  const unlinkFile = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join("./uploads", filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete file: ${fullPath}`, err.message);
      else console.log(`Deleted file: ${fullPath}`);
    });
  };

  // Delete files for removed attachments
  removedAttachments.forEach((att) => unlinkFile(att.filePath));

  // Delete old files for attachments where file was replaced
  updatedAttachmentsWithNewFile.forEach((att) => unlinkFile(att.filePath));
  let finalRefNo = refNo || null;
  if (productionType === "SAMPLE" && dataFound.docId) {
    const parts = dataFound.docId.split("/");
    if (parts.length >= 4) {
      const finYear = parts[1];
      const number = parts[3];

      finalRefNo = `${finYear}/SAM/${number}`;
    }
  }
  const validTo = moment(docDate).add(validDays, "days").endOf("day").toDate();
  await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({
      where: {
        referencePage: REFERENCE_PAGE,
        referenceId: {
          in: removedItemIds,
        },
      },
    });
    data = await tx.orderEntry.update({
      where: {
        id: parseInt(id),
      },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        customerId: parseInt(customerId),
        orderType,
        productionType,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        remarks,
        requirements,
        orderQty: safeorderQty,
        termsAndCondition,
        termsId: termsId ? parseInt(termsId) : null,
        proFormaId: proFormaId ? parseInt(proFormaId) : null,
        isRepeatedPI: isRepeatedPI === true || isRepeatedPI === "true",
        refNo: finalRefNo ?? "",
        validDays: validDays ? parseInt(validDays) : null,
        validTo: validTo,
        orderItems: {
          deleteMany: incomingItemIds.length
            ? { id: { notIn: incomingItemIds } }
            : {}, // delete all if no items sent
          update: parsedItems
            .filter((item) => item.id)
            .map((item) => ({
              where: { id: parseInt(item.id) },
              data: {
                styleItemId: item.styleItemId
                  ? parseInt(item.styleItemId)
                  : null,
                itemGroupId: item.itemGroupId
                  ? parseInt(item.itemGroupId)
                  : null,
                trackingType: item.trackingType,
                sizeTemplateId: item.sizeTemplateId
                  ? parseInt(item.sizeTemplateId)
                  : null,
                hsnId: item.hsnId ? parseInt(item.hsnId) : null,

                orderQty: item.orderQty ? parseInt(item.orderQty) : null,
                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                gsmId: item.gsmId ? parseInt(item.gsmId) : null,
                sizeBreakup: {
                  deleteMany: {},
                  create:
                    item.sizeBreakup?.length > 0
                      ? item.sizeBreakup.map((s) => ({
                          sizeId: s.sizeId ? parseInt(s.sizeId) : null,
                          qty: s.qty ? parseInt(s.qty) : null,
                          barcodeFrom: s.barcodeFrom,
                          barcodeTo: s.barcodeTo,
                        }))
                      : [],
                },
              },
            })),

          create: parsedItems
            .filter((item) => !item.id)
            .map((item) => ({
              styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,
              itemGroupId: item.itemGroupId ? parseInt(item.itemGroupId) : null,
              trackingType: item.trackingType,
              sizeTemplateId: item.sizeTemplateId
                ? parseInt(item.sizeTemplateId)
                : null,
              hsnId: item.hsnId ? parseInt(item.hsnId) : null,
              orderQty: item.orderQty ? parseInt(item.orderQty) : null,
              sizeId: item.sizeId ? parseInt(item.sizeId) : null,
              uomId: item.uomId ? parseInt(item.uomId) : null,
              gsmId: item.gsmId ? parseInt(item.gsmId) : null,
              sizeBreakup:
                item.sizeBreakup?.length > 0
                  ? {
                      create: item.sizeBreakup.map((s) => ({
                        sizeId: s.sizeId ? parseInt(s.sizeId) : null,
                        qty: s.qty ? parseInt(s.qty) : null,
                        barcodeFrom: s.barcodeFrom,
                        barcodeTo: s.barcodeTo,
                      })),
                    }
                  : undefined,
            })),
        },
        attachments: {
          deleteMany: {
            ...(incomingIds.length > 0 && {
              id: { notIn: incomingIds },
            }),
          },

          update: parseAttachments
            .filter((item) => item.id)
            .map((sub) => ({
              where: { id: parseInt(sub.id) },
              data: {
                date: sub?.date ? new Date(sub?.date) : undefined,
                filePath: (() => {
                  const matchedFile = files?.find(
                    (f) => f.originalname === sub.filePath,
                  );
                  return matchedFile
                    ? matchedFile.filename
                    : sub.filePath || undefined;
                })(),
                name: sub?.name ? sub?.name : undefined,
              },
            })),

          create: parseAttachments
            .filter((item) => !item.id)
            .map((sub) => ({
              date: sub?.date ? new Date(sub?.date) : undefined,
              filePath: (() => {
                const matchedFile = files?.find(
                  (f) => f.originalname === sub.filePath,
                );
                return matchedFile ? matchedFile.filename : sub.filePath;
              })(),
              name: sub?.name ? sub?.name : undefined,
            })),
        },
      },
    });
    if (submitApproval && hasApproval && module) {
      await tx.approvalLog.deleteMany({
        where: {
          referenceId: parseInt(id),
          referencePage: REFERENCE_PAGE,
          status: { in: ["REJECTED", "NOTAPPROVED"] },
        },
      });

      const fullRecord = await tx.orderEntry.findUnique({
        where: { id: parseInt(id) },
        include: await buildIncludeForModule(module.id),
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

  return { statusCode: 0, data };
}

async function remove(id) {
  const orderEntryId = parseInt(id);
  await prisma.approvalLog.deleteMany({
    where: { referencePage: REFERENCE_PAGE, referenceId: orderEntryId },
  });

  const dataFound = await prisma.orderEntry.findUnique({
    where: { id: orderEntryId },
    include: {
      attachments: { select: { filePath: true } },
      orderItems: { select: { id: true } },
    },
  });
  await Promise.all(
    dataFound.orderItems.map((item) =>
      prisma.notification.deleteMany({
        where: {
          referenceId: item.id,
          referencePage: REFERENCE_PAGE,
        },
      }),
    ),
  );

  dataFound?.attachments?.forEach((att) => {
    if (!att.filePath) return;
    const fullPath = path.join("./uploads", att.filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.warn(`Could not delete: ${fullPath}`, err.message);
    });
  });
  const data = await prisma.orderEntry.delete({
    where: {
      id: orderEntryId,
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove, getRefList, geOrderItemsList };
