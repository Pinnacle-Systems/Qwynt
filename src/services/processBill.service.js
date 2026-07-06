// processBill.service.js

import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";

const REFERENCE_PAGE = "PROCESS BILL";

// ─────────────────────────────────────────────────────────────
// DOC ID
// ─────────────────────────────────────────────────────────────

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.processBill.findFirst({
    where: {
      branchId: parseInt(branchId),

      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },

    orderBy: {
      id: "desc",
    },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");

  let newDocId = `${branchObj.branchCode}/${shortCode}/PB/1`;

  if (lastObject) {
    newDocId = `${branchObj.branchCode}/${shortCode}/PB/${
      parseInt(lastObject.docId.split("/").at(-1)) + 1
    }`;
  }

  return newDocId;
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

  let data = await prisma.processBill.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,

      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,

      docId: searchDocNo ? { contains: searchDocNo } : undefined,

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

      processBillDtls: true,
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

    data,

    nextDocId: newDocId,

    totalCount,
  };
}

// ─────────────────────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────────────────────

async function getOne(id) {
  const data = await prisma.processBill.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      Supplier: true,

      Branch: true,

      processBillDtls: {
        include: {
          billingProcesses: true,

          JobCard: true,

          ProductionInward: true,
        },
      },
    },
  });

  if (!data) {
    return NoRecordFound("Process Bill");
  }

  return {
    statusCode: 0,

    data,
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
    supplierId,
    netBillValue,
    discountType,
    discountValue,
    taxTemplateId,
    billDetails,
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

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.processBill.create({
      data: {
        docId: newDocId,

        docDate: docDate ? new Date(docDate) : null,

        remarks,

        createdById: parseInt(userId),

        branchId: branchId ? parseInt(branchId) : null,

        supplierId: supplierId ? parseInt(supplierId) : null,

        netBillValue: netBillValue ? parseFloat(netBillValue) : null,

        discountType,

        discountValue: discountValue ? parseFloat(discountValue) : null,

        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,

        processBillDtls: {
          create: billDetails.map((item) => ({
            acceptedQty: parseFloat(item.acceptedQty || 0),

            billedQty: parseFloat(item.billedQty || 0),

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionInwardId: item.productionInwardId
              ? parseInt(item.productionInwardId)
              : null,

            billingProcesses: {
              create: (item.processes || []).map((processId) => ({
                processId: parseInt(processId),
              })),
            },
          })),
        },
      },

      include: {
        processBillDtls: true,
      },
    });
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
    supplierId,
    netBillValue,
    discountType,
    discountValue,
    taxTemplateId,
    billDetails,
  } = body;

  const dataFound = await prisma.processBill.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      processBillDtls: true,
    },
  });

  if (!dataFound) {
    return NoRecordFound("Process Bill");
  }

  const removedItems = dataFound.processBillDtls.filter(
    (oldItem) =>
      !billDetails.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );

  const removedIds = removedItems.map((item) => parseInt(item.id));

  let data;

  await prisma.$transaction(async (tx) => {
    if (removedIds.length > 0) {
      await tx.processBillDtl.deleteMany({
        where: {
          id: {
            in: removedIds,
          },
        },
      });
    }

    data = await tx.processBill.update({
      where: {
        id: parseInt(id),
      },

      data: {
        updatedById: parseInt(userId),

        branchId: branchId ? parseInt(branchId) : null,

        docDate: docDate ? new Date(docDate) : null,

        remarks,

        supplierId: supplierId ? parseInt(supplierId) : null,

        netBillValue: netBillValue ? parseFloat(netBillValue) : null,

        discountType,

        discountValue: discountValue ? parseFloat(discountValue) : null,

        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,
      },
    });

    for (const item of billDetails) {
      if (item.id) {
        await tx.processBillDtl.update({
          where: {
            id: parseInt(item.id),
          },

          data: {
            acceptedQty: parseFloat(item.acceptedQty || 0),

            billedQty: parseFloat(item.billedQty || 0),

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionInwardId: item.productionInwardId
              ? parseInt(item.productionInwardId)
              : null,
          },
        });

        await tx.billingProcess.deleteMany({
          where: {
            processBillDtlId: parseInt(item.id),
          },
        });

        await tx.billingProcess.createMany({
          data: (item.processes || []).map((processId) => ({
            processBillDtlId: parseInt(item.id),
            processId: parseInt(processId),
          })),
        });
      } else {
        const createdDtl = await tx.processBillDtl.create({
          data: {
            processBilldId: parseInt(id),

            acceptedQty: parseFloat(item.acceptedQty || 0),

            billedQty: parseFloat(item.billedQty || 0),

            price: item.price ? parseFloat(item.price) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            jobCardId: item.jobCardId ? parseInt(item.jobCardId) : null,

            productionInwardId: item.productionInwardId
              ? parseInt(item.productionInwardId)
              : null,
          },
        });

        await tx.billingProcess.createMany({
          data: (item.processes || []).map((processId) => ({
            processBillDtlId: createdDtl.id,
            processId: parseInt(processId),
          })),
        });
      }
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
  const dataFound = await prisma.processBill.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!dataFound) {
    return NoRecordFound("Process Bill");
  }

  await prisma.processBill.delete({
    where: {
      id: parseInt(id),
    },
  });

  return {
    statusCode: 0,
    message: "Process Bill Deleted Successfully",
  };
}

export { get, getOne, create, update, remove };
