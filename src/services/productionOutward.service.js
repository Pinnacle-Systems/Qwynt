// productionOutward.service.js

import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import moment from "moment";

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.productionOutward.findFirst({
    where: {
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");

  let newDocId = `${branchObj.branchCode}/${shortCode}/PIS/1`;

  if (lastObject) {
    const parts = lastObject.docId.split("/");
    const lastNum = parseInt(parts.at(-1));
    if (!isNaN(lastNum)) {
      newDocId = `${branchObj.branchCode}/${shortCode}/PIS/${lastNum + 1}`;
    }
  }

  return newDocId;
}

async function get(req) {
  const {
    finYearId,
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocNo,
    searchDocDate,
    searchJobCard,
    searchSupplier,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  let data = await prisma.productionOutward.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      docId: searchDocNo ? { contains: searchDocNo } : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startDateStartTime } },
            { createdAt: { lte: finYearDate.endDateEndTime } },
          ]
        : undefined,
      JobCard: {
        docId: searchJobCard ? { contains: searchJobCard } : undefined,
      },
      Supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      Supplier: true,
      JobCard: true,
      ProductionAllocation: true,
      productionOutwardDetails: {
        include: {
          Process: true,
          ProductionAllocationDtl: true,
        },
        orderBy: { sequence: "asc" },
      },
      _count: {
        select: {
          productionInwardDtls: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });
  if (searchDocDate) {
    data = data.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  let result = data?.map((item) => ({
    ...item,
    childRecord: item._count.productionInwardDtls,
  }));
  if (pagination) {
    result = result.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * parseInt(dataPerPage),
    );
  }

  return {
    statusCode: 0,
    totalCount: data.length,
    data: result,
  };
}

