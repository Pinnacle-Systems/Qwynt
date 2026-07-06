import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
  getYearShortCode,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";

const REFERENCE_PAGE = "PURCHASE CANCEL";

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.purchaseCancel.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PC/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.purchaseCancel.findMany({
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
      newDocId = `${branchObj.branchCode}/${shortCode}/PC/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PC/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}

function manualFilterSearchData(searchDocDate, data) {
  return data.filter((item) =>
    searchDocDate
      ? String(getDateFromDateTime(item.docDate)).includes(searchDocDate)
      : true,
  );
}

async function get(req) {
  const {
    branchId,
    active,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchSupplier,
  } = req.query;

  let data = await prisma.purchaseCancel.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      active: active ? Boolean(active) : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      supplier: {
        name: Boolean(searchSupplier)
          ? { contains: searchSupplier }
          : undefined,
      },
    },
    include: { supplier: { select: { name: true } } },
    orderBy: { docId: "desc" },
  });

  data = manualFilterSearchData(searchDocDate, data);
  const totalCount = data.length;

  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

  let newDocId = await getNextDocId(branchId, "", undefined, undefined);
  return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}

async function getOne(id) {
  const data = await prisma.purchaseCancel.findUnique({
    where: { id: parseInt(id) },
    include: { purchaseCancelItems: true },
  });
  if (!data) return NoRecordFound("purchaseCancel");

  const itemWithPoQty = await Promise.all(
    data.purchaseCancelItems.map(async (item) => {
      const [poQty, inwardItems, cancelAgg] = await Promise.all([
        prisma.poItems.findFirst({
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
          select: { qty: true },
        }),
        prisma.inwardItems.findMany({
          where: {
            styleItemId: item.styleItemId,
            poId: item.poId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            gsmId: item.gsmId,
            colorId: item.colorId,
          },
          select: { inwardQty: true, purchaseInwardId: true },
        }),
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
            purchaseCancelId: { not: data.id },
          },
          _sum: { cancelQty: true },
        }),
      ]);

      const inwardQty = inwardItems.reduce(
        (sum, i) => sum + (i.inwardQty ?? 0),
        0,
      );
      const inwardIds = inwardItems
        .map((i) => i.purchaseInwardId)
        .filter(Boolean);
      const alreadyCancelQty = cancelAgg?._sum?.cancelQty ?? 0;

      let returnQty = 0;
      if (inwardIds.length > 0) {
        const returnAgg = await prisma.purchaseReturnItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            purchaseInwardId: { in: inwardIds },
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            gsmId: item.gsmId,
          },
          _sum: { returnQty: true },
        });
        returnQty = returnAgg._sum.returnQty ?? 0;
      }

      return {
        ...item,
        poQty: poQty?.qty ?? 0,
        alreadyInwardQty: inwardQty,
        alreadyReturnQty: returnQty,
        alreadyCancelQty,
        balQty: (poQty?.qty ?? 0) - (alreadyCancelQty + inwardQty) + returnQty,
      };
    }),
  );

  return {
    statusCode: 0,
    data: { ...data, purchaseCancelItems: itemWithPoQty, childRecord: 0 },
  };
}

// ✅ FIX: was prisma.purchaseReturn (wrong model)
async function getSearch(req) {
  const { searchKey } = req.params;
  const { active } = req.query;
  const data = await prisma.purchaseCancel.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
      OR: [{ docId: { contains: searchKey } }],
    },
  });
  return { statusCode: 0, data };
}

async function create(body) {
  const {
    userId,
    branchId,
    storeId,
    docDate,
    supplierId,
    poType,
    remarks,
    termsAndCondition,
    cancelItems,
    finYearId,
    draftSave,
    locationId,
    termsId,
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

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseCancel.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        supplierId: parseInt(supplierId),
        poType,
        remarks,
        termsAndCondition,
        locationId: parseInt(locationId),
        termsId: termsId ? parseInt(termsId) : null,
      },
    });
    await createCancelItems(
      tx,
      cancelItems,
      data,
      userId,
      locationId,
      storeId,
      poType,
    );
  });
  return { statusCode: 0, data };
}

async function createCancelItems(
  tx,
  cancelItems,
  purchaseReturn,
  userId,
  locationId,
  storeId,
  poType,
) {
  const promises = cancelItems?.map(async (stockDetail) => {
    return await tx.purchaseCancelItems.create({
      data: {
        purchaseCancelId: parseInt(purchaseReturn.id),
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
        cancelQty: stockDetail?.cancelQty
          ? parseInt(stockDetail.cancelQty)
          : null,
        poType: poType || "",
        poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
        batchNo: stockDetail?.batchNo || null,
        poDocId: stockDetail?.poDocId || null,
        itemGroupId: stockDetail?.itemGroupId
          ? parseInt(stockDetail.itemGroupId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
      },
    });
  });
  return Promise.all(promises);
}

function findRemovedItems(dataFound, purchaseCancelItems) {
  return dataFound.purchaseCancelItems.filter(
    (oldItem) =>
      !purchaseCancelItems.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );
}

async function update(id, body) {
  const {
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    poType,
    remarks,
    termsAndCondition,
    cancelItems,
    termsId,
  } = await body;

  const dataFound = await prisma.purchaseCancel.findUnique({
    where: { id: parseInt(id) },
    include: { purchaseCancelItems: { select: { id: true } } },
  });
  if (!dataFound) return NoRecordFound("Purchase Cancel");

  const removedItems = findRemovedItems(dataFound, cancelItems);
  const removeItemsIds = removedItems.map((item) => parseInt(item.id));

  let data;
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      await tx.purchaseCancelItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }
    data = await tx.purchaseCancel.update({
      where: { id: parseInt(id) },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        supplierId: parseInt(supplierId),
        poType,
        remarks,
        termsAndCondition,
        termsId: termsId ? parseInt(termsId) : null,
      },
    });
    await updateCancelGoods(
      tx,
      cancelItems,
      data,
      userId,
      locationId,
      storeId,
      poType,
    );
  });
  return { statusCode: 0, data };
}

async function updateCancelGoods(
  tx,
  cancelItems,
  purchaseReturn,
  userId,
  locationId,
  storeId,
  poType,
) {
  const promises = cancelItems.map(async (stockDetail) => {
    if (stockDetail.id) {
      return await tx.purchaseCancelItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          purchaseCancelId: parseInt(purchaseReturn.id),
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          cancelQty: stockDetail?.cancelQty
            ? parseInt(stockDetail.cancelQty)
            : null,
          poType: poType || "",
          poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
          batchNo: stockDetail?.batchNo || null,
          poDocId: stockDetail?.poDocId || null,
          itemGroupId: stockDetail?.itemGroupId
            ? parseInt(stockDetail.itemGroupId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        },
      });
    } else {
      return await tx.purchaseCancelItems.create({
        data: {
          purchaseCancelId: parseInt(purchaseReturn.id),
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          cancelQty: stockDetail?.cancelQty
            ? parseInt(stockDetail.cancelQty)
            : null,
          poType: poType || "",
          poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
          batchNo: stockDetail?.batchNo || null,
          poDocId: stockDetail?.poDocId || null,
          itemGroupId: stockDetail?.itemGroupId
            ? parseInt(stockDetail.itemGroupId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        },
      });
    }
  });
  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.purchaseCancel.delete({
    where: { id: parseInt(id) },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
