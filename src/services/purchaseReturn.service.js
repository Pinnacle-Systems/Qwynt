import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getDateFromDateTime,
  getYearShortCodeForFinYear,
  getYearShortCode,
} from "../utils/helper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";

const REFERENCE_PAGE = "PURCHASE RETURN";

// ── Doc ID ────────────────────────────────────────────────────────────────────
async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.purchaseInwardReturn.findFirst({
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
      const records = await prisma.purchaseInwardReturn.findMany({
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
      newDocId = `${branchObj.branchCode}/${shortCode}/PR/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
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

// ── GET LIST ──────────────────────────────────────────────────────────────────
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

  let data = await prisma.purchaseInwardReturn.findMany({
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

  // getNextDocId needs shortCode — pass empty since no finYear context here
  let newDocId = await getNextDocId(branchId, "", undefined, undefined);
  return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
async function getOne(id) {
  const data = await prisma.purchaseInwardReturn.findUnique({
    where: { id: parseInt(id) },
    include: { purchaseReturnItems: true },
  });
  if (!data) return NoRecordFound("purchaseReturn");

  const itemWithPoQty = await Promise.all(
    data.purchaseReturnItems.map(async (item) => {
      const [poQty, inwardAgg, returnAgg] = await Promise.all([
        prisma.poItems.findFirst({
          where: {
            styleItemId: item.styleItemId,
            poId: item.poId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
          },
          select: { qty: true },
        }),
        prisma.inwardItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            purchaseInwardId: item.purchaseInwardId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
          },
          _sum: { inwardQty: true },
        }),
        prisma.purchaseReturnItems.aggregate({
          where: {
            styleItemId: item.styleItemId,
            purchaseInwardId: item.purchaseInwardId,
            uomId: item.uomId,
            hsnId: item.hsnId,
            itemGroupId: item.itemGroupId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            purchaseInwardReturnId: { not: data.id },
          },
          _sum: { returnQty: true },
        }),
      ]);

      const alreadyInwardQty = inwardAgg?._sum?.inwardQty ?? 0;
      const alreadyReturnQty = returnAgg?._sum?.returnQty ?? 0;

      return {
        ...item,
        balQty: alreadyInwardQty - alreadyReturnQty,
        poQty: poQty?.qty,
        inwardQty: alreadyInwardQty,
        alreadyReturnQty,
      };
    }),
  );

  return {
    statusCode: 0,
    data: { ...data, purchaseReturnItems: itemWithPoQty, childRecord: 0 },
  };
}

// ── GET SEARCH ────────────────────────────────────────────────────────────────
async function getSearch(req) {
  const { searchKey } = req.params;
  const { active } = req.query;
  // ✅ FIX: was querying wrong model (prisma.purchaseReturn doesn't exist)
  const data = await prisma.purchaseInwardReturn.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
      OR: [{ docId: { contains: searchKey } }],
    },
  });
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
    returnType,
    dcNo,
    dcDate,
    remarks,
    termsAndCondition,
    returnItems,
    finYearId,
    draftSave,
    locationId,
    invNo,
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
    data = await tx.purchaseInwardReturn.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        storeId: parseInt(storeId),
        supplierId: parseInt(supplierId),
        returnType,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        termsAndCondition,
        locationId: parseInt(locationId),
        invNo,
        termsId: termsId ? parseInt(termsId) : null,
      },
    });
    await createReturnItems(
      tx,
      returnItems,
      data,
      userId,
      locationId,
      storeId,
      returnType,
      invNo,
    );
  });
  return { statusCode: 0, data };
}

async function createReturnItems(
  tx,
  returnItems,
  purchaseReturn,
  userId,
  locationId,
  storeId,
  returnType,
  invNo,
) {
  const promises = returnItems?.map(async (stockDetail) => {
    const createdItem = await tx.purchaseReturnItems.create({
      data: {
        purchaseInwardReturnId: parseInt(purchaseReturn.id),
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
        returnQty: stockDetail?.returnQty
          ? parseInt(stockDetail.returnQty)
          : null,
        returnType: returnType || "",
        purchaseInwardId: stockDetail?.purchaseInwardId
          ? parseInt(stockDetail.purchaseInwardId)
          : null,
        invNo: invNo || null,
        batchNo: stockDetail?.batchNo || null,
        itemGroupId: stockDetail?.itemGroupId
          ? parseInt(stockDetail.itemGroupId)
          : null,
        poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
      },
    });
    await tx.stock.create({
      data: {
        inOrOut: "Out",
        processName: "Purchase Return",
        createdById: parseInt(userId),
        branchId: parseInt(locationId),
        storeId: parseInt(storeId),
        purchaseReturnItemsId: createdItem.id,
        styleItemId: stockDetail?.styleItemId
          ? parseInt(stockDetail.styleItemId)
          : null,
        uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
        hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
        qty:
          stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
            ? -Math.abs(parseInt(stockDetail.returnQty))
            : null,
        invNo: invNo || null,
        batchNo: stockDetail?.batchNo || null,
        itemGroupId: stockDetail?.itemGroupId
          ? parseInt(stockDetail.itemGroupId)
          : null,
        sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
        colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
        gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
      },
    });
    return createdItem;
  });
  return Promise.all(promises);
}

function findRemovedItems(dataFound, purchaseReturnItems) {
  return dataFound.purchaseReturnItems.filter(
    (oldItem) =>
      !purchaseReturnItems.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function update(id, body) {
  const {
    userId,
    branchId,
    storeId,
    locationId,
    docDate,
    supplierId,
    returnType,
    invNo,
    dcNo,
    dcDate,
    remarks,
    termsAndCondition,
    returnItems,
    termsId,
  } = await body;

  const dataFound = await prisma.purchaseInwardReturn.findUnique({
    where: { id: parseInt(id) },
    include: { purchaseReturnItems: { select: { id: true } } },
  });
  if (!dataFound) return NoRecordFound("Purchase Return");

  const removedItems = findRemovedItems(dataFound, returnItems);
  const removeItemsIds = removedItems.map((item) => parseInt(item.id));

  let data;
  await prisma.$transaction(async (tx) => {
    if (removeItemsIds.length > 0) {
      await tx.purchaseReturnItems.deleteMany({
        where: { id: { in: removeItemsIds } },
      });
    }

    data = await tx.purchaseInwardReturn.update({
      where: { id: parseInt(id) },
      data: {
        docDate: docDate ? new Date(docDate) : null,
        updatedById: parseInt(userId),
        storeId: parseInt(storeId),
        branchId: parseInt(branchId),
        locationId: parseInt(locationId),
        supplierId: parseInt(supplierId),
        returnType,
        invNo,
        dcNo,
        dcDate: dcDate ? new Date(dcDate) : null,
        remarks,
        termsAndCondition,
        termsId: termsId ? parseInt(termsId) : null,
      },
    });

    await updateReturnGoods(
      tx,
      returnItems,
      data,
      userId,
      locationId,
      storeId,
      returnType,
      invNo,
    );
  });
  return { statusCode: 0, data };
}

async function updateReturnGoods(
  tx,
  returnItems,
  purchaseReturn,
  userId,
  locationId,
  storeId,
  returnType,
  invNo,
) {
  const promises = returnItems.map(async (stockDetail) => {
    if (stockDetail.id) {
      const updatedItem = await tx.purchaseReturnItems.update({
        where: { id: parseInt(stockDetail.id) },
        data: {
          purchaseInwardReturnId: parseInt(purchaseReturn.id),
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          returnQty: stockDetail?.returnQty
            ? parseInt(stockDetail.returnQty)
            : null,
          returnType: returnType || "",
          purchaseInwardId: stockDetail?.purchaseInwardId
            ? parseInt(stockDetail.purchaseInwardId)
            : null,
          invNo: invNo || null,
          batchNo: stockDetail?.batchNo || null,
          itemGroupId: stockDetail?.itemGroupId
            ? parseInt(stockDetail.itemGroupId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        },
      });

      const existingStock = await tx.stock.findFirst({
        where: { purchaseReturnItemsId: updatedItem.id },
      });
      if (existingStock) {
        await tx.stock.update({
          where: { id: existingStock.id },
          data: {
            updatedById: parseInt(userId),
            branchId: parseInt(locationId),
            storeId: parseInt(storeId),
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
            hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
            qty:
              stockDetail?.returnQty &&
              !isNaN(parseFloat(stockDetail.returnQty))
                ? -Math.abs(parseInt(stockDetail.returnQty))
                : null,
            invNo: invNo || null,
            batchNo: stockDetail?.batchNo || null,
            itemGroupId: stockDetail?.itemGroupId
              ? parseInt(stockDetail.itemGroupId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
          },
        });
      } else {
        // ✅ FIX: was using `createdItem.id` — doesn't exist in update branch, use `updatedItem.id`
        await tx.stock.create({
          data: {
            inOrOut: "Out",
            processName: "Purchase Return",
            createdById: parseInt(userId),
            branchId: parseInt(locationId),
            storeId: parseInt(storeId),
            purchaseReturnItemsId: updatedItem.id, // ← was createdItem.id (crash)
            styleItemId: stockDetail?.styleItemId
              ? parseInt(stockDetail.styleItemId)
              : null,
            uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
            hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
            qty:
              stockDetail?.returnQty &&
              !isNaN(parseFloat(stockDetail.returnQty))
                ? -Math.abs(parseInt(stockDetail.returnQty))
                : null,
            invNo: invNo || null,
            batchNo: stockDetail?.batchNo || null,
            itemGroupId: stockDetail?.itemGroupId
              ? parseInt(stockDetail.itemGroupId)
              : null,
            sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
            colorId: stockDetail?.colorId
              ? parseInt(stockDetail.colorId)
              : null,
            gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
          },
        });
      }
      return updatedItem;
    } else {
      const createdItem = await tx.purchaseReturnItems.create({
        data: {
          purchaseInwardReturnId: parseInt(purchaseReturn.id),
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          returnQty: stockDetail?.returnQty
            ? parseInt(stockDetail.returnQty)
            : null,
          returnType: returnType || "",
          purchaseInwardId: stockDetail?.purchaseInwardId
            ? parseInt(stockDetail.purchaseInwardId)
            : null,
          invNo: invNo || null,
          batchNo: stockDetail?.batchNo || null,
          itemGroupId: stockDetail?.itemGroupId
            ? parseInt(stockDetail.itemGroupId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          poId: stockDetail?.poId ? parseInt(stockDetail.poId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        },
      });
      await tx.stock.create({
        data: {
          inOrOut: "Out",
          processName: "Purchase Return",
          createdById: parseInt(userId),
          branchId: parseInt(locationId),
          storeId: parseInt(storeId),
          purchaseReturnItemsId: createdItem.id,
          styleItemId: stockDetail?.styleItemId
            ? parseInt(stockDetail.styleItemId)
            : null,
          uomId: stockDetail?.uomId ? parseInt(stockDetail.uomId) : null,
          hsnId: stockDetail?.hsnId ? parseInt(stockDetail.hsnId) : null,
          qty:
            stockDetail?.returnQty && !isNaN(parseFloat(stockDetail.returnQty))
              ? -Math.abs(parseInt(stockDetail.returnQty))
              : null,
          invNo: invNo || null,
          batchNo: stockDetail?.batchNo || null,
          itemGroupId: stockDetail?.itemGroupId
            ? parseInt(stockDetail.itemGroupId)
            : null,
          sizeId: stockDetail?.sizeId ? parseInt(stockDetail.sizeId) : null,
          colorId: stockDetail?.colorId ? parseInt(stockDetail.colorId) : null,
          gsmId: stockDetail?.gsmId ? parseInt(stockDetail.gsmId) : null,
        },
      });
      return createdItem;
    }
  });
  return Promise.all(promises);
}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const data = await prisma.purchaseInwardReturn.delete({
    where: { id: parseInt(id) },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