async function getOne(id) {
  const data = await prisma.productionOutward.findUnique({
    where: { id: parseInt(id) },
    include: {
      Supplier: true,
      JobCard: true,
      ProductionAllocation: true,
      productionOutwardDetails: {
        include: {
          Process: true,
          ProductionAllocationDtl: true,
        },
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!data) return NoRecordFound("Production Outward");

  return { statusCode: 0, data };
}

async function getOutwardJobCardDtls(req) {
  const {
    supplierId,
    pagination,
    searchJobCard,
    searchDocId,
    searchDocDate,
    processId,
  } = req.query;

  let data = [];

  const whereCondition = {
    ProductionOutward: {
      supplierId: supplierId ? parseInt(supplierId) : undefined,

      docId: searchDocId ? { contains: searchDocId } : undefined,

      docDate: searchDocDate
        ? {
            gte: moment
              .utc(searchDocDate, "DD-MM-YYYY")
              .startOf("day")
              .toDate(),
            lte: moment.utc(searchDocDate, "DD-MM-YYYY").endOf("day").toDate(),
          }
        : undefined,

      JobCard: {
        docId: searchJobCard ? { contains: searchJobCard } : undefined,
      },
    },

    processId: processId ? parseInt(processId) : undefined,
  };

  data = await prisma.productionOutwardDtl.findMany({
    where: whereCondition,

    include: {
      productionInwardDtls: {
        select: {
          receivedQty: true, // or acceptedQty based on your logic
          acceptedQty: true,
          wastageQty: true,
        },
      },
      ProductionOutward: {
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

      Process: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      id: "asc",
    },
  });

  // Group by productionOutwardId
  const groupedData = Object.values(
    data.reduce((acc, item) => {
      const key = item.productionOutwardId;

      const alreadyReceivedQty = (item.productionInwardDtls || []).reduce(
        (sum, inward) =>
          sum +
          (inward.acceptedQty || inward.receivedQty || 0) +
          (inward.wastageQty || 0),
        0,
      );

      const wastageQty = (item.productionInwardDtls || []).reduce(
        (sum, inward) => sum + (inward.wastageQty || 0),
        0,
      );

      const pendingQty = (item.sentQty || 0) - alreadyReceivedQty;
      if (!acc[key]) {
        acc[key] = {
          id: item.id,
          productionOutwardId: item.productionOutwardId,

          // combine process ids here
          processes: item.processId ? [item.processId] : [],

          sentQty: item.sentQty || 0,
          alreadyReceivedQty,

          wastageQty,

          pendingQty,
          sequence: item.sequence,
          prevProcessId: item.prevProcessId,
          productionAllocationDtlId: item.productionAllocationDtlId,

          ProductionOutward: item.ProductionOutward,
        };
      } else {
        // push additional process ids
        if (item.processId && !acc[key].processes.includes(item.processId)) {
          acc[key].processes.push(item.processId);
        }
        acc[key].alreadyReceivedQty += alreadyReceivedQty;
        acc[key].wastageQty += wastageQty;
        acc[key].pendingQty =
          (acc[key].sentQty || 0) - acc[key].alreadyReceivedQty;
      }

      return acc;
    }, {}),
  );
  const filterData = groupedData.filter((item) => item.pendingQty > 0);

  return {
    statusCode: 0,
    data: filterData,
    totalCount: filterData.length,
  };
}

async function create(body) {
  const {
    userId,
    branchId,
    finYearId,
    docDate,
    remarks,
    jobCardId,
    productionAllocationId,
    supplierId,
    outwardDetails,
    dcNo,
    vehicleNo,
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
  );

  const data = await prisma.$transaction(async (tx) => {
    const outward = await tx.productionOutward.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        remarks,
        branchId: branchId ? parseInt(branchId) : null,
        createdById: parseInt(userId),
        jobCardId: parseInt(jobCardId),
        productionAllocationId: productionAllocationId
          ? parseInt(productionAllocationId)
          : null,
        supplierId: supplierId ? parseInt(supplierId) : null,
        dcNo,
        vehicleNo,
        productionOutwardDetails: {
          createMany: {
            data: outwardDetails.map((item) => ({
              processId: item.processId ? parseInt(item.processId) : null,

              sentQty: item.sentQty ? parseFloat(item.sentQty) : 0,

              sequence: item.sequence ? parseInt(item.sequence) : null,

              // productionAllocationDtlId: item.productionAllocationDtlId
              //   ? parseInt(item.productionAllocationDtlId)
              //   : null,

              // prevProcessId: item.prevProcessId
              //   ? parseInt(item.prevProcessId)
              //   : null,
            })),
          },
        },
      },

      include: {
        productionOutwardDetails: true,
      },
    });

    await Promise.all(
      outwardDetails.map((item) =>
        tx.processRoute.updateMany({
          where: {
            jobCardId: parseInt(jobCardId),
            processId: item.processId ? parseInt(item.processId) : null,
            sequence: item.sequence ? parseInt(item.sequence) : null,
          },

          data: {
            status: "IN_PROGRESS",
            pendingQty: item.sentQty ? parseInt(item.sentQty) : 0,
            actualQty: item.sentQty ? parseInt(item.sentQty) : 0,
          },
        }),
      ),
    );

    return outward;
  });

  return {
    statusCode: 0,
    data,
  };
}

async function update(id, body) {
  const {
    userId,
    docDate,
    remarks,
    jobCardId,
    productionAllocationId,
    supplierId,
    outwardDetails,
    dcNo,
    vehicleNo,
  } = body;
  const found = await prisma.productionOutward.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      productionOutwardDetails: true,
    },
  });

  if (!found) {
    return NoRecordFound("Production Outward");
  }

  const data = await prisma.$transaction(async (tx) => {
    // OLD DETAILS
    const oldDetails = found.productionOutwardDetails || [];

    // OLD KEYS
    const oldKeys = oldDetails.map(
      (item) => `${item.processId}_${item.sequence}`,
    );

    // NEW KEYS
    const newKeys = outwardDetails.map(
      (item) => `${item.processId}_${item.sequence}`,
    );

    // REMOVED ROWS
    const removedRows = oldDetails.filter(
      (item) => !newKeys.includes(`${item.processId}_${item.sequence}`),
    );

    // UPDATE OUTWARD
    const updated = await tx.productionOutward.update({
      where: {
        id: parseInt(id),
      },

      data: {
        docDate: docDate ? new Date(docDate) : null,

        remarks,

        updatedById: parseInt(userId),

        jobCardId: parseInt(jobCardId),

        productionAllocationId: productionAllocationId
          ? parseInt(productionAllocationId)
          : null,

        supplierId: supplierId ? parseInt(supplierId) : null,

        dcNo,
        vehicleNo,

        productionOutwardDetails: {
          deleteMany: {},

          createMany: {
            data: outwardDetails.map((item) => ({
              processId: item.processId ? parseInt(item.processId) : null,

              sentQty: item.sentQty ? parseFloat(item.sentQty) : 0,

              sequence: item.sequence ? parseInt(item.sequence) : null,
            })),
          },
        },
      },

      include: {
        productionOutwardDetails: true,
      },
    });

    // =========================================
    // COMPLETE CURRENT ROUTES
    // =========================================

    await Promise.all(
      outwardDetails.map((item) =>
        tx.processRoute.updateMany({
          where: {
            jobCardId: parseInt(jobCardId),

            processId: item.processId ? parseInt(item.processId) : null,

            sequence: item.sequence ? parseInt(item.sequence) : null,
          },

          data: {
            status: "IN_PROGRESS",

            pendingQty: item.sentQty ? parseInt(item.sentQty) : 0,

            actualQty: item.sentQty ? parseInt(item.sentQty) : 0,
          },
        }),
      ),
    );

    // =========================================
    // RESET REMOVED ROUTES
    // =========================================

    await Promise.all(
      removedRows.map((item) =>
        tx.processRoute.updateMany({
          where: {
            jobCardId: parseInt(jobCardId),

            processId: item.processId,

            sequence: item.sequence,
          },

          data: {
            status: "NOT_STARTED",
            pendingQty: null,
            actualQty: null,
          },
        }),
      ),
    );

    return updated;
  });

  return {
    statusCode: 0,
    data,
  };
}

async function remove(id) {
  const found = await prisma.productionOutward.findUnique({
    where: { id: parseInt(id) },
    include: {
      productionOutwardDetails: true,
    },
  });

  if (!found) return NoRecordFound("Production Outward");

  const data = await prisma.$transaction(async (tx) => {
    // Reset process route status
    await Promise.all(
      found.productionOutwardDetails.map((item) =>
        tx.processRoute.updateMany({
          where: {
            jobCardId: found.jobCardId,
            processId: item.processId,
            sequence: item.sequence,
          },
          data: {
            status: "NOT_STARTED",
            pendingQty: null,
            actualQty: null,
            completedQty: null,
            wastageQty: null,
          },
        }),
      ),
    );

    // Delete outward
    const deleted = await tx.productionOutward.delete({
      where: { id: parseInt(id) },
    });

    return deleted;
  });

  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove, getOutwardJobCardDtls };
