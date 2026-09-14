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

      saledBox: {
        include: {
          salesReturnBoxes: {
            select: { id: true },
          },
        },
      },
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
    data: data.map((item) => {
      let childRecord = 0;
      if (item.saledBox) {
        item.saledBox.forEach((sb) => {
          childRecord += sb.salesReturnBoxes?.length || 0;
        });
      }
      console.log(childRecord, "childRecordget");

      return {
        ...item,
        childRecord,
      };
    }),
    nextDocId: newDocId,
    totalCount,
  };
}

// ─────────────────────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────────────────────

async function getOne(id) {
  console.log("APU CALLED GERE");

  const data = await prisma.salesDelivery.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      Customer: true,

      Branch: true,

      TaxTemplate: true,

      Terms: true,

      PayTerm: true,

      Bank: true,

      saledBox: {
        include: {
          Box: true,
          salesReturnBoxes: { select: { id: true } },
          saledItems: {
            include: {
              ItemVariant: {
                include: { styleMaster: { include: { modelName: true } } },
              },
              StyleMaster: { include: { modelName: true } },
              Hsn: true,
              printingDesign: true,
              Size: true,
              Color: true,
              Uom: true,
              Stock: {
                select: {
                  id: true,
                  qrCode: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    return NoRecordFound("Sales Delivery");
  }

  let childRecord = 0;
  if (data.saledBox) {
    data.saledBox.forEach((sb) => {
      childRecord += sb.salesReturnBoxes?.length || 0;
    });
  }
  console.log(childRecord, "childRecordgetOne");

  return {
    statusCode: 0,
    data: {
      ...data,
      childRecord,
    },
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
    userDate,
    deliveryDate,
    customerId,
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
    draftSave,
    conversionType,
    weightInKg,
    carriageCharge,
    currencyId,
    bankId,
    saledBox,
    carriageTaxType,
    carriageTax,
    netBillValue,
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

      userDate: userDate ? new Date(userDate) : null,

      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,

      createdById: parseInt(userId),

      branchId: branchId ? parseInt(branchId) : null,

      finYearId: finYearId ? parseInt(finYearId) : null,

      customerId: customerId ? parseInt(customerId) : null,

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

      carriageTaxType: carriageTaxType,
      carriageTax: carriageTax ? parseFloat(carriageTax) : null,
      netBillValue: netBillValue ? parseFloat(netBillValue) : null,

      saledBox: {
        create: (saledBox || []).map((item) => ({
          boxId: item.boxId ? parseInt(item.boxId) : null,

          packingBoxItemsId: item.packingBoxItemsId
            ? parseFloat(item.packingBoxItemsId)
            : null,
          boxDiscountType: item?.boxDiscountType,
          boxDiscountValue: item?.boxDiscountValue
            ? parseFloat(item?.boxDiscountValue)
            : null,
          saledItems: {
            create: (item.saledItems || [])
              .filter((item) => item.stockId)
              .map((item) => ({
                stockId: item.stockId ? parseInt(item.stockId) : null,
                itemVariantId: item.itemVariantId
                  ? parseInt(item.itemVariantId)
                  : null,
                styleId: item.styleId ? parseInt(item.styleId) : null,
                hsnId: item.hsnId ? parseInt(item.hsnId) : null,
                printingDesignId: item.printingDesignId
                  ? parseInt(item.printingDesignId)
                  : null,

                sizeId: item.sizeId ? parseInt(item.sizeId) : null,
                colorId: item.colorId ? parseInt(item.colorId) : null,
                uomId: item.uomId ? parseInt(item.uomId) : null,
                wholeSalePrice: item.wholeSalePrice
                  ? parseFloat(item.wholeSalePrice)
                  : null,
                taxPercent: item.taxPercent
                  ? parseFloat(item.taxPercent)
                  : null,
                discountValue: item.discountValue
                  ? parseFloat(item.discountValue)
                  : null,
                discountType: item.discountType || "",
              })),
          },
        })),
      },
    },
    include: {
      saledBox: true,
    },
  });

  if (data && data.saledBox) {
    for (const box of data.saledBox) {
      if (box.boxId) {
        await prisma.stock.updateMany({
          where: {
            boxId: box.boxId,
          },
          data: {
            itemStatus: "SOLD",
            isSaled: true,
            salesDeliveryId: data.id,
            saledBoxId: box.id,
            customerId: parseInt(customerId),
            auditReport: {
              push: {
                action: "SOLD",
                salesDeliveryId: data.id,
                saledBoxId: box.id,
                customerId: parseInt(customerId),
                date: new Date().toISOString(),
              },
            },
          },
        });
      }
    }
  }

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
    saledBox,
    conversionType,
    weightInKg,
    carriageCharge,
    currencyId,
    bankId,
    carriageTaxType,
    carriageTax,
    netBillValue,
  } = body;

  const dataFound = await prisma.salesDelivery.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      saledBox: {
        include: {
          saledItems: true,
        },
      },
    },
  });

  if (!dataFound) {
    return NoRecordFound("Sales Delivery");
  }

  let data;

  await prisma.$transaction(async (tx) => {
    // We no longer delete existing saledBox or disconnect stock.
    // Existing boxes remain untouched.

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
        carriageTaxType,
        carriageTax: carriageTax ? parseFloat(carriageTax) : null,
        netBillValue: netBillValue ? parseFloat(netBillValue) : null,
      },
    });

    if (saledBox && saledBox.length > 0) {
      const promises = saledBox.map(async (boxItem) => {
        if (!boxItem.boxId) return;

        // Check if this box is already saled in this sales delivery
        const existingBox = await tx.saledBox.findFirst({
          where: {
            salesDeliveryId: parseInt(data.id),
            boxId: parseInt(boxItem.boxId),
          },
        });

        // If it exists, existing data remains the same
        if (existingBox) return;

        // Create SaledBox for NEW box
        const createdBox = await tx.saledBox.create({
          data: {
            salesDeliveryId: parseInt(data.id),
            boxId: parseInt(boxItem.boxId),
            packingBoxItemsId: boxItem.packingBoxItemsId
              ? parseFloat(boxItem.packingBoxItemsId)
              : null,
            boxDiscountType: boxItem.boxDiscountType,
            boxDiscountValue: boxItem.boxDiscountValue
              ? parseFloat(boxItem.boxDiscountValue)
              : null,
          },
        });

        const validSaledItems = (boxItem.saledItems || []).filter(
          (p) => p.stockId,
        );

        if (validSaledItems.length > 0) {
          await tx.saledItems.createMany({
            data: validSaledItems.map((item) => ({
              saledBoxId: createdBox.id,
              stockId: item.stockId ? parseInt(item.stockId) : null,
              itemVariantId: item.itemVariantId
                ? parseInt(item.itemVariantId)
                : null,
              styleId: item.styleId ? parseInt(item.styleId) : null,
              hsnId: item.hsnId ? parseInt(item.hsnId) : null,
              printingDesignId: item.printingDesignId
                ? parseInt(item.printingDesignId)
                : null,
              sizeId: item.sizeId ? parseInt(item.sizeId) : null,
              colorId: item.colorId ? parseInt(item.colorId) : null,
              uomId: item.uomId ? parseInt(item.uomId) : null,
              wholeSalePrice: item.wholeSalePrice
                ? parseFloat(item.wholeSalePrice)
                : null,
              taxPercent: item.taxPercent ? parseFloat(item.taxPercent) : null,
              discountValue: item.discountValue
                ? parseFloat(item.discountValue)
                : null,
              discountType: item.discountType || "",
            })),
          });

          // Update Stock table for all matched items
          await tx.stock.updateMany({
            where: {
              id: { in: validSaledItems.map((p) => parseInt(p.stockId)) },
            },
            data: {
              itemStatus: "SOLD",
              isSaled: true,
              salesDeliveryId: parseInt(data.id),
              saledBoxId: createdBox.id,
              customerId: parseInt(customerId),
              auditReport: {
                push: {
                  action: "SOLD",
                  salesDeliveryId: parseInt(data.id),
                  saledBoxId: createdBox.id,
                  customerId: parseInt(customerId),
                  date: new Date().toISOString(),
                },
              },
            },
          });
        }
      });

      await Promise.all(promises);
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

  await prisma.stock.updateMany({
    where: {
      salesDeliveryId: parseInt(id),
    },
    data: {
      itemStatus: "PACKED",
      isSaled: false,
      salesDeliveryId: null,
      saledBoxId: null,
      customerId: null,
      auditReport: {
        push: {
          action: "UNSOLD",
          salesDeliveryId: parseInt(id),
          date: new Date().toISOString(),
        },
      },
    },
  });

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

async function getSalesReport(req, res) {
  console.log("getSalesReport API CALLED");

  try {
    const branchId = req.query.branchId
      ? parseInt(req.query.branchId)
      : undefined;
    const finYearId = req.query.finYearId
      ? parseInt(req.query.finYearId)
      : undefined;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(branchId ? { branchId } : {}),
      ...(finYearId ? { finYearId } : {}),
    };

    const [salesDeliveries, totalCount] = await Promise.all([
      prisma.salesDelivery.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          Customer: { select: { name: true } },
          Branch: { select: { branchName: true } },
          PayTerm: { select: { name: true } },
          Bank: { select: { name: true } },
          saledBox: {
            include: {
              Box: { select: { docId: true } },
              saledItems: {
                include: {
                  Stock: {
                    include: {
                      ItemVariant: {
                        include: {
                          styleMaster: {
                            select: {
                              modelName: { select: { name: true } },
                              styleNo: true,
                              name: true,
                              mrpPrice: true,
                            },
                          },
                        },
                      },
                      printingDesign: { select: { name: true } },
                      Hsn: { select: { name: true } },
                      Size: { select: { name: true } },
                      Color: { select: { name: true } },
                      Uom: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.salesDelivery.count({ where: whereClause }),
    ]);

    const mappedSales = salesDeliveries.map((sale) => {
      let totalBoxes = sale.saledBox?.length || 0;
      let totalItems = 0;

      const boxes =
        sale.saledBox?.map((box) => {
          totalItems += box.saledItems?.length || 0;
          const items =
            box.saledItems?.map((item) => {
              const stock = item.Stock || {};

              return {
                id: item.id,
                stockId: stock.id,
                qrCode: stock.qrCode || "—",
                modelName:
                  stock.ItemVariant?.styleMaster?.modelName?.name || "—",
                styleNo: stock.ItemVariant?.styleMaster?.styleNo || "—",
                cuttingPattern: stock.ItemVariant?.styleMaster?.name || "—",
                printingDesign: stock.printingDesign?.name || "—",
                size: stock.Size?.name || "—",
                color: stock.Color?.name || "—",
                uom: stock.Uom?.name || "—",
                hsn: stock.Hsn?.name || "—",

                itemStatus: stock.itemStatus || "—",
                wholeSalePrice: item.wholeSalePrice || 0,
                taxPercent: item.taxPercent || 0,
                discountValue: item.discountValue || 0,
                discountType: item.discountType || "",
              };
            }) || [];

          return {
            id: box.id,
            boxId: box.boxId,
            boxNo: box.Box?.docId || "—",
            items: items,
            totalBoxItems: items.length,
            boxDiscountType: box.boxDiscountType || "",
            boxDiscountValue: box.boxDiscountValue || 0,
          };
        }) || [];

      return {
        ...sale,
        totalBoxes,
        totalItems,
        totalValue: sale.netBillValue || 0,
        customerName: sale.Customer?.name || "—",
        branchName: sale.Branch?.name || "—",
        payTermName: sale.PayTerm?.name || "—",
        bankName: sale.Bank?.name || "—",
        boxes,
      };
    });

    return { data: mappedSales, totalCount, page, limit };
  } catch (err) {
    console.error("Sales report error:", err);
    return res.status(500).json({ error: "Failed to generate sales report" });
  }
}

export { get, getOne, create, update, remove, getSalesReport };
