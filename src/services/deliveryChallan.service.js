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
        let lastObject = await prisma.deliveryChallan.findFirst({
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
        let newDocId = `${branchObj.branchCode}/${shortCode}/DC/1`
        if (lastObject) {
            newDocId = `${branchObj.branchCode}/${shortCode}/DC/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
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

    console.log({
        serachDocNo,
        searchDate, searchDueDate
    }, "searchDueDate")

    let data = await prisma.deliveryChallan.findMany({
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
                    isBranch : true,
                    BranchType : {
                        select : {
                            name : true
                        }
                    },
                    City : {
                        select : {
                            name : true
                        }
                    }
                }
            },
            _count: {
                select: {
                    DeliveryInvoiceItems: true
                }
            }
        },
        orderBy : {
            id : "desc"

        }
    });


    data = manualFilterSearchData(searchDate, searchDueDate, data)

    return {
        statusCode: 0,
        data: data = data.map(dc => ({
            ...dc,
            childRecord: dc?._count.DeliveryInvoiceItems > 0
        })),
    };
}

async function getDcItems(req) {

    const { serachDocNo, supplier, supplierId, pagination } = req.query



    let data = await prisma.deliveryChallanItems.findMany({
        where: {
        },
        include: {

            DeliveryChallan: {
                select: {
                    Party: {
                        select: {
                            name: true,
                            id: true
                        }
                    },
                    docId: true,
                    id: true
                },
            },
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
            DeliveryInvoiceItems: true,
            Hsn : {
                select : {
                    name : true ,
                    tax : true
                }
            }

        }
    });

    if (pagination) {
        console.log(data, "data");

        data = data
            // 1️⃣ FIRST: filter by supplier / party
            ?.filter(i => {
                if (!supplierId) return true;
                return i?.DeliveryChallan?.Party?.id == supplierId;
            })

            // 2️⃣ THEN: calculate totalQty & balanceQty
            .map(i => {
                const totalQty =
                    i.DeliveryInvoiceItems?.reduce(
                        (sum, next) => sum + Number(next.invoiceQty || 0),
                        0
                    ) || 0;

                const balanceQty = Number(i.qty || 0) - totalQty;

                return {
                    ...i,
                    totalQty,
                    balanceQty,
                };
            })

            .filter(i => i.balanceQty > 0);
    }




    return { statusCode: 0, data };
}

async function getOne(id) {
    // const childRecord = await prisma.deliveryChallan.count({ where: { id: parseInt(id) } });
    const data = await prisma.deliveryChallan.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            DeliveryChallanItems: {
                select: {
                    id: true,
                    deliveryChallanId: true,
                    styleId: true,
                    Style: {
                        select: {
                            name: true
                        }
                    },
                    styleItemId: true,
                    StyleItem: {
                        select: {
                            name: true
                        }
                    },
                    noOfBox: true,
                    uomId: true,
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    colorId: true,
                    Color: {
                        select: {
                            name: true
                        }
                    },
                    qty: true,
                    isInvoice: true,
                    active: true,
                    hsnId: true,
                    Hsn: {
                        select: {
                            name: true,
                            tax: true
                        }
                    },
                    DeliveryInvoiceItems: {
                        select: {
                            invoiceQty: true
                        }
                    }

                }
            }
        }

    })

    const updatedItems = data.DeliveryChallanItems.map(item => {
        const totalInvoiceQty = item.DeliveryInvoiceItems.reduce(
            (sum, inv) => sum + (inv.invoiceQty || 0),
            0
        );

        return {
            ...item,
            totalInvoiceQty,
        };
    });


    if (!data) return NoRecordFound("styleItem");
    return {
        statusCode: 0, data: {
            ...data, DeliveryChallanItems: updatedItems,
        }
    };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active, } = req.query
    const data = await prisma.styleItem.findMany({
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
    const { finYearId, branchId, supplierId, deliveryType, dcNo, dcDate, deliveryItems, remarks, vehicleNo, deliveryTo } = await body



    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    console.log(finYearDate, "finYearDate")
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let docId = await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime);

    const data = await prisma.deliveryChallan.create(
        {
            data: {
                remarks: remarks ? remarks : "",
                docId,
                Party: {
                    connect: { id: parseInt(supplierId) }   // supplierId goes here
                },
                dcNo: dcNo ? dcNo : "",
                dcDate: dcDate ? new Date(dcDate) : undefined,
                // DeliveryParty: {
                //     connect: { id: deliveryToId ?  parseInt(deliveryToId) : 0 } // use actual ID
                // },

                deliveryType: deliveryType ? deliveryType : undefined,
                vechineNo: vehicleNo ? vehicleNo : undefined,
                deliveryTo: deliveryTo ? parseInt(deliveryTo) : undefined,
                DeliveryChallanItems: deliveryItems?.length > 0
                    ? {
                        createMany: {
                            data: deliveryItems.map((sub) => ({
                                styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                                styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                                noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                                uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                                colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                                qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                                hsnId: sub?.hsnId ? parseInt(sub?.hsnId) : undefined


                            })),
                        },
                    }
                    : undefined,




            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { supplierId, dcNo, dcDate, deliveryItems, remarks, vehicleNo, deliveryTo } = await body


    const incomingIds = deliveryItems?.filter(i => i.id).map(i => parseInt(i.id));

    const dataFound = await prisma.deliveryChallan.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("styleItem");
    const data = await prisma.deliveryChallan.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            Party: {
                connect: { id: parseInt(supplierId) }
            },
            dcNo: dcNo ? dcNo : undefined,
            dcDate: dcDate ? new Date(dcDate) : undefined,
            remarks: remarks ? remarks : undefined,
            vechineNo: vehicleNo ? vehicleNo : undefined,
            deliveryTo: deliveryTo ? parseInt(deliveryTo) : undefined,
            DeliveryChallanItems: {
                deleteMany: {
                    ...(incomingIds.length > 0 && {
                        id: { notIn: incomingIds }
                    })
                },

                update: deliveryItems
                    .filter(item => item.id)
                    .map((sub) => ({
                        where: { id: parseInt(sub.id) },
                        data: {
                            styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                            styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                            noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                            uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                            colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                            qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                            hsnId: sub?.hsnId ? parseInt(sub?.hsnId) : undefined


                        },
                    })),

                create: deliveryItems
                    .filter(item => !item.id)
                    .map((sub) => ({
                        styleId: sub?.styleId ? parseInt(sub.styleId) : undefined,
                        styleItemId: sub?.styleItemId ? parseInt(sub?.styleItemId) : undefined,
                        noOfBox: sub?.noOfBox ? sub.noOfBox : undefined,
                        uomId: sub?.uomId ? parseFloat(sub.uomId) : undefined,
                        colorId: sub?.colorId ? parseFloat(sub.colorId) : undefined,
                        qty: sub?.qty ? parseFloat(sub.qty) : undefined,
                        hsnId: sub?.hsnId ? parseInt(sub?.hsnId) : undefined



                    })),
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.deliveryChallan.delete({
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
