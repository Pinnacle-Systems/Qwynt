// salesDelivery.service.js

import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import {
  getYearShortCodeForFinYear,
  getDateFromDateTime,
} from "../utils/helper.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getTableRecordWithId } from "../utils/helperQueries.js";
// import { conversionTypes } from "../../client/src/Utils/DropdownData.js";

const REFERENCE_PAGE = "SALES DELIVERY";

// ─────────────────────────────────────────────────────────────
// DOC ID
// ─────────────────────────────────────────────────────────────

async function getNextDocId(branchId, shortCode, startTime, endTime, saveType) {
  if (saveType) return "Draft Save";

  let lastObject = await prisma.salesDelivery.findFirst({
    where: {
      branchId: parseInt(branchId),
      AND: [{ createdAt: { gte: startTime } }, { createdAt: { lte: endTime } }],
    },
    orderBy: { id: "desc" },
  });

  const branchObj = await getTableRecordWithId(branchId, "branch");

  let newDocId = `${branchObj.branchCode}/${shortCode}/SD/1`;

  if (lastObject) {
    if (lastObject.docId === "Draft Save") {
      const records = await prisma.salesDelivery.findMany({
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

      newDocId = `${branchObj.branchCode}/${shortCode}/SD/${
        parseInt(maxDocId.split("/").at(-1)) + 1
      }`;
    } else {
      newDocId = `${branchObj.branchCode}/${shortCode}/SD/${
        parseInt(lastObject.docId.split("/").at(-1)) + 1
      }`;
    }
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
    searchCustomer,
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

  let data = await prisma.salesDelivery.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,

      AND: finYearDate
        ? [
            { createdAt: { gte: finYearDate.startTime } },
            { createdAt: { lte: finYearDate.endTime } },
          ]
        : undefined,

      docId: Boolean(searchDocNo) ? { contains: searchDocNo } : undefined,

      Customer: {
        name: searchCustomer ? { contains: searchCustomer } : undefined,
      },
    },

    include: {
      Customer: {
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

      OrderEntry: {
        select: {
          id: true,
          docId: true,
        },
      },

      TaxTemplate: {
        select: {
          id: true,
          name: true,
        },
      },

      Terms: {
        select: {
          id: true,
          name: true,
        },
      },

      PayTerm: {
        select: {
          id: true,
          name: true,
        },
      },

      salesDeliveryItems: true,
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
  const data = await prisma.salesDelivery.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      Customer: true,

      Branch: true,

      OrderEntry: true,

      TaxTemplate: true,

      Terms: true,

      PayTerm: true,

      salesDeliveryItems: {
        include: {
          StyleItem: true,
          Uom: true,
          Hsn: true,
          sizeBreakup: {
            include: {
              Size: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return NoRecordFound("Sales Delivery");
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
    deliveryDate,
    customerId,
    orderEntryId,
    dcNo,
    vehicleNo,
    deliveryType,
    remarks,
    discountType,
    discountValue,
    taxTemplateId,
    termsAndCondition,
    termsId,
    payTermId,
    salesDeliveryItems,
    draftSave,
    conversionType,
    weightInKg,
    carriageCharge,
    currencyId,
    bankId,
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

  const data = await prisma.salesDelivery.create({
    data: {
      docId: newDocId,

      docDate: docDate ? new Date(docDate) : null,

      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,

      createdById: parseInt(userId),

      branchId: branchId ? parseInt(branchId) : null,

      customerId: customerId ? parseInt(customerId) : null,

      orderEntryId: orderEntryId ? parseInt(orderEntryId) : null,

      dcNo,

      vehicleNo,

      deliveryType,

      remarks,

      discountType,

      discountValue: discountValue ? parseFloat(discountValue) : null,

      taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,

      termsAndCondition,

      termsId: termsId ? parseInt(termsId) : null,

      payTermId: payTermId ? parseInt(payTermId) : null,

      conversionType,

      weightInKg: weightInKg ? parseFloat(weightInKg) : null,

      carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,

      currencyId: currencyId ? parseInt(currencyId) : null,

      bankId: bankId ? parseInt(bankId) : null,

      salesDeliveryItems: {
        create: (salesDeliveryItems || []).map((item) => ({
          styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,

          qty: item.qty ? parseFloat(item.qty) : null,

          price: item.price ? parseFloat(item.price) : null,

          amount: item.amount ? parseFloat(item.amount) : null,

          discountType: item.discountType,

          discountValue: item.discountValue
            ? parseFloat(item.discountValue)
            : null,

          taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

          uomId: item.uomId ? parseInt(item.uomId) : null,

          hsnId: item.hsnId ? parseInt(item.hsnId) : null,

          trackingType: item.trackingType,

          sizeBreakup: {
            create: (item.sizeBreakup || [])
              .filter((size) => size.sizeId)
              .map((size) => ({
                sizeId: size.sizeId ? parseInt(size.sizeId) : null,

                qty: size.qty ? parseInt(size.qty) : 0,
              })),
          },
        })),
      },
    },
    include: {
      salesDeliveryItems: {
        include: {
          sizeBreakup: {
            include: {
              Size: true,
            },
          },
        },
      },
    },
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
    deliveryDate,
    customerId,
    orderEntryId,
    dcNo,
    vehicleNo,
    deliveryType,
    remarks,
    discountType,
    discountValue,
    taxTemplateId,
    termsAndCondition,
    termsId,
    payTermId,
    salesDeliveryItems,
    conversionType,
    weightInKg,
    carriageCharge,
    currencyId,
    bankId,
  } = body;

  const dataFound = await prisma.salesDelivery.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      salesDeliveryItems: {
        include: {
          sizeBreakup: true,
        },
      },
    },
  });

  if (!dataFound) {
    return NoRecordFound("Sales Delivery");
  }

  const removedItems = dataFound.salesDeliveryItems.filter(
    (oldItem) =>
      !salesDeliveryItems.find(
        (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
      ),
  );

  const removedIds = removedItems.map((item) => parseInt(item.id));

  let data;

  await prisma.$transaction(async (tx) => {
    if (removedIds.length > 0) {
      await tx.salesDeliveryItems.deleteMany({
        where: {
          id: {
            in: removedIds,
          },
        },
      });
    }

    data = await tx.salesDelivery.update({
      where: {
        id: parseInt(id),
      },

      data: {
        updatedById: parseInt(userId),

        branchId: branchId ? parseInt(branchId) : null,

        docDate: docDate ? new Date(docDate) : null,

        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,

        customerId: customerId ? parseInt(customerId) : null,

        orderEntryId: orderEntryId ? parseInt(orderEntryId) : null,

        dcNo,

        vehicleNo,

        deliveryType,

        remarks,

        discountType,

        discountValue: discountValue ? parseFloat(discountValue) : null,

        taxTemplateId: taxTemplateId ? parseInt(taxTemplateId) : null,

        termsAndCondition,

        termsId: termsId ? parseInt(termsId) : null,

        payTermId: payTermId ? parseInt(payTermId) : null,

        conversionType,

        weightInKg: weightInKg ? parseFloat(weightInKg) : null,

        carriageCharge: carriageCharge ? parseFloat(carriageCharge) : null,

        currencyId: currencyId ? parseInt(currencyId) : null,

        bankId: bankId ? parseInt(bankId) : null,
      },
    });

    // UPDATE / CREATE ITEMS

    for (const item of salesDeliveryItems) {
      if (item.id) {
        const existingItem = dataFound.salesDeliveryItems.find(
          (x) => x.id === parseInt(item.id),
        );
        const existingSizeBreakups = existingItem?.sizeBreakup || [];
        const removedSizeIds = existingSizeBreakups
          .filter(
            (oldSize) =>
              !(item.sizeBreakup || []).find(
                (newSize) => parseInt(newSize.id) === parseInt(oldSize.id),
              ),
          )
          .map((x) => x.id);
        if (removedSizeIds.length > 0) {
          await tx.salesSizeBreakup.deleteMany({
            where: {
              id: {
                in: removedSizeIds,
              },
            },
          });
        }
        await tx.salesDeliveryItems.update({
          where: {
            id: parseInt(item.id),
          },

          data: {
            styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,

            qty: item.qty ? parseFloat(item.qty) : null,

            price: item.price ? parseFloat(item.price) : null,

            amount: item.amount ? parseFloat(item.amount) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            uomId: item.uomId ? parseInt(item.uomId) : null,

            hsnId: item.hsnId ? parseInt(item.hsnId) : null,

            trackingType: item.trackingType,
          },
        });
        for (const size of item.sizeBreakup || []) {
          if (size.id) {
            await tx.salesSizeBreakup.update({
              where: {
                id: parseInt(size.id),
              },
              data: {
                sizeId: size.sizeId ? parseInt(size.sizeId) : null,
                qty: size.qty ? parseInt(size.qty) : 0,
              },
            });
          } else {
            await tx.salesSizeBreakup.create({
              data: {
                salesDeliveryItemId: parseInt(item.id),
                sizeId: size.sizeId ? parseInt(size.sizeId) : null,
                qty: size.qty ? parseInt(size.qty) : 0,
              },
            });
          }
        }
      } else {
        const createItem = await tx.salesDeliveryItems.create({
          data: {
            salesDeliveryId: parseInt(id),

            styleItemId: item.styleItemId ? parseInt(item.styleItemId) : null,

            qty: item.qty ? parseFloat(item.qty) : null,

            price: item.price ? parseFloat(item.price) : null,

            amount: item.amount ? parseFloat(item.amount) : null,

            discountType: item.discountType,

            discountValue: item.discountValue
              ? parseFloat(item.discountValue)
              : null,

            taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,

            uomId: item.uomId ? parseInt(item.uomId) : null,

            hsnId: item.hsnId ? parseInt(item.hsnId) : null,

            trackingType: item.trackingType,
          },
        });
        for (const size of item.sizeBreakup || []) {
          await tx.salesSizeBreakup.create({
            data: {
              salesDeliveryItemId: createItem.id,
              sizeId: size.sizeId ? parseInt(size.sizeId) : null,
              qty: size.qty ? parseInt(size.qty) : 0,
            },
          });
        }
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
  const dataFound = await prisma.salesDelivery.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!dataFound) {
    return NoRecordFound("Sales Delivery");
  }

  await prisma.salesDelivery.delete({
    where: {
      id: parseInt(id),
    },
  });

  return {
    statusCode: 0,
    message: "Sales Delivery Deleted Successfully",
  };
}

export { get, getOne, create, update, remove };
