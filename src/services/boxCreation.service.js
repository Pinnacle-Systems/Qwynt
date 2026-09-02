import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import {
  getDateFromDateTime,
  getDateTimeRange,
  getYearShortCodeForFinYear,
} from "../utils/helper.js";
import moment from "moment";

import { getTableRecordWithId } from "../utils/helperQueries.js";

async function getNextDocId(branchId, shortCode, startTime, endTime) {
  let lastObject = await prisma.box.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });
  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/BOX/1`;
  if (lastObject) {
    newDocId = `${branchObj.branchCode}/${shortCode}/BOX/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
  }
  return newDocId;
}

async function get(req) {
  const { branchId, companyId, finYearId } = req.query;
  let finYearDate = await getFinYearStartTimeEndTime(finYearId);
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";
  const data = await prisma.box.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      finYearId: finYearId ? parseInt(finYearId) : undefined,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      Size: true,
      boxStyleItems: {
        include: {
          styleMaster: {
            include: { modelName: true },
          },
        },
      },
      _count: {
        select: { packingBoxItems: true },
      },
    },
  });

  const mappedData = data.map((d) => ({
    ...d,
    childRecord: d._count?.packingBoxItems || 0,
  }));
  const nextDocId = finYearDate
    ? await getNextDocId(
        branchId,
        shortCode,
        finYearDate?.startDateStartTime,
        finYearDate?.endDateEndTime,
      )
    : "";

  return {
    statusCode: 0,
    data: mappedData,
    nextDocId,
  };
}

async function getOne(id) {
  const data = await prisma.box.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      boxStyleItems: {
        include: {
          styleMaster: {
            include: { modelName: true },
          },
        },
      },
      _count: {
        select: { packingBoxItems: true },
      },
    },
  });
  if (!data) return NoRecordFound("Box");

  const mappedData = {
    ...data,
    childRecord: data._count?.packingBoxItems || 0,
    styles: data.boxStyleItems.map((item) => ({
      ...item,
      mrp: item.mrpPrice,
      qty: item.qty,
    })),
  };

  return { statusCode: 0, data: mappedData };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.box.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          docId: {
            contains: searchKey,
          },
        },
      ],
    },
    include: {
      _count: {
        select: { packingBoxItems: true },
      },
      boxStyleItems: {
        include: {
          styleMaster: {
            include: { modelName: true },
          },
        },
      },
    },
  });

  const exactMatch = data.find((b) => b.docId === searchKey);
  if (exactMatch && exactMatch._count?.packingBoxItems > 0) {
    return { statusCode: 1, message: "Box already packed!" };
  }

  return { statusCode: 0, data: data };
}

async function create(body) {
  const {
    companyId,
    userId,
    branchId,
    finYearId,
    docDate,
    sizeId,
    boxStyleItems,
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
  );

  const data = await prisma.box.create({
    data: {
      docId: newDocId,
      docDate: docDate ? new Date(docDate) : null,
      sizeId: parseInt(sizeId),
      companyId: parseInt(companyId),
      branchId: parseInt(branchId),
      finYearId: parseInt(finYearId),
      createdById: userId ? parseInt(userId) : undefined,
      boxStyleItems: {
        create: boxStyleItems.map((item) => ({
          styleId: parseInt(item.styleId),
          mrpPrice: parseFloat(item.mrp) || 0,
          qty: parseInt(item.qty) || 0,
        })),
      },
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { userId, docDate, sizeId, boxStyleItems } = await body;
  const dataFound = await prisma.box.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Box");

  const data = await prisma.$transaction(async (tx) => {
    // Delete existing BoxStyleItems
    await tx.boxStyleItems.deleteMany({
      where: { boxId: parseInt(id) },
    });

    // Update Box and create new BoxStyleItems
    return await tx.box.update({
      where: {
        id: parseInt(id),
      },
      data: {
        // docDate: docDate ? getDateFromDateTime(docDate) : undefined,
        sizeId: parseInt(sizeId),
        updatedById: userId ? parseInt(userId) : undefined,
        updatedAt: new Date(),
        boxStyleItems: {
          create: boxStyleItems.map((item) => ({
            styleId: parseInt(item.styleId),
            mrpPrice: parseFloat(item.mrp) || 0,
            qty: parseInt(item.qty) || 0,
          })),
        },
      },
    });
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.box.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

async function getBoxReport(req) {
  const { id } = req.params;

  const packingBoxItems = await prisma.packingBoxItems.findMany({
    where: { boxId: parseInt(id) },
    select: { id: true },
  });

  const packingBoxItemIds = packingBoxItems.map((pbi) => pbi.id);

  if (packingBoxItemIds.length === 0) {
    return { statusCode: 0, data: [] };
  }

  const stockData = await prisma.stock.findMany({
    where: { packingBoxItemsId: { in: packingBoxItemIds } },
    include: {
      ItemVariant: {
        include: { styleMaster: { include: { modelName: true } } },
      },
      printingDesign: true,
      Color: true,
      Size: true,
      Uom: true,
      Po: true,
      Hsn: true,
      PackingBoxItems: {
        include: { packing: true },
      },
    },
  });

  return { statusCode: 0, data: stockData };
}

export { get, getOne, getSearch, create, update, remove, getBoxReport };
