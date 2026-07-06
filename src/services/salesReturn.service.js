import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.salesReturn.findFirst({
        where: {
            branchId: parseInt(branchId),
            AND: [
                {
                    createdAt: {
                        gte: startTime

                    }
                },
                {
                    createdAt: {
                        lte: endTime
                    }
                }
            ],
        },
        orderBy: {
            id: 'desc'
        }
    });
    const branchObj = await getTableRecordWithId(branchId, "branch")
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SR/1`


    if (lastObject) {

        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SR/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`


    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true)
        // (searchSupplierDcDate ? String(getDateFromDateTime(item.dueDate)).includes(searchSupplierDcDate) : true) 
        // (searchPurchaseBillNo ?String(item.purchaseBillId).includes(searchPurchaseBillNo) : true) 
    )
}

async function get(req) {
    const { companyId, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchSupplierName, } = req.query
    let data = await prisma.salesReturn.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
            supplier: {
                name: Boolean(searchSupplierName) ? { contains: searchSupplierName } : undefined
            }
        },
        include: {
            SalesBill: {
                select: {
                    docId: true
                }
            }
        }
    });
    data = manualFilterSearchData(searchBillDate, data)
    const totalCount = data.length
    console.log(data, 'data');
    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)
    return { statusCode: 0, nextDocId: newDocId, data };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.salesReturn.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            SalesReturnItems: {
                select: {
                    id: true,
                    Product: {
                        select: {
                            name: true,
                            ProductBrand: {
                                select: {
                                    name: true,
                                }
                            },
                            ProductCategory: {
                                select: {
                                    name: true,
                                }
                            },
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    productId: true,
                    qty: true,
                    salesQty: true,
                    stockQty: true,
                    uomId: true,
                    salesBillItemsId: true,


                }
            }
        }
    })
    console.log(data, 'data');

    if (!data) return NoRecordFound("salesReturn");

    data["SalesReturnItems"] = await (async function getReturnQty() {
        const promises = data["SalesReturnItems"].map(async (i) => {
            const returnQty = await prisma.$queryRaw`
                SELECT COALESCE(SUM("qty"), 0) AS "qty"
                FROM "SalesReturnItems"
                WHERE "salesBillItemsId" = ${i.salesBillItemsId}
            `;
            i["alreadyReturnQty"] = returnQty[0]['qty']
            return i
        })
        return Promise.all(promises);
    })()
    console.log(data, 's data');

    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
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
        }
    })
    return { statusCode: 0, data: data };
}



async function createSalesReturnItems(tx, salesReturnItems, salesReturn) {

    const promises = salesReturnItems.map(async (item) => {
        return await tx.salesReturnItems.create({
            data: {
                salesReturnId: parseInt(salesReturn.id),
                productId: item?.productId ? parseInt(item.productId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : 0.000,
                salesQty: item?.salesQty ? parseFloat(item.salesQty) : 0.000,
                stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                salesBillItemsId: parseInt(item.salesBillItemsId),
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                Stock: {
                    create: {
                        inOrOut: "In",
                        productId: item?.productId ? parseInt(item.productId) : undefined,
                        qty: parseFloat(item.qty),
                        branchId: parseInt(salesReturn.branchId),
                        uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                    }
                }
            }
        })
    }
    )
    return Promise.all(promises)
}




async function create(body) {
    let data;
    const { dueDate, address, place, salesReturnItems, salesBillId, companyId, active, branchId } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.salesReturn.create(
            {
                data: {
                    docId: newDocId,
                    address, place,
                    companyId: parseInt(companyId), active,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    branchId: parseInt(branchId),
                    salesBillId: parseInt(salesBillId),

                }
            })
        await createSalesReturnItems(tx, salesReturnItems, data)

    })
    return { statusCode: 0, data };
}




async function updateSalesReturnItems(tx, salesReturnItems, salesReturn) {
    let removedItems = salesReturn.SalesReturnItems.filter(oldItem => {
        let result = salesReturnItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.SalesReturnItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = salesReturnItems.map(async (item) => {
        if (item?.id) {
            return await tx.salesReturnItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {

                    qty: item?.qty ? parseFloat(item.qty) : 0.000,

                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                    Stock: {
                        update: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(salesReturn.branchId),
                        }
                    }
                }
            })
        } else {
            return await tx.salesReturnItems.create({
                data: {
                    salesReturnId: parseInt(salesReturn.id),

                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    salesQty: item?.salesQty ? parseFloat(item.salesQty) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                    salesBillItemsId: parseInt(item.salesBillItemsId),
                    uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                    Stock: {
                        create: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(salesReturn.branchId),
                            uomId: item?.uomId ? parseInt(item.uomId) : undefined,

                        }
                    }
                }
            })
        }
    })
    return Promise.all(promises)
}

async function update(id, body) {
    let data
    const { supplierId, dueDate, address, place, salesReturnItems, companyId, branchId, salesBillId, active } = await body
    const dataFound = await prisma.salesReturn.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("salesReturn");
    await prisma.$transaction(async (tx) => {
        data = await tx.salesReturn.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place, supplierId: parseInt(supplierId),
                companyId: parseInt(companyId), active,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                branchId: parseInt(branchId),
                salesBillId: parseInt(salesBillId),
            },
            include: {
                SalesReturnItems: true
            }
        })
        await updateSalesReturnItems(tx, salesReturnItems, data)
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.salesReturn.delete({
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
    remove
}
