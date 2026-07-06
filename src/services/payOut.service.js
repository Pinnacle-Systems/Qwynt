import { prisma } from "../lib/prisma.js";


import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getDateFromDateTime, getDateTimeRange, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import profitReport from "../utils/reports/profitReport.js";




async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.salesBill.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SB/1`
    // let newDocId = `PB/1`

    if (lastObject) {

        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

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
    const { companyId, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchCustomerName, salesReport, fromDate, toDate, isProfitReport, isOn } = req.query;
    let data;
    const { startTime: startDateStartTime, endTime: startDateEndTime } = getDateTimeRange(fromDate);
    const { startTime: endDateStartTime, endTime: endDateEndTime } = getDateTimeRange(toDate);

    if (isProfitReport) {
        data = await profitReport(startDateStartTime, endDateEndTime);
        return { statusCode: 0, data };
    }

    if (salesReport) {
        data = await prisma.$queryRaw`
            SELECT 
                product.name AS Product,
                SUM(salesBillItems.qty) AS Qty,
                SUM(salesBillItems.price) AS price,
                (SELECT 
                        SUM(subQty * subPrice) 
                    FROM
                        (SELECT 
                            SUM(sub.qty) AS subQty,
                            SUM(sub.qty * sub.price) AS subPrice
                        FROM
                            SalesBillItems sub
                            LEFT JOIN SalesBill subBill ON subBill.id = sub.salesBillId
                        WHERE
                            sub.productId = salesBillItems.productId 
                            AND subBill.createdAt BETWEEN ${startDateStartTime} AND ${endDateEndTime}
                        ) AS e
                ) AS TotalAmount
            FROM
                SalesBillItems salesBillItems
                LEFT JOIN SalesBill salebill ON salebill.id = salesBillItems.salesBillId
                LEFT JOIN product ON product.id = salesBillItems.productId
            WHERE
                salebill.createdAt BETWEEN ${startDateStartTime} AND ${endDateEndTime}
            GROUP BY 
                salesBillItems.productId, product.name
            ORDER BY 
                salebill.createdAt DESC;
        `;
        return { statusCode: 0, data };
    } else {
        data = await prisma.salesBill.findMany({
            where: {
                companyId: companyId ? parseInt(companyId) : undefined,
                active: active ? Boolean(active) : undefined,
                isOn: typeof(isOn) === "undefined" ? undefined : JSON.parse(isOn),
                docId: searchDocId ? {
                    contains: searchDocId
                } : undefined,
                name: searchCustomerName ? {
                    contains: searchCustomerName
                } : undefined,
                supplier: {
                    name: searchCustomerName ? { contains: searchCustomerName } : undefined
                }
            },
            include: {
                SalesBillItems: {
                    select: {
                        qty: true,
                        price: true,
                    }
                },
                supplier: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    data = manualFilterSearchData(searchBillDate, data);
    const totalCount = data.length;

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage);
    }

    let newDocId = await getNextDocId(branchId);
    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}



async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.salesBill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            supplier: {
                select: {
                    name: true,
                    contactMobile:true,
                    contactPersonName: true,
                }
            },
            SalesBillItems: {
                select: {
                    id: true,
                    productBrandId: true,
                    ProductBrand: {
                        select: {
                            name: true
                        }
                    },
                   
                    productCategoryId: true,
                    ProductCategory: {
                        select: {
                            name: true
                        }
                    },
                    Product: {
                        select: {
                            name: true
                        }
                    },
                    Uom: {
                        select: {
                            name: true
                        }
                    },
                    productId: true,
                    qty: true,
                    price: true,
                    uomId: true,
                    stockQty: true,
                }
            }
        }
    })
    if (!data) return NoRecordFound("salesBill");


    data["SalesBillItems"] = await (async function getReturnQty() {
        const promises = data["SalesBillItems"].map(async (i) => {
            const returnQty = await prisma.$queryRaw`
                SELECT COALESCE(SUM("qty"), 0) AS "returnQty"
                FROM "SalesReturnItems"
                WHERE "salesBillItemsId" = ${i.id}
            `;
            i["alreadyReturnQty"] = returnQty[0]['returnQty']
            return i
        })
        return Promise.all(promises);
    })()
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.salesBill.findMany({
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


async function createSalesBillItems(tx, salesBillItems, salesBill, isOn) {
    const promises = salesBillItems.map(async (item) => {
        const baseData = {
            salesBillId: parseInt(salesBill.id),
            productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
            productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
            productId: item?.productId ? parseInt(item.productId) : undefined,
            qty: item?.qty ? parseFloat(item.qty) : 0.000,
            stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
            price: item?.price ? parseFloat(item.price) : 0.000,
        };

        if (isOn) {
            baseData.Stock = {
                create: {
                    inOrOut: "Out",
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: 0 - parseFloat(item.qty),
                    branchId: parseInt(salesBill.branchId),
                }
            };
        }

        return await tx.salesBillItems.create({ data: baseData });
    });

    return Promise.all(promises);
}





async function create(body) {
    let data;
    const { dueDate, address, place, salesBillItems, companyId, active, branchId, contactMobile, supplierId,isOn,netBillValue } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.salesBill.create(
            {
                data: {
                    docId: newDocId,
                    address, place,supplierId: parseInt(supplierId),
                    contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
                    companyId: parseInt(companyId),
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    branchId: parseInt(branchId),
                    isOn,netBillValue:parseInt(netBillValue)

                }
            })
        await createSalesBillItems(tx, salesBillItems, data,isOn)

    })
    return { statusCode: 0, data };
}

async function updateSalesBillItems(tx, salesBillItems, salesBill, isOn) {
    let removedItems = salesBill.SalesBillItems.filter(oldItem => {
        let result = salesBillItems.find(newItem => newItem.id === oldItem.id);
        return !result;
    });

    let removedItemsId = removedItems.map(item => parseInt(item.id));

    await tx.SalesBillItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    });

    const promises = salesBillItems.map(async (item) => {
        const stockData = isOn ? {
            inOrOut: "Out",
            productId: item?.productId ? parseInt(item.productId) : undefined,
            qty: 0 - parseFloat(item.qty),
            branchId: parseInt(salesBill.branchId),
        } : undefined;

        if (item?.id) {
            const salesBillItem = await tx.salesBillItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    salesBillId: parseInt(salesBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                }
            });

            if (isOn) {
                const existingStock = await tx.Stock.findUnique({
                    where: {
                        salesBillItemsId: parseInt(item.id)
                    }
                });

                if (existingStock) {
                    await tx.Stock.update({
                        where: {
                            id: existingStock.id
                        },
                        data: stockData
                    });
                } else {
                    await tx.Stock.create({
                        data: {
                            ...stockData,
                            salesBillItemsId: salesBillItem.id
                        }
                    });
                }
            }

            return salesBillItem;
        } else {
            const newSalesBillItem = await tx.salesBillItems.create({
                data: {
                    salesBillId: parseInt(salesBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                }
            });

            if (isOn) {
                await tx.Stock.create({
                    data: {
                        ...stockData,
                        salesBillItemsId: newSalesBillItem.id
                    }
                });
            }

            return newSalesBillItem;
        }
    });

    return Promise.all(promises);
}

async function update(id, body) {
    let data;
    const { dueDate, address, place, salesBillItems, companyId, branchId, name, contactMobile, isOn,netBillValue } = await body;
    console.log(netBillValue,"netBill")
    const dataFound = await prisma.salesBill.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!dataFound) return NoRecordFound("salesBill");
    await prisma.$transaction(async (tx) => {
        data = await tx.salesBill.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place,
                companyId: parseInt(companyId),
                dueDate: dueDate ? new Date(dueDate) : undefined,
                branchId: parseInt(branchId),
                name,isOn,
                contactMobile: contactMobile ? parseInt(contactMobile) : undefined,
                netBillValue: parseInt(netBillValue)
            },




            include: {
                SalesBillItems: true
            }
        });
        await updateSalesBillItems(tx, salesBillItems, data, isOn);
    });
    return { statusCode: 0, data };
};


async function remove(id) {
    const data = await prisma.salesBill.delete({
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
