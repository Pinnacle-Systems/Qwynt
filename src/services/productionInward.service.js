// productionInward.service.js

import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import moment from "moment";

const REFERENCE_PAGE = "PRODUCTION INWARD";

// ─────────────────────────────────────────────────────────────
// DOC ID
// ─────────────────────────────────────────────────────────────

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.productionInward.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");

  let newDocId = `${branchObj.branchCode}/${shortCode}/PR/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.productionInward.findMany({
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

      newDocId = `${branchObj.branchCode}/${shortCode}/PR/${
        parseInt(maxDocId.split("/").at(-1)) + 1
      }`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PR/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
  }

  return newDocId;
}

// ─────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────

function getProductionInwardStatus(inward) {
  const inwardDetails = inward.inwardDetails || [];

  const totalReceived = inwardDetails.reduce(
    (sum, item) => sum + (item.receivedQty || 0),
    0,
  );

  const totalAccepted = inwardDetails.reduce(
    (sum, item) => sum + (item.acceptedQty || 0),
    0,
  );

  const totalWastage = inwardDetails.reduce(
    (sum, item) => sum + (item.wastageQty || 0),
    0,
  );

  if (totalReceived === 0) return "Pending";

  if (totalAccepted === totalReceived) return "Fully Accepted";

  if (totalWastage > 0) return "Wastage Added";

  return "Partially Accepted";
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocNo,
    searchDocDate,
    searchSupplier,
    finYearId,
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

  let data = await prisma.productionInward.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,

      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,

      docId: Boolean(searchDocNo) ? { contains: searchDocNo } : undefined,

      Supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },

    include: {
      Supplier: {
        select: {
          id: true,
          name: true,
        },
      },

      Branch: {
        select: {
          id: true,
          branchName: true,
        },
      },

      JobCard: {
        select: {
          id: true,
          docId: true,
        },
      },

      ProductionOutward: {
        select: {
          id: true,
          docId: true,
        },
      },

      _count: {
        select: {
          processBillDtls: true,
        },
      },

      inwardDetails: true,
    },

    orderBy: {
      id: "desc",
    },
  });

  let totalCount = data.length;

  if (searchDocDate) {
    data = data.filter((item) =>
      String(getDateFromDateTime(item.docDate)).includes(searchDocDate),
    );
  }

  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

  return {
    statusCode: 0,

    data: data.map((item) => {
      const childRecord = item._count.processBillDtls;

      let status = "Not Billed";

      // 🔹 Against Invoice → always fully billed
      if (item.receiptType === "AGAINST_INVOICE") {
        status = "Fully Billed";
      }

      // 🔹 Other receipt types
      else if (childRecord > 0) {
        status = "Fully Billed";
      }

      return {
        ...item,
        status,
        childRecord,
      };
    }),

    nextDocId: newDocId,

    totalCount,
  };
}

// ─────────────────────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────────────────────

async function getOne(id) {
  const data = await prisma.productionInward.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      Supplier: true,

      Branch: true,

      JobCard: true,

      ProductionOutward: true,

      inwardDetails: {
        include: {
          inwardProcessDtls: true,

          ProductionOutwardDtl: true,

          ProductionOutwardDtl: {
            include: {
              productionInwardDtls: {
                select: {
                  id: true,
                  acceptedQty: true,
                  wastageQty: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    return NoRecordFound("Production Inward");
  }

  const inwardDetails = data.inwardDetails.map((item) => {
    const sentQty = item.ProductionOutwardDtl?.sentQty || 0;

    const alreadyReceivedQty =
      item.ProductionOutwardDtl?.productionInwardDtls.reduce(
        (sum, inward) =>
          sum + (inward.acceptedQty || 0) + (inward.wastageQty || 0),
        0,
      ) || 0;

    const pendingQty = sentQty - alreadyReceivedQty;

    return {
      ...item,
      sentQty,
      alreadyReceivedQty: alreadyReceivedQty - item.receivedQty,
      pendingQty: pendingQty + item.receivedQty,
    };
  });

  return {
    statusCode: 0,

    data: {
      ...data,
      inwardDetails,
      status: getProductionInwardStatus(data),
    },
  };
}

async function getInwardJobCardDtls(req) {
  const {
    supplierId,
    pagination,
    searchJobCard,
    searchDocId,
    searchDocDate,
    processId,
  } = req.query;

  let data = [];

  const inwardedData = await prisma.processBillDtl.findMany({
    where: {
      productionInwardId: {
        not: null,
      },
    },

    select: {
      productionInwardId: true,
    },
  });

  const billedInwardIds = [
    ...new Set(
      inwardedData.map((item) => item.productionInwardId).filter(Boolean),
    ),
  ];

  const whereCondition = {
    ProductionInward: {
      supplierId: supplierId ? parseInt(supplierId) : undefined,

      docId: searchDocId ? { contains: searchDocId } : undefined,

      receiptType: "WITHOUT_INVOICE",

      docDate: searchDocDate
        ? {
            gte: moment
              .utc(searchDocDate, "DD-MM-YYYY")
              .startOf("day")
              .toDate(),
            lte: moment.utc(searchDocDate, "DD-MM-YYYY").endOf("day").toDate(),
          }
        : undefined,
    },
    JobCard: {
      docId: searchJobCard ? { contains: searchJobCard } : undefined,
    },
    productionInwardId: {
      notIn: billedInwardIds,
    },
  };

  data = await prisma.productionInwardDtl.findMany({
    where: whereCondition,

    include: {
      ProductionInward: {
        select: {
          id: true,
          docId: true,
          docDate: true,
          supplierId: true,

          Supplier: {
            select: {
              id: true,
              name: true,
            },
          },

          JobCard: {
            select: {
              id: true,
              docId: true,
            },
          },
        },
      },
      JobCard: {
        select: {
          id: true,
          docId: true,
        },
      },
      inwardProcessDtls: true,
    },

    orderBy: {
      id: "desc",
    },
  });

  // Group by productionOutwardId
  // const groupedData = Object.values(
  //   data.reduce((acc, item) => {
  //     const key = item.productionInwardId;

  //     if (!acc[key]) {
  //       acc[key] = {
  //         id: item.id,
  //         productionInwardId: item.productionInwardId,

  //         // combine process ids here
  //         processes: item.processId ? [item.processId] : [],

  //         acceptedQty: item.acceptedQty,
  //         sequence: item.sequence,
  //         prevProcessId: item.prevProcessId,

  //         ProductionInward: item.ProductionInward,
  //         jobCardId: item.jobCardId,
  //       };
  //     } else {
  //       // push additional process ids
  //       if (item.processId && !acc[key].processes.includes(item.processId)) {
  //         acc[key].processes.push(item.processId);
  //       }
  //     }

  //     return acc;
  //   }, {}),
  // );

  return {
    statusCode: 0,
    data,
    totalCount: data.length,
  };
}

// ─────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────

async function create(body) {
  const {
    userId,
    branchId,
    finYearId,
    docDate,
    remarks,
    productionOutwardId,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    vehicleNo,
    receiptType,
    invNo,
    netBillValue,
    discountType,
    discountValue,
    taxTemplateId,
    jobCardId,
    inwardDetails,
    draftSave,
  } = body;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate.startDateStartTime,
        finYearDate.endDateEndTime,
      )
    : "";

  const newDocId = await getNextDocId(
    branchId,
    shortCode,
    finYearDate?.startDateStartTime,
    finYearDate?.endDateEndTime,
    draftSave,
  );

  const data = await prisma.$transaction(async (tx) => {
    const inward = await tx.productionInward.create({
      data: {
        docId: newDocId,

        docDate: docDate ? new Date(docDate) : null,

        remarks,

        createdById: parseInt(userId),

        branchId: branchId ? parseInt(branchId) : null,

        supplierId: supplierId ? parseInt(supplierId) : null,

        // productionOutwardId: productionOutwardId
        //   ? parseInt(productionOutwardId)
        //   : null,

        // jobCardId: jobCardId ? parseInt(jobCardId) : null,

        inwardType,

        dcNo,

        dcDate: dcDate ? new Date(dcDate) : null,

        vehicleNo,

        receiptType,

        invNo,

        netBillValue: netBillValue ? parseFloat(netBillValue) : null,

        discountType,

        discountValue: discountValue ? parseFloat(discountValue) : null,

        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,

        inwardDetails: {
          create: inwardDetails.map((item) => ({
            outwardDetailId: item.outwardDetailId
              ? parseInt(item.outwardDetailId)
              : null,

            receivedQty: parseFloat(item.receivedQty || 0),

            wastageQty: parseFloat(item.wastageQty || 0),

            acceptedQty:
              parseFloat(item.receivedQty || 0) -
              parseFloat(item.wastageQty || 0),

            // processId: item.processId ? parseInt(item.processId) : null,

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionOutwardId: item.productionOutwardId
              ? parseInt(item.productionOutwardId)
              : null,

            inwardProcessDtls: {
              create: (item.processes || []).map((processId) => ({
                processId: parseInt(processId),
              })),
            },
          })),
        },
      },

      include: {
        inwardDetails: true,
      },
    });
    await Promise.all(
      inwardDetails.flatMap((item) =>
        (item.processes || []).map(async (processId) => {
          const route = await tx.processRoute.findFirst({
            where: {
              jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,
              processId: processId ? parseInt(processId) : null,
            },
          });

          if (!route) return;

          const receivedQty = parseFloat(item.receivedQty || 0);
          const wastageQty = parseFloat(item.wastageQty || 0);
          const acceptedQty = parseFloat(item.acceptedQty || 0);
          // Total processed quantity
          const processedQty = receivedQty + wastageQty;

          const totalCompletedQty = (route.completedQty || 0) + acceptedQty;

          const totalWastageQty = (route.wastageQty || 0) + wastageQty;

          const actualQty = route.actualQty || 0;

          const pendingQty = Math.max(
            actualQty - (totalCompletedQty + totalWastageQty),
            0,
          );

          let status = "PARTIALLY_COMPLETED";

          if (pendingQty === 0) {
            status = "COMPLETED";
          }

          await tx.processRoute.update({
            where: {
              id: route.id,
            },

            data: {
              status,
              completedQty: totalCompletedQty,
              wastageQty: totalWastageQty,
              pendingQty,
            },
          });
        }),
      ),
    );

    return inward;
  });

  return {
    statusCode: 0,
    data,
  };
}

// ─────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────

async function update(id, body) {
  const {
    userId,
    branchId,
    docDate,
    remarks,
    // productionOutwardId,
    supplierId,
    inwardType,
    dcNo,
    dcDate,
    vehicleNo,
    receiptType,
    invNo,
    netBillValue,
    discountType,
    discountValue,
    taxTemplateId,
    // jobCardId,
    inwardDetails,
  } = body;

  const dataFound = await prisma.productionInward.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      inwardDetails: true,
    },
  });

  if (!dataFound) {
    return NoRecordFound("Production Inward");
  }

  const removedItems = dataFound.inwardDetails.filter(
    (oldItem) =>
      !inwardDetails.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );

  const removedIds = removedItems.map((item) => parseInt(item.id));

  let data;

  await prisma.$transaction(async (tx) => {
    for (const removedItem of removedItems) {
      const processDtl = await tx.inwardProcessDtl.findMany({
        where: {
          productionInwardDtlId: removedItem.id,
        },
      });

      for (const proc of processDtl) {
        await tx.processRoute.updateMany({
          where: {
            jobCardId: removedItem.jobCardId
              ? parseInt(removedItem.jobCardId)
              : null,

            processId: proc.processId ? parseInt(proc.processId) : null,
          },

          data: {
            status: "PENDING",
          },
        });
      }
    }
    if (removedIds.length > 0) {
      await tx.productionInwardDtl.deleteMany({
        where: {
          id: {
            in: removedIds,
          },
        },
      });
    }

    data = await tx.productionInward.update({
      where: {
        id: parseInt(id),
      },

      data: {
        updatedById: parseInt(userId),

        branchId: branchId ? parseInt(branchId) : null,

        docDate: docDate ? new Date(docDate) : null,

        remarks,

        // productionOutwardId: productionOutwardId
        //   ? parseInt(productionOutwardId)
        //   : null,

        supplierId: supplierId ? parseInt(supplierId) : null,

        inwardType,

        dcNo,

        dcDate: dcDate ? new Date(dcDate) : null,

        vehicleNo,

        receiptType,

        invNo,

        netBillValue: netBillValue ? parseFloat(netBillValue) : null,

        discountType,

        discountValue: discountValue ? parseFloat(discountValue) : null,

        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,

        // jobCardId: jobCardId ? parseInt(jobCardId) : null,
      },
    });

    // UPDATE / CREATE DETAILS

    for (const item of inwardDetails) {
      if (item.id) {
        await tx.productionInwardDtl.update({
          where: {
            id: parseInt(item.id),
          },

          data: {
            outwardDetailId: item.outwardDetailId
              ? parseInt(item.outwardDetailId)
              : null,

            receivedQty: parseFloat(item.receivedQty || 0),

            wastageQty: parseFloat(item.wastageQty || 0),

            acceptedQty:
              parseFloat(item.receivedQty || 0) -
              parseFloat(item.wastageQty || 0),

            // processId: item.processId ? parseInt(item.processId) : null,

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,
            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionOutwardId: item.productionOutwardId
              ? parseInt(item.productionOutwardId)
              : null,
          },
        });
        await tx.inwardProcessDtl.deleteMany({
          where: {
            productionInwardDtlId: parseInt(item.id),
          },
        });

        await tx.inwardProcessDtl.createMany({
          data: (item.processes || []).map((processId) => ({
            productionInwardDtlId: parseInt(item.id),
            processId: parseInt(processId),
          })),
        });
      } else {
        const createdDtl = await tx.productionInwardDtl.create({
          data: {
            productionInwardId: parseInt(id),

            outwardDetailId: item.outwardDetailId
              ? parseInt(item.outwardDetailId)
              : null,

            receivedQty: parseFloat(item.receivedQty || 0),

            wastageQty: parseFloat(item.wastageQty || 0),

            acceptedQty:
              parseFloat(item.receivedQty || 0) -
              parseFloat(item.wastageQty || 0),

            // processId: item.processId ? parseInt(item.processId) : null,

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,
            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionOutwardId: item.productionOutwardId
              ? parseInt(item.productionOutwardId)
              : null,
          },
        });
        await tx.inwardProcessDtl.createMany({
          data: (item.processes || []).map((processId) => ({
            productionInwardDtlId: createdDtl.id,
            processId: parseInt(processId),
          })),
        });
      }
    }
    const affectedProcesses = new Set();

    for (const item of inwardDetails) {
      for (const processId of item.processes || []) {
        affectedProcesses.add(`${item.jobCardId}_${processId}`);
      }
    }

    for (const key of affectedProcesses) {
      const [jobCardId, processId] = key.split("_");

      const route = await tx.processRoute.findFirst({
        where: {
          jobCardId: parseInt(jobCardId),
          processId: parseInt(processId),
        },
      });

      if (!route) continue;

      const inwards = await tx.productionInwardDtl.findMany({
        where: {
          jobCardId: parseInt(jobCardId),

          inwardProcessDtls: {
            some: {
              processId: parseInt(processId),
            },
          },
        },
        select: {
          acceptedQty: true,
          wastageQty: true,
        },
      });

      const completedQty = inwards.reduce(
        (sum, row) => sum + (row.acceptedQty || 0),
        0,
      );

      const wastageQty = inwards.reduce(
        (sum, row) => sum + (row.wastageQty || 0),
        0,
      );

      const actualQty = route.actualQty || 0;

      const pendingQty = Math.max(actualQty - (completedQty + wastageQty), 0);

      let status = "NOT_STARTED";

      if (completedQty > 0 || wastageQty > 0) {
        status = pendingQty === 0 ? "COMPLETED" : "PARTIALLY_COMPLETED";
      }

      await tx.processRoute.update({
        where: {
          id: route.id,
        },
        data: {
          completedQty,
          wastageQty,
          pendingQty,
          status,
        },
      });
    }
  });

  return {
    statusCode: 0,
    data,
  };
}

// ─────────────────────────────────────────────────────────────
// REMOVE
// ─────────────────────────────────────────────────────────────

async function remove(id) {
  const dataFound = await prisma.productionInward.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      inwardDetails: {
        include: {
          inwardProcessDtls: true,
        },
      },
    },
  });

  if (!dataFound) {
    return NoRecordFound("Production Inward");
  }
  const affectedProcesses = new Set();

  for (const item of dataFound.inwardDetails) {
    for (const proc of item.inwardProcessDtls || []) {
      affectedProcesses.add(`${item.jobCardId}_${proc.processId}`);
    }
  }
  const data = await prisma.$transaction(async (tx) => {
    await tx.productionInward.delete({
      where: {
        id: parseInt(id),
      },
    });
    for (const key of affectedProcesses) {
      const [jobCardId, processId] = key.split("_");

      const route = await tx.processRoute.findFirst({
        where: {
          jobCardId: parseInt(jobCardId),
          processId: parseInt(processId),
        },
      });

      if (!route) continue;

      const inwards = await tx.productionInwardDtl.findMany({
        where: {
          jobCardId: parseInt(jobCardId),

          inwardProcessDtls: {
            some: {
              processId: parseInt(processId),
            },
          },
        },

        select: {
          acceptedQty: true,
          wastageQty: true,
        },
      });

      const completedQty = inwards.reduce(
        (sum, row) => sum + (row.acceptedQty || 0),
        0,
      );

      const wastageQty = inwards.reduce(
        (sum, row) => sum + (row.wastageQty || 0),
        0,
      );

      const actualQty = route.actualQty || 0;

      const pendingQty = Math.max(actualQty - (completedQty + wastageQty), 0);

      let status = "NOT_STARTED";

      if (completedQty > 0 || wastageQty > 0) {
        status = pendingQty === 0 ? "COMPLETED" : "PARTIALLY_COMPLETED";
      }

      await tx.processRoute.update({
        where: {
          id: route.id,
        },

        data: {
          completedQty,
          wastageQty,
          pendingQty,
          status,
        },
      });
    }
  });

  return {
    statusCode: 0,
    message: "Production Inward Deleted Successfully",
  };
}

export { get, getOne, create, update, remove, getInwardJobCardDtls };
