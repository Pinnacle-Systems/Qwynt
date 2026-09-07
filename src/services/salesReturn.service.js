import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getYearShortCode,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
import fs from "fs";
import path from "path";
import {
  createApprovalLog,
  getModuleApprovalSetup,
  evaluateConfigTrigger,
  getTriggeredConfig,
  buildIncludeForModule,
} from "../utils/approvalHelper.js";

const REFERENCE_PAGE = "PACKING";

// ── Doc ID ────────────────────────────────────────────────────────────────────
async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.salesReturn.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");
  let newDocId = `${branchObj.branchCode}/${shortCode}/PK/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.salesReturn.findMany({
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
      newDocId = `${branchObj.branchCode}/${shortCode}/PK/${parseInt(maxDocId.split("/").at(-1)) + 1}`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/PK/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`;
    }
  }
  return newDocId;
}

// ── GET LIST ──────────────────────────────────────────────────────────────────
async function get(req) {
  const {
    branchId,
    pagination,
    pageNumber,
    dataPerPage,
    serachDocNo,
    searchDocDate,
    searchStore,
    searchInwardType,
    finYearId,
    searchSupplier,
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

  let data = await prisma.salesReturn.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,
      docId: Boolean(serachDocNo) ? { contains: serachDocNo } : undefined,
      Customer: {
        name: searchSupplier ? { contains: searchSupplier } : undefined,
      },
    },
    include: {
      SalesReturnBox: {
        include: {
          SalesReturnBoxItems: true,
        },
      },
      Customer: { select: { id: true, name: true } },
    },
    orderBy: { id: "desc" },
  });

  let totalCount = data.length;

  if (searchDocDate) {
    data = data?.filter((item) =>
      String(getDateFromDateTime(item.createdAt)).includes(searchDocDate),
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
      return {
        ...item,
        childRecord: 0,
      };
    }),
    nextDocId: newDocId,
    totalCount,
  };
}

// ── GET ONE ───────────────────────────────────────────────────────────────────
async function getOne(id) {
  const data = await prisma.salesReturn.findUnique({
    where: { id: parseInt(id) },
    include: {
      branch: { select: { branchName: true } },
      Customer: { select: { id: true, name: true } },
      SalesReturnBox: {
        include: {
          box: {
            select: { id: true, docId: true },
          },
          SalesReturnBoxItems: {
            include: {
              stock: {
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
              },
            },
          },
        },
      },
    },
  });
  if (!data) return NoRecordFound("SalesReturn");

  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord: 0,
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.salesReturn.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function create(body) {
  const {
    id,
    docDate,
    userDate,
    branchId,
    userId,

    customerId,
    companyId,
    remarks,
    salesReturnBox,
    finYearId,

    attachments,
  } = await body;
  console.log(body, "packingbody");

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
    data = await tx.salesReturn.create({
      data: {
        docId: newDocId,
        docDate: docDate ? new Date(docDate) : null,
        userDate: userDate ? new Date(userDate) : null,
        createdById: parseInt(userId),
        branchId: parseInt(branchId),
        companyId: parseInt(companyId),
        customerId: parseInt(customerId),
        finYearId: parseInt(finYearId),
        remarks,
      },
    });

    await createPackingBoxItems(tx, salesReturnBox, data, userId);
  });

  return { statusCode: 0, data };
}

