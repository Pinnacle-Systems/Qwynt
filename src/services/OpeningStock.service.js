import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';
import { exclude, getDateFromDateTime, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';




async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.OpeningStock.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PB/1`
    // let newDocId = `PB/1`

    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/SB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchSupplierDcDate, searchSupplierDcNo, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true) &&
        (searchSupplierDcDate ? String(getDateFromDateTime(item.dueDate)).includes(searchSupplierDcDate) : true) &&
        (searchSupplierDcNo ? String(item.supplierDcNo).includes(searchSupplierDcNo) : true)
    )
}

async function get(req) {
    const { companyId,active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate,  searchSupplierDcNo, searchSupplierDcDate } = req.query

    let data;
    //     if (purchaseReport) {
    //         data = await prisma.$queryRaw`

    // SELECT 
    //     party.name AS PartyName,
    //    po.supplierDcNo AS PartyInvoiceNo,
    //    po.createdAt as PurchaseDate,
    //    pobill.price AS Amount


    // FROM
    // PurchaseBill po
    // LEFT JOIN
    // PoBillItems pobill ON pobill.purchaseBillId=po.id
    // LEFT JOIN
    // party ON party.id = po.supplierId      
    // LEFT JOIN
    // branch ON branch.id = po.branchId
    // WHERE
    // po.branchId = ${branchId} AND po.createdAt BETWEEN ${fromDate} AND ${toDate}
    // GROUP BY  party.name, branch.branchName,po.supplierDcNo,po.createdAt, pobill.price;

    //         `;
    //         return { statusCode: 0, data };
    //     }

    data = await prisma.OpeningStock.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            docId: Boolean(searchDocId) ?
                {
                    contains: searchDocId
                }
                : undefined,
          
        },
      
    });


    data = manualFilterSearchData(searchBillDate, searchSupplierDcDate, searchSupplierDcNo, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.OpeningStock.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            OpeningStockItems: {
                select: {
                    id: true,
                  
                    Product: {
                        select: {
                            name: true
                        }
                    },
                 
                    productId: true,
                    qty: true,
                    box: true,
                }
            }
        }
    })

    if (!data) return NoRecordFound("OpeningStock");
    console.log(data,"data")
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.OpeningStock.findMany({
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
async function createpoBillItems(tx, poBillItems, OpeningStock) {
     console.log(poBillItems,"poBillItems123")
    const promises = poBillItems.map(async (item) => {
        return await tx.OpeningStockItems.create({
            data: {
                OpeningStockId: parseInt(OpeningStock.id),
                box: item?.box ? parseFloat(item.box) : 0.000,
                productId: item?.productId ? parseInt(item.productId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : 0.000,
                stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,

                Stock: {
                    create: {
                        inOrOut: "In",
                        productId: item?.productId ? parseInt(item.productId) : undefined,
                        qty: parseFloat(item.qty),
                        branchId: parseInt(OpeningStock.branchId),

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
    const {  address, place, poBillItems,  companyId,branchId ,date   } = await body
    let newDocId = await getNextDocId(branchId)
    await prisma.$transaction(async (tx) => {
        data = await tx.OpeningStock.create(
            {
                data: {
                    docId: newDocId,
                    address, place, 
                    companyId: parseInt(companyId), 
                    dueDate: date ? new Date(date) : undefined,
                    branchId: parseInt(branchId),
                    
                }
            })
        await createpoBillItems(tx, poBillItems, data)

    })
    return { statusCode: 0, data };
}




async function updatePoBillItems(tx, OpeningStockItems, OpeningStock) {
    console.log(OpeningStockItems,"opening")
    let removedItems = OpeningStock.PoBillItems.filter(oldItem => {
        let result = OpeningStockItems.find(newItem => newItem.id === oldItem.id)
        if (result) return false
        return true
    })

    let removedItemsId = removedItems.map(item => parseInt(item.id))

    await tx.PoBillItems.deleteMany({
        where: {
            id: {
                in: removedItemsId
            }
        }
    })

    const promises = OpeningStockItems.map(async (item) => {
        if (item?.id) {
            return await tx.OpeningStockItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    OpeningStockId: parseInt(OpeningStock.id),
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    box: item?.box ? parseFloat(item.box) : 0.000,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                    Stock: {
                        update: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(OpeningStock.branchId),
                        }
                    }
                }
            })
        } else {
            return await tx.OpeningStockItems.create({
                data: {
                    purchaseBillId: parseInt(OpeningStock.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    Stock: {
                        create: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(OpeningStock.branchId),
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
    const { dueDate, address, place, poBillItems, companyId,branchId,  } = await body
    console.log(ope)
    const dataFound = await prisma.openingStock.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("OpeningStock");
    await prisma.$transaction(async (tx) => {
        data = await tx.OpeningStock.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place, 
                companyId: parseInt(companyId), 
                dueDate: dueDate ? new Date(dueDate) : undefined,
                branchId: parseInt(branchId),
              

            },
            include: {
                OpeningStockItems: true
            }
        })
        await updatePoBillItems(tx, poBillItems, data)
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.OpeningStock.delete({
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