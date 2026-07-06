import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.purchaseBillEntry.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PB/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.purchaseBillEntry.findMany({
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
      newDocId = `${branchObj.branchCode}/${shortCode}/PB/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}

async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    finYearId,
    searchSupplier,
    searchDate,
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

  let data = await prisma.purchaseBillEntry.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      supplier: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      purchaseBillEntryItems: {
        select: {
          Uom: true,
          id: true,
          purchaseBillEntryId: true,
          StyleItem: true,
          Hsn: true,
          inwardQty: true,
          invNo: true,
          dcNo: true,
          docId: true,
          docDate: true,
          price: true,
        },
      },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { docId: "desc" },
  });

  let totalCount = data.length;

  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
    );
  }
  if (searchDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDate),
    );
  }
  if (pagination) {
    data = data.slice(
      (pageNumber - 1) * parseInt(dataPerPage),
      pageNumber * dataPerPage,
    );
  }

  return { statusCode: 0, data, nextDocId: newDocId, totalCount };
}

async function getOne(id) {
  const data = await prisma.purchaseBillEntry.findUnique({
    where: { id: parseInt(id) },
    include: {
      purchaseBillEntryItems: {
        select: {
          Uom: true,
          id: true,
          purchaseBillEntryId: true,
          StyleItem: true,
          Hsn: true,
          inwardQty: true,
          Gsm: true,
          invNo: true,
          dcNo: true,
          docId: true,
          docDate: true,
          price: true,
          Color: true,
          Size: true,
          Itemgroup: true,
          taxPercent: true,
          discountType: true,
          discountValue: true,
          PurchaseInward: {
            select: { docId: true, docDate: true, invNo: true, dcNo: true },
          },
        },
      },
      supplier: { select: { id: true, name: true } },
    },
  });
  if (!data) return NoRecordFound("Purchase Bill Entry");
  return { statusCode: 0, data };
}

async function create(req) {
  const {
    companyId,
    branchId,
    finYearId,
    userId,
    docDate,
    supplierId,
    remarks,
    inwardItems,
    netBillValue,
    taxTemplateId,
    billType,
    discountType,
    discountValue,
  } = await req.body;

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

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.purchaseBillEntry.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        branchId: branchId ? parseInt(branchId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        finYearId: finYearId ? parseInt(finYearId) : undefined,
        createdById: userId ? parseInt(userId) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        supplierId: parseInt(supplierId),
        remarks: remarks ?? "",
        netBillValue: parseFloat(netBillValue) ?? null,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : undefined,
        billType: billType ?? "",
        discountType: discountType ?? "",
        discountValue: discountValue ? parseFloat(discountValue) : null,
      },
    });
    await createInwardItems(tx, inwardItems, data, userId);
    await tx.purchaseLedger.create({
      data: {
        docId: newDocId ?? "",
        docDate: docDate ? new Date(docDate) : null,
        supplierId: parseInt(supplierId),
        remarks: remarks ?? "",
        netBillValue: parseFloat(netBillValue) ?? null,
        purchaseBillEntryId: parseInt(data.id),
      },
    });
  });
  return { statusCode: 0, data };
}

async function createInwardItems(tx, inwardItems, data, userId) {
  const promises = inwardItems?.map(async (val) => {
    return await tx.purchaseBillEntryItems.create({
      data: {
        purchaseBillEntryId: parseInt(data?.id),
        purchaseInwardId: val?.PurchaseInward?.id
          ? parseInt(val.PurchaseInward.id)
          : undefined,
        docId: val?.PurchaseInward?.docId ?? "",
        docDate: val?.PurchaseInward?.docDate ?? "",
        invNo: val?.PurchaseInward?.invNo || "",
        dcNo: val?.PurchaseInward?.dcNo || "",
        styleItemId: val?.styleItemId ? parseInt(val.styleItemId) : null,
        uomId: val?.uomId ? parseInt(val.uomId) : null,
        hsnId: val?.hsnId ? parseInt(val.hsnId) : null,
        inwardQty: val?.inwardQty ? parseInt(val.inwardQty) : null,
        price: val?.price ? parseInt(val.price) : null,
        discountType: val?.discountType ?? undefined,
        discountValue: val?.discountValue ? parseInt(val.discountValue) : null,
        taxPercent: val?.taxPercent ? parseInt(val.taxPercent) : null,
        itemGroupId: val?.itemGroupId ? parseInt(val.itemGroupId) : null,
        sizeId: val?.sizeId ? parseInt(val.sizeId) : null,
        colorId: val?.colorId ? parseInt(val.colorId) : null,
        poId: val?.poId ? parseInt(val.poId) : null,
        gsmId: val?.gsmId ? parseInt(val.gsmId) : null,
      },
    });
  });
  return Promise.all(promises);
}

function findRemovedItemsGoods(dataFound, inwardItems) {
  return dataFound.purchaseBillEntryItems.filter(
    (oldItem) =>
      !inwardItems.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );
}

async function update(id, body) {
  const {
    userId,
    docDate,
    supplierId,
    remarks,
    inwardItems,
    netBillValue,
    taxTemplateId,
    billType,
    discountType,
    discountValue,
  } = await body;

  const dataFound = await prisma.purchaseBillEntry.findUnique({
    where: { id: parseInt(id) },
    include: { purchaseBillEntryItems: { select: { id: true } } },
  });
  if (!dataFound) return NoRecordFound("Purchase Bill Entry");

  const removedItemsGoods = findRemovedItemsGoods(dataFound, inwardItems);
  const removeItemsGoodsIds = removedItemsGoods.map((item) =>
    parseInt(item.id),
  );

  let data;
  await prisma.$transaction(async (tx) => {
    if (removeItemsGoodsIds.length > 0) {
      await tx.purchaseBillEntryItems.deleteMany({
        where: { id: { in: removeItemsGoodsIds } },
      });
    }

    data = await tx.purchaseBillEntry.update({
      where: { id: parseInt(id) },
      data: {
        updatedById: parseInt(userId),
        docDate: docDate ? new Date(docDate) : null,
        userId: userId ? parseInt(userId) : undefined,
        supplierId: parseInt(supplierId),
        remarks: remarks ?? "",
        netBillValue: parseFloat(netBillValue) ?? null,
        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : undefined,
        billType: billType ?? "",
        discountType: discountType ?? "",
        discountValue: discountValue ? parseFloat(discountValue) : null,
      },
    });

    await updateInwardItems(tx, inwardItems, data, userId);

    const ledger = await tx.purchaseLedger.findFirst({
      where: { purchaseBillEntryId: parseInt(data.id) },
    });
    if (ledger) {
      await tx.purchaseLedger.update({
        where: { id: ledger.id },
        data: {
          docDate: docDate ? new Date(docDate) : null,
          supplierId: parseInt(supplierId),
          remarks: remarks ?? "",
          netBillValue: parseFloat(netBillValue) ?? null,
        },
      });
    }
  });
  return { statusCode: 0, data };
}

async function updateInwardItems(tx, inwardItems, data, userId) {
  const promises = inwardItems?.map(async (val) => {
    const itemData = {
      purchaseBillEntryId: parseInt(data?.id),
      docId: val?.PurchaseInward?.docId ?? "",
      docDate: val?.PurchaseInward?.docDate ?? "",
      invNo: val?.PurchaseInward?.invNo || "",
      dcNo: val?.PurchaseInward?.dcNo || "",
      styleItemId: val?.StyleItem?.id ? parseInt(val.StyleItem.id) : null,
      uomId: val?.Uom?.id ? parseInt(val.Uom.id) : null,
      hsnId: val?.Hsn?.id ? parseInt(val.Hsn.id) : null,
      inwardQty: val?.inwardQty ? parseInt(val.inwardQty) : null,
      price: val?.price ? parseInt(val.price) : null,
      discountType: val?.discountType ?? undefined,
      discountValue: val?.discountValue ? parseInt(val.discountValue) : null,
      taxPercent: val?.taxPercent ? parseInt(val.taxPercent) : null,
      itemGroupId: val?.itemGroupId ? parseInt(val.itemGroupId) : null,
      sizeId: val?.sizeId ? parseInt(val.sizeId) : null,
      colorId: val?.colorId ? parseInt(val.colorId) : null,
      poId: val?.poId ? parseInt(val.poId) : null,
      gsmId: val?.gsmId ? parseInt(val.gsmId) : null,
    };

    if (val.id) {
      return await tx.purchaseBillEntryItems.update({
        where: { id: parseInt(val.id) },
        data: itemData,
      });
    } else {
      return await tx.purchaseBillEntryItems.create({ data: itemData });
    }
  });
  return Promise.all(promises);
}

async function remove(id) {
  const data = await prisma.purchaseBillEntry.delete({
    where: { id: parseInt(id) },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