// ── CREATE PACKING BOX ITEMS ──────────────────────────────────────────────────
async function createPackingBoxItems(tx, salesReturnBox, salesReturn, userId) {
  const promises = salesReturnBox?.map(async (boxItem) => {
    // Create PackingBoxItems
    const createdBox = await tx.salesReturnBox.create({
      data: {
        SalesReturnId: parseInt(salesReturn.id),
        boxId: parseInt(boxItem.boxId),
        saledBoxId: parseInt(boxItem.saledBoxId),
      },
    });

    const validPackedItems = boxItem.salesReturnBoxItems?.filter((p) => p.id);

    if (validPackedItems?.length > 0) {
      // Create PackingItems
      await tx.salesReturnBoxItems.createMany({
        data: validPackedItems.map((p) => ({
          SalesReturnBoxId: createdBox.id,
          stockId: parseInt(p.id),
        })),
      });

      // Update Stock table for all matched items
      await tx.stock.updateMany({
        where: { id: { in: validPackedItems.map((p) => parseInt(p.id)) } },
        data: {
          itemStatus: "RETURNED",
          salesReturnId: parseInt(salesReturn.id),
          salesReturnBoxId: parseInt(createdBox.id),
          isReturned: true,
        },
      });
    }
  });

  return Promise.all(promises);
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function update(id, body, files) {
  const {
    docDate,
    userDate,
    branchId,
    userId,

    customerId,
    companyId,
    remarks,
    salesReturnBox,
    finYearId,
  } = await body;

  const dataFound = await prisma.salesReturn.findUnique({
    where: { id: parseInt(id) },
    include: {
      salesReturnBox: { select: { id: true } },
      customer: true,
      branch: true,
    },
  });
  if (!dataFound) return { statusCode: 1, message: "Packing not found" };

  const salesBox =
    typeof salesReturnBox === "string"
      ? JSON.parse(salesReturnBox)
      : salesReturnBox;

  let data;
  await prisma.$transaction(async (tx) => {
    // We no longer delete existing packingBoxItems or disconnect stock.
    // Existing boxes remain untouched.

    data = await tx.salesReturn.update({
      where: { id: parseInt(id) },
      data: {
        remarks,
        userDate: userDate ? new Date(userDate) : null,
      },
    });

    if (salesBox.length > 0) {
      await updatePackingBoxItems(tx, salesBox, data, userId);
    }
  });

  return { statusCode: 0, data };
}

// ── UPDATE PACKING BOX ITEMS ──────────────────────────────────────────────────
async function updatePackingBoxItems(tx, salesBox, salesReturn, userId) {
  const promises = salesBox?.map(async (boxItem) => {
    if (!boxItem.boxId) return;

    // Check if this box is already Saled in this transaction
    const existingBox = await tx.salesReturnBox.findFirst({
      where: {
        SalesReturnId: parseInt(salesReturn.id),
        boxId: parseInt(boxItem.boxId),
      },
    });

    // If it exists, existing data remains the same
    if (existingBox) return;

    // Create PackingBoxItems for NEW box
    const createdBox = await tx.salesReturnBox.create({
      data: {
        SalesReturnId: parseInt(salesReturn.id),
        boxId: parseInt(boxItem.boxId),
        saledBoxId: parseInt(boxItem.saledBoxId),
      },
    });

    const validSaledItems = boxItem.salesReturnBoxItems?.filter((p) => p.id);

    if (validSaledItems?.length > 0) {
      await tx.salesReturnBoxItems.createMany({
        data: validSaledItems.map((p) => ({
          SalesReturnBoxId: createdBox.id,
          stockId: parseInt(p.id),
        })),
      });

      // Update Stock table for all matched items
      await tx.stock.updateMany({
        where: { id: { in: validSaledItems.map((p) => parseInt(p.id)) } },
        data: {
          itemStatus: "RETURNED",
          salesReturnId: parseInt(salesReturn.id),
          salesReturnBoxId: parseInt(createdBox.id),
          isReturned: true,
        },
      });
    }
  });

  return Promise.all(promises);
}

// ── REMOVE ────────────────────────────────────────────────────────────────────
async function remove(id) {
  const dataFound = await prisma.salesReturn.findUnique({
    where: { id: parseInt(id) },
  });

  if (!dataFound) return { statusCode: 1, message: "Return not found" };

  await prisma.$transaction(async (tx) => {
    // Disconnect all stock associated with this salesReturn
    await tx.stock.updateMany({
      where: {
        salesReturnId: parseInt(id),
      },
      data: {
        itemStatus: "SOLD",
        salesReturnId: null,
        salesReturnBoxId: null,
        isReturned: false,
      },
    });

    await tx.salesReturn.delete({
      where: { id: parseInt(id) },
    });
  });
  return { statusCode: 0, data: dataFound };
}

export { get, getOne, getSearch, create, update, remove };
