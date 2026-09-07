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
        select: { packingBoxItems: true, saledBoxes: true },
      },
      stocks: {
        select: { itemStatus: true },
      },
    },
  });

  const mappedData = data.map((d) => {
    let dispatchStatus = "NOT SOLD";
    if (d.stocks && d.stocks.length > 0) {
      const total = d.stocks.length;
      const returned = d.stocks.filter(s => s.itemStatus === "RETURNED").length;
      const saled = d.stocks.filter(s => s.itemStatus === "SOLD").length;

      if (returned > 0 && returned === total) {
        dispatchStatus = "SOLD AND RETURNED";
      } else if (returned > 0) {
        dispatchStatus = "PARTIALLY RETURNED";
      } else if (saled === total) {
        dispatchStatus = "SOLD";
      } else if (saled > 0) {
        dispatchStatus = "SOLD";
      }
    } else if (d._count?.saledBoxes > 0) {
      dispatchStatus = "SOLD";
    }

    return {
      ...d,
      childRecord: d._count?.packingBoxItems || 0,
      saledCount: d._count?.saledBoxes || 0,
      dispatchStatus,
    };
  });
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
        select: { packingBoxItems: true, saledBoxes: true },
      },
      stocks: {
        select: { itemStatus: true },
      },
    },
  });
  if (!data) return NoRecordFound("Box");

  let dispatchStatus = "NOT SOLD";
  if (data.stocks && data.stocks.length > 0) {
    const total = data.stocks.length;
    const returned = data.stocks.filter(s => s.itemStatus === "RETURNED").length;
    const saled = data.stocks.filter(s => s.itemStatus === "SOLD").length;

    if (returned > 0 && returned === total) {
      dispatchStatus = "SOLD AND RETURNED";
    } else if (returned > 0) {
      dispatchStatus = "PARTIALLY RETURNED";
    } else if (saled === total) {
      dispatchStatus = "SOLD";
    } else if (saled > 0) {
      dispatchStatus = "SOLD";
    }
  } else if (data._count?.saledBoxes > 0) {
    dispatchStatus = "SOLD";
  }

  const mappedData = {
    ...data,
    childRecord: data._count?.packingBoxItems || 0,
    saledCount: data._count?.saledBoxes || 0,
    dispatchStatus,
    styles: data.boxStyleItems.map((item) => ({
      ...item,
      mrp: item.mrpPrice,
      qty: item.qty,
    })),
  };

  return { statusCode: 0, data: mappedData };
}

async function getSearch(req) {
  const searchKey = req.query.searchKey;
  console.log(searchKey, "searchKey");

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
      Size: true,
      _count: {
        select: { packingBoxItems: true, saledBoxes: true },
      },
      stocks: {
        select: { itemStatus: true },
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

  const mappedSearchData = data.map((d) => {
    let dispatchStatus = "NOT SOLD";
    if (d.stocks && d.stocks.length > 0 && d.stocks[0].itemStatus && d.stocks[0].itemStatus !== "PACKED") {
      dispatchStatus = d.stocks[0].itemStatus;
    } else if (d._count?.saledBoxes > 0) {
      dispatchStatus = "SOLD";
    }

    return {
      ...d,
      childRecord: d._count?.packingBoxItems || 0,
      saledCount: d._count?.saledBoxes || 0,
      dispatchStatus,
    };
  });

  return { statusCode: 0, data: mappedSearchData };
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
        docDate: docDate ? new Date(docDate) : null,
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
  console.log(id, "This APi call happends");

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
      SalesDelivery: { select: { docId: true } },
      SalesReturn: { select: { docId: true } },
      PurchaseInward: { select: { docId: true } },
    },
  });

  return { statusCode: 0, data: stockData };
}

async function getBoxForSales(req) {
  const searchKey = req.query.searchKey;
  console.log(searchKey, "searchKeySales");

  const { companyId, active } = req.query;

  // 1. Find the box by docId (searchKey)
  const exactMatch = await prisma.box.findFirst({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      docId: searchKey,
    },
  });

  if (!exactMatch) {
    return { statusCode: 1, message: "Box not found!" };
  }

  const saledCount = await prisma.stock.count({
    where: {
      boxId: exactMatch.id,
      isSaled: true,
    },
  });

  if (saledCount > 0) {
    return { statusCode: 1, message: "Box already Saled" };
  }

  // 2. Fetch stock items for this boxId
  const stockItems = await prisma.stock.findMany({
    where: {
      boxId: exactMatch.id,
      isPacked: true,
      isSaled: false,
      itemStatus: "PACKED",
    },
    include: {
      ItemVariant: {
        include: { styleMaster: { include: { modelName: true } } },
      },
      StyleMaster: true,
      Hsn: true,
      printingDesign: true,
      Size: true,
      Color: true,
      Uom: true,
    },
  });

  exactMatch.boxStyleItems = stockItems;
  return { statusCode: 0, data: [exactMatch] };
}
export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getBoxReport,
  getBoxForSales,
};
