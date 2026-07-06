import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from '../configs/Responses.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';
import { getDateFromDateTime, getYearShortCode, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';



async function getNextDocId(branchId, shortCode, startTime, endTime, saveType, docId, isUpdate) {

    console.log(startTime, "startTime", endTime, "endTime")

    if (saveType) {
        return "Draft Save"
    }

    else {
        let lastObject = await prisma.DeliveryInvoice.findFirst({
            where: {
                // branchId: parseInt(branchId),
                // AND: [
                //     {
                //         createdAt: {
                //             gte: startTime

                //         }
                //     },
                //     {
                //         createdAt: {
                //             lte: endTime
                //         }
                //     }
                // ],
            },
            orderBy: {
                id: 'desc'
            }
        });

        console.log(lastObject, ":lastObject")

        const branchObj = await getTableRecordWithId(branchId, "branch")
        let newDocId = `${branchObj.branchCode}/${shortCode}/INV/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}/${shortCode}/INV/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        }
        return newDocId
    }

}

function manualFilterSearchData(searchDate, searchDueDate, data) {
    return data.filter(item =>
        (searchDate ? String(getDateFromDateTime(item.createdAt)).includes(searchDate) : true) &&
        (searchDueDate ? String(getDateFromDateTime(item.dueDate)).includes(searchDueDate) : true)
    )
}


async function get(req) {

    const { serachDocNo, supplier, searchDate, searchDueDate } = req.query

    let data = await prisma.deliveryInvoice.findMany({
        where: {
            docId: serachDocNo ? { contains: serachDocNo } : undefined,
            Party: {
                name: supplier ? { contains: supplier } : undefined
            }
        },
        include: {
            Party: {
                select: {
                    name: true,
                    BranchType: {
                        select: {
                            name: true
                        }
                    },
                    City: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: "desc"
        }

    });


    data = manualFilterSearchData(searchDate, searchDueDate, data)

    return { statusCode: 0, data };
}

async function getDcItems(req) {

    const { serachDocNo, supplier, searchDate, searchDueDate } = req.query

    let data = await prisma.DeliveryInvoice.findMany({
        where: {
            docId: serachDocNo ? { contains: serachDocNo } : undefined,
            Party: {
                name: supplier ? { contains: supplier } : undefined
            }
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            },

        }
    });


    data = manualFilterSearchData(searchDate, searchDueDate, data)

    return { statusCode: 0, data };
}

async function getOne(id) {
    // const childRecord = await prisma.deliveryChallan.count({ where: { id: parseInt(id) } });
    const data = await prisma.deliveryInvoice.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            DeliveryInvoiceItems: {
                select: {
                    id: true,
                    deliveryChallanId: true,
                    deliveryChallanItemsId: true,
                    styleId: true,
                    styleItemId: true,
                    noOfBox: true,
                    uomId: true,
                    colorId: true,
                    qty: true,
                    active: true,
                    price: true,
                    invoiceQty: true,
                    hsnId: true,
                    Style: {
                        select: {
                            name: true
                        }
                    },
                    StyleItem: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    DeliveryChallan: {
                        select: {
                            docId: true
                        }
                    },
                    DeliveryChallanItems: {
                        select: {
                            qty: true
                        }
                    },
                    Hsn: {
                        select: {
                            name: true,
                            tax: true
                        }
                    }



                }
            }
        }
    })
    if (!data) return NoRecordFound("styleItem");
    return { statusCode: 0, data: { ...data, } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.DeliveryInvoice.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                }
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { finYearId, branchId, supplierId, netBillValue, transportMode, transporter, vehicleNo, taxTemplateId, remarks, invoiceItems,
        termsandcondtions, discountType, discountValue
    } = await body



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);


    const dcIds = invoiceItems
        ?.map(i => Number(i.deliveryChallanItemsId))
        .filter(Boolean); // remove null / undefined

    let data;
    await prisma.$transaction(async (tx) => {


        data = await prisma.deliveryInvoice.create(
            {
                data: {

                    docId,
                    supplierId: supplierId ? parseInt(supplierId) : "",
                    transportMode: transportMode ? transportMode : "",
                    transporter: transporter ? transporter : "",
                    vehicleNo: vehicleNo ? vehicleNo : "",
                    remarks: remarks ? remarks : '',
                    // taxPercent: taxTemplateId ? parseFloat(taxTemplateId) : "",
                    termsandcondtions: termsandcondtions ? termsandcondtions : "",
                    discountType: discountType ? discountType : "",
                    discountValue: discountValue ? parseFloat(discountValue) : undefined,
                    DeliveryInvoiceItems: invoiceItems?.length > 0
                        ? {
                            createMany: {
                                data: invoiceItems.map((sub) => ({
                                    styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                                    styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                                    noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                                    uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                                    colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                                    invoiceQty: sub?.invoiceQty ? parseFloat(sub.invoiceQty) : undefined,
                                    price: sub?.price ? parseFloat(sub.price) : undefined,
                                    deliveryChallanId: sub?.deliveryChallanId ? parseInt(sub?.deliveryChallanId) : undefined,
                                    deliveryChallanItemsId: sub?.id ? parseInt(sub?.id) : undefined,
                                    hsnId: sub?.hsnId ? sub?.hsnId : undefined,

                                })),
                            },
                        }
                        : undefined,

                    Ledger: {
                        create: {
                            // EntryType: isProcessBillEntry ? "Process_Bill" : "Purchase_Bill",
                            LedgerType: "Supplier",
                            creditOrDebit: "Credit",
                            partyId: parseInt(supplierId),
                            amount: parseFloat(netBillValue),
                            // dcNo: dcNo,
                            // dcDate: new Date(dcDate)

                        }
                    }

                }


            }
        )
        await tx.DeliveryChallanItems.updateMany({
            where: {
                id: {
                    in: dcIds,
                },

            },
            data: {
                isInvoice: true,
            },
        });

    })
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { taxTemplateId, docId, supplierId, netBillValue, transportMode, transporter, vehicleNo, invoiceItems, remarks, termsandcondtions,
        discountType, discountValue
    } = await body

    const incomingIds = invoiceItems?.filter(i => i.id).map(i => parseInt(i.id));

    const dataFound = await prisma.deliveryInvoice.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("styleItem");
    const data = await prisma.deliveryInvoice.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            supplierId: supplierId ? parseInt(supplierId) : "",
            transportMode: transportMode ? transportMode : "",
            transporter: transporter ? transporter : "",
            vehicleNo: vehicleNo ? vehicleNo : "",
            remarks: remarks ? remarks : '',
            // taxPercent: taxTemplateId ? parseFloat(taxTemplateId) : "",
            termsandcondtions: termsandcondtions ? termsandcondtions : "",
            discountType: discountType ? discountType : "",
            discountValue: discountValue ? parseFloat(discountValue) : undefined,
            DeliveryInvoiceItems: {
                deleteMany: {
                    ...(incomingIds.length > 0 && {
                        id: { notIn: incomingIds }
                    })
                },

                update: invoiceItems
                    .filter(item => item.id)
                    .map((sub) => ({
                        where: { id: parseInt(sub.id) },
                        data: {
                            styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                            styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                            noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                            uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                            colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                            invoiceQty: sub?.invoiceQty ? parseFloat(sub.invoiceQty) : undefined,
                            price: sub?.price ? parseFloat(sub.price) : undefined,
                            deliveryChallanId: sub?.deliveryChallanId ? parseInt(sub?.deliveryChallanId) : undefined,
                            deliveryChallanItemsId: sub?.deliveryChallanItemsId ? parseInt(sub?.deliveryChallanItemsId) : undefined,
                            hsnId: sub?.hsnId ? sub?.hsnId : undefined,


                        },
                    })),

                create: invoiceItems
                    .filter(item => !item.id)
                    .map((sub) => ({
                        styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                        styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                        noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                        uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                        colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                        invoiceQty: sub?.invoiceQty ? parseFloat(sub.invoiceQty) : undefined,
                        price: sub?.price ? parseFloat(sub.price) : undefined,
                        deliveryChallanId: sub?.deliveryChallanId ? parseInt(sub?.deliveryChallanId) : undefined,
                        deliveryChallanItemsId: sub?.id ? parseInt(sub?.id) : undefined,
                        hsnId: sub?.hsnId ? sub?.hsnId : undefined,



                    })),

            },

            Ledger: {
                upsert: {
                    update: {
                        amount: parseFloat(netBillValue),
                    },
                    create: {
                        LedgerType: "Supplier",
                        creditOrDebit: "Credit",
                        partyId: parseInt(supplierId),
                        amount: parseFloat(netBillValue),
                    },
                },
            }




        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.DeliveryInvoice.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove,
    getDcItems
}
