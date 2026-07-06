import { Prisma } from "../lib/prisma.js";
import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { exclude, getDateFromDateTime, getDateFromDateTimeDB, getDateTimeRange, getDateTimeRangeForCurrentYear, getYearShortCode } from '../utils/helper.js';



async function getNextDocId(branchId) {
    const { startTime, endTime } = getDateTimeRangeForCurrentYear(new Date());
    let lastObject = await prisma.purchaseBill.findFirst({
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
        newDocId = `${branchObj.branchCode}/${getYearShortCode(new Date())}/PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
        // newDocId = `PB/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`

    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchSupplierDcDate, searchSupplierDcNo,searchSelectedDate,data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.createdAt)).includes(searchBillDate) : true) &&
        (searchSupplierDcDate ? String(getDateFromDateTime(item.dueDate)).includes(searchSupplierDcDate) : true) &&
        (searchSupplierDcNo ? String(item.supplierDcNo).includes(searchSupplierDcNo) : true)&&
        (searchSelectedDate ? String(getDateFromDateTime(item.selectedDate)).includes(searchSelectedDate) : true) 

    )
}

async function get(req) {
    const { companyId, purchaseReport, filterSupplier, active, branchId, pagination, pageNumber, dataPerPage, searchDocId, 
        searchBillDate, searchSupplierName, searchSupplierDcNo, fromDate, toDate,partyList,productList, searchSupplierDcDate,searchSelectedDate } = req.query
   console.log(searchSelectedDate,"searchSelectedDate")
   console.log(searchBillDate,"searchBillDate")

    let data;
    const partyListData = partyList? JSON.parse(partyList) : []
    const productListData = productList? JSON.parse(productList) : []
   const { startTime: startDateStartTime, endTime: startDateEndTime } = getDateTimeRange(fromDate);
   const { startTime: endDateStartTime, endTime: endDateEndTime } = getDateTimeRange(toDate);
   console.log(partyListData,"partyData")
   console.log(productListData,"ProductData")
   if (purchaseReport) {
    const pData = partyListData.length > 0
        ? Prisma.sql`AND party."name" IN (${Prisma.join(partyListData)})`
        : Prisma.empty;
    const prodData = productListData.length > 0
        ? Prisma.sql`AND product."name" IN (${Prisma.join(productListData)})`
        : Prisma.empty;

    let startDate;
    let endDate;
    const today = new Date().toISOString().slice(0, 10); 
    
    if (startDateStartTime && endDateEndTime) {
        startDate = getDateFromDateTimeDB(startDateStartTime);
        endDate = getDateFromDateTimeDB(endDateEndTime);
        
      
        if (startDate && endDate && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate))) {
            startDate = startDate;
            endDate = endDate;
        } else {
            startDate = today;
            endDate = today;
        }
    } else {
        startDate = today;
        endDate = today;
    }

    data = await prisma.$queryRaw`
        SELECT
            DATE("purchaseBill"."createdAt") AS "Date",
            party."name" AS "Party",
            product."name" AS "Product",
            SUM("poBillItems"."qty") AS "Qty",
            ROUND(AVG("poBillItems"."price")::numeric, 2) AS "AvgPrice",
            SUM("poBillItems"."qty") * ROUND(AVG("poBillItems"."price")::numeric, 2) AS "TotalPrice"
        FROM
            "PoBillItems" "poBillItems"
        JOIN
            "Product" product ON "poBillItems"."productId" = product.id
        JOIN
            "PurchaseBill" "purchaseBill" ON "purchaseBill".id = "poBillItems"."purchaseBillId"
        JOIN
            "Party" party ON party.id = "purchaseBill"."supplierId"
        WHERE
            DATE("purchaseBill"."createdAt") BETWEEN ${startDate} AND ${endDate}
            ${pData}
            ${prodData}
        GROUP BY
            DATE("purchaseBill"."createdAt"), party."name", product."name"
    `;
    return { statusCode: 0, data };
}

     
else{
    data = await prisma.purchaseBill.findMany({
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
            supplier: {
                select: {
                    name: true
                }
            }
        }
    });


    data = manualFilterSearchData(searchBillDate, searchSupplierDcDate,searchSelectedDate, searchSupplierDcNo, data)
    const totalCount = data.length

    if (pagination) {
        data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    }
    let newDocId = await getNextDocId(branchId)

    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}
    
}


async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.purchaseBill.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            supplier: {
                select: {
                    name: true,
                    contactMobile:true,
                    contactPersonName: true,
                    address:true,
                    pincode:true,
                }
            },
            PoBillItems: {
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
                    price: true,
                    stockQty: true,
                }
            }
        }
    })

    if (!data) return NoRecordFound("purchaseBill");
    data["PoBillItems"] = await (async function getReturnQty() {
        const promises = data["PoBillItems"].map(async (i) => {
            const returnQty = await prisma.$queryRaw`
                SELECT COALESCE(SUM("qty"), 0) AS "returnQty"
                FROM "PoReturnItems"
                WHERE "purchaseBillItemsId" = ${i.id}
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
    const data = await prisma.purchaseBill.findMany({
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
async function createpoBillItems(tx, poBillItems, purchaseBill) {

    const promises = poBillItems.map(async (item) => {
        return await tx.poBillItems.create({
            data: {
                purchaseBillId: parseInt(purchaseBill.id),
                box: item?.box ? parseFloat(item.box) : 0.000,
                productId: item?.productId ? parseInt(item.productId) : undefined,
                qty: item?.qty ? parseFloat(item.qty) : 0.000,
                price: item?.price ? parseFloat(item.price) : 0.000,
                uomId: item?.uomId ? parseFloat(item.uomId) : undefined,
                stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,

                Stock: {
                    create: {
                        inOrOut: "In",
                        productId: item?.productId ? parseInt(item.productId) : undefined,
                        qty: parseFloat(item.qty),
                        branchId: parseInt(purchaseBill.branchId),

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
    console.log(body, "body");

    const { 
        supplierId, dueDate, address, place, poBillItems, supplierDcNo, 
        companyId, active, icePrice, packingCharge, labourCharge, tollgate, 
        transport, ourPrice, branchId, netBillValue,selectedDate 
    } = body;

    let newDocId = await getNextDocId(branchId);

    // Start transaction
    await prisma.$transaction(async (tx) => {
        // Create the purchaseBill record
        data = await tx.purchaseBill.create({
            data: {
                docId: newDocId,
                supplierDcNo,
                address,
                place,
                supplierId: parseInt(supplierId), 
                companyId: parseInt(companyId),
                active,
                dueDate: dueDate ? new Date(dueDate) : null, // Ensuring null if undefined
                selectedDate: selectedDate? new Date(selectedDate) : 'null',
                branchId: parseInt(branchId),
                netBillValue: netBillValue ? parseFloat(netBillValue) : 0,
                icePrice: icePrice ? parseFloat(icePrice) : 0,
                packingCharge: packingCharge ? parseFloat(packingCharge) : 0,
                labourCharge: labourCharge ? parseFloat(labourCharge) : 0,
                tollgate: tollgate ? parseFloat(tollgate) : 0,
                transport: transport ? parseFloat(transport) : 0,
                ourPrice: ourPrice ? parseFloat(ourPrice) : 0
            }
        });

    
        await createpoBillItems(tx, poBillItems, data);
    });

    return { statusCode: 0, data };
}





async function updatePoBillItems(tx, poBillItems, purchaseBill) {
    let removedItems = purchaseBill.PoBillItems.filter(oldItem => {
        let result = poBillItems.find(newItem => newItem.id === oldItem.id)
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

    const promises = poBillItems.map(async (item) => {
        if (item?.id) {
            return await tx.poBillItems.update({
                where: {
                    id: parseInt(item.id)
                },
                data: {
                    purchaseBillId: parseInt(purchaseBill.id),
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    box: item?.box ? parseFloat(item.box) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                    uomId: item?.uomId ? parseFloat(item.uomId) : undefined,
                    stockQty: item?.stockQty ? parseFloat(item.stockQty) : undefined,
                    Stock: {
                        update: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(purchaseBill.branchId),
                        }
                    }
                }
            })
        } else {
            return await tx.poBillItems.create({
                data: {
                    purchaseBillId: parseInt(purchaseBill.id),
                    productBrandId: item?.productBrandId ? parseInt(item.productBrandId) : undefined,
                    productCategoryId: item?.productCategoryId ? parseInt(item.productCategoryId) : undefined,
                    productId: item?.productId ? parseInt(item.productId) : undefined,
                    qty: item?.qty ? parseFloat(item.qty) : 0.000,
                    price: item?.price ? parseFloat(item.price) : 0.000,
                    Stock: {
                        create: {
                            inOrOut: "In",
                            productId: item?.productId ? parseInt(item.productId) : undefined,
                            qty: parseFloat(item.qty),
                            branchId: parseInt(purchaseBill.branchId),
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
    const { supplierId, dueDate, address, place, poBillItems, companyId, supplierDcNo, branchId, active, netBillValue,
          icePrice, packingCharge, labourCharge, tollgate, 
        transport, ourPrice,selectedDate } = await body
        console.log(selectedDate,"selectDate")
    const dataFound = await prisma.purchaseBill.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("purchaseBill");
    await prisma.$transaction(async (tx) => {
        data = await tx.purchaseBill.update({
            where: {
                id: parseInt(id),
            },
            data: {
                address, place, supplierId: parseInt(supplierId), supplierDcNo,
                companyId: parseInt(companyId), active,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                selectedDate: selectedDate? new Date(selectedDate) : 'null',
                branchId: parseInt(branchId),
                netBillValue: parseInt(netBillValue),
                netBillValue: netBillValue ? parseFloat(netBillValue) : 0,
                icePrice: icePrice ? parseFloat(icePrice) : 0,
                packingCharge: packingCharge ? parseFloat(packingCharge) : 0,
                labourCharge: labourCharge ? parseFloat(labourCharge) : 0,
                tollgate: tollgate ? parseFloat(tollgate) : 0,
                transport: transport ? parseFloat(transport) : 0,
                ourPrice: ourPrice ? parseFloat(ourPrice) : 0

            },
            include: {
                PoBillItems: true
            }
        })
        await updatePoBillItems(tx, poBillItems, data)
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.purchaseBill.delete({
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
