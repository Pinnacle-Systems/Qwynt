import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.productionAllocation.findFirst({
    where: {
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");

  let newDocId = `${branchObj.branchCode}/${shortCode}/PA/1`;

  if (lastObject) {
    const parts = lastObject.docId.split("/");
    const lastNum = parseInt(parts.at(-1));

    if (!isNaN(lastNum)) {
      newDocId = `${branchObj.branchCode}/${shortCode}/PA/${lastNum + 1}`;
    }
  }

  return newDocId;
}

async function get(req) {
  const {
    branchId,
    finYearId,
    pagination,
    pageNumber,
    dataPerPage,
    searchDocNo,
    searchDocDate,
    searchJobCard,
    searchStyleItem,
  } = req.query;

  let finYearDate = await getFinYearStartTimeEndTime(finYearId);

  let data = await prisma.productionAllocation.findMany({
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
      StyleItem: {
        name: searchStyleItem ? { contains: searchStyleItem } : undefined,
      },
    },

    include: {
      JobCard: {
        select: {
          id: true,
          docId: true,
        },
      },

      StyleItem: {
        select: {
          id: true,
          name: true,
        },
      },

      allocationDetails: {
        include: {
          Process: true,
        },
        orderBy: {
          sequence: "asc",
        },
      },
      _count: {
        select: {
          productionOutwards: true,
        },
      },
    },

    orderBy: {
      id: "desc",
    },
  });
  if (searchDocDate) {
    data = data.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }

  let result = data?.map((item) => ({
    ...item,
    childRecord: item._count.productionOutwards,
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

async function getAllocationList(req) {
  const { branchId, companyId } = req.query;

  let data = await prisma.productionAllocation.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
    },
    select: {
      id: true,
      docId: true,
      jobCardId: true,
      allocationDetails: true,
    },
    orderBy: {
      docId: "desc",
    },
  });

  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.productionAllocation.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      JobCard: {
        include: {
          customer: true,
        },
      },

      StyleItem: true,

      allocationDetails: {
        include: {
          Process: true,
        },

        orderBy: {
          sequence: "asc",
        },
      },
      _count: {
        select: {
          productionOutwards: true,
        },
      },
    },
  });

  if (!data) {
    return NoRecordFound("Production Allocation");
  }

  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: data._count.productionOutwards,
    },
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
    styleItemId,
    allocationDetails,
    priority,
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

  const data = await prisma.productionAllocation.create({
    data: {
      docId: newDocId,

      docDate: docDate ? new Date(docDate) : null,

      remarks,

      createdById: parseInt(userId),

      jobCardId: parseInt(jobCardId),

      styleItemId: styleItemId ? parseInt(styleItemId) : null,

      branchId: parseInt(branchId),

      priority: priority || "MEDIUM",

      allocationDetails: {
        createMany: {
          data: allocationDetails.map((item) => ({
            processId: item.processId ? parseInt(item.processId) : null,

            type: item.type || null,

            sequence: item.seqNo ? parseInt(item.seqNo) : null,

            isInHouse: Boolean(item.isInHouse),

            isOutSide: Boolean(item.isOutSide),

            supplierId: item.supplierId ? parseInt(item.supplierId) : null,

            processRouteId: item.processRouteId
              ? parseInt(item.processRouteId)
              : null,

            isFrontAndBack: Boolean(item.isFrontAndBack),

            isFront: Boolean(item.isFront),
          })),
        },
      },
    },

    include: {
      allocationDetails: true,
    },
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
    styleItemId,
    allocationDetails,
    branchId,
    priority,
  } = body;

  const found = await prisma.productionAllocation.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!found) {
    return NoRecordFound("Production Allocation");
  }

  const data = await prisma.productionAllocation.update({
    where: {
      id: parseInt(id),
    },

    data: {
      docDate: docDate ? new Date(docDate) : null,

      branchId: parseInt(branchId),

      remarks,

      updatedById: parseInt(userId),

      jobCardId: parseInt(jobCardId),

      styleItemId: styleItemId ? parseInt(styleItemId) : null,

      priority: priority || "MEDIUM",

      allocationDetails: {
        deleteMany: {},

        createMany: {
          data: allocationDetails.map((item) => ({
            processId: item.processId ? parseInt(item.processId) : null,

            type: item.type || null,

            sequence: item.seqNo ? parseInt(item.seqNo) : null,

            isInHouse: Boolean(item.isInHouse),

            isOutSide: Boolean(item.isOutSide),

            supplierId: item.supplierId ? parseInt(item.supplierId) : null,

            processRouteId: item.processRouteId
              ? parseInt(item.processRouteId)
              : null,

            isFrontAndBack: Boolean(item.isFrontAndBack),

            isFront: Boolean(item.isFront),
          })),
        },
      },
    },

    include: {
      allocationDetails: true,
    },
  });

  return {
    statusCode: 0,
    data,
  };
}

async function remove(id) {
  const found = await prisma.productionAllocation.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!found) {
    return NoRecordFound("Production Allocation");
  }

  const data = await prisma.productionAllocation.delete({
    where: {
      id: parseInt(id),
    },
  });

  return {
    statusCode: 0,
    data,
  };
}

export { get, getOne, create, update, remove, getAllocationList };
