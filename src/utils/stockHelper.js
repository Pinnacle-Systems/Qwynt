import { prisma } from "../lib/prisma.js";
import { substract } from "./helper.js";
import { getTableRecordWithId } from "./helperQueries.js";


async function getStockObject(transType, inwardOrReturn, item, storeId, branchId) {
    let newItem = {};
    newItem["itemType"] = transType;
    newItem["inOrOut"] = inwardOrReturn;
    let poItem;
    if (inwardOrReturn === "DirectInward") {
        poItem = item
    } else {
        poItem = await getTableRecordWithId(item.poItemsId, "poItems")
    }
    if ((transType === "GreyYarn") || (transType === "DyedYarn")) {
        newItem["yarnId"] = parseInt(poItem["yarnId"]);
        newItem["noOfBags"] = parseInt(item["noOfBags"]);
        if (inwardOrReturn === "PurchaseReturn") {
            newItem["noOfBags"] = substract(0, parseFloat(item["noOfBags"]))
        } else {
            newItem["noOfBags"] = parseFloat(item["noOfBags"])
        }
    } else if ((transType === "GreyFabric") || (transType === "DyedFabric")) {
        newItem["fabricId"] = parseInt(poItem["fabricId"]);
        newItem["designId"] = parseInt(poItem["designId"]);
        newItem["gaugeId"] = parseInt(poItem["gaugeId"]);
        newItem["loopLengthId"] = parseInt(poItem["loopLengthId"]);
        newItem["gsmId"] = parseInt(poItem["gsmId"]);
        newItem["kDiaId"] = parseInt(poItem["kDiaId"]);
        newItem["fDiaId"] = parseInt(poItem["fDiaId"]);
        if (inwardOrReturn === "PurchaseReturn") {
            newItem["noOfRolls"] = substract(0, parseFloat(item["noOfRolls"]))
        } else {
            newItem["noOfRolls"] = parseFloat(item["noOfRolls"])
        }
    } else if (transType === "Accessory") {
        newItem["accessoryId"] = parseInt(poItem["accessoryId"])
        newItem["sizeId"] = parseInt(poItem["sizeId"])
    }
    newItem["uomId"] = parseInt(poItem["uomId"])
    newItem["colorId"] = parseInt(poItem["colorId"])
    if (inwardOrReturn === "PurchaseReturn") {
        newItem["qty"] = substract(0, parseFloat(item["qty"]))
    } else {
        newItem["qty"] = parseFloat(item["qty"])
    }
    newItem["price"] = parseFloat(poItem["price"])
    newItem["lotNo"] = item["lotNo"] ? item["lotNo"] : null;
    newItem["storeId"] = parseInt(storeId)
    newItem["branchId"] = parseInt(branchId)
    return newItem
}

export const stockCreate = async (tx, poType, inwardOrReturn, item, storeId, branchId) => {
    let stockObject = await getStockObject(poType, inwardOrReturn, item, storeId, branchId)
    const stockData = await tx.stock.create({
        data: stockObject
    })
    item["stockId"] = stockData.id;
    return item
}

export const createManyStockWithId = async (tx, poType, inwardOrReturn, items, storeId, branchId) => {
    let promises = items.map(async (item) => await stockCreate(tx, poType, inwardOrReturn, item, storeId, branchId))
    return Promise.all(promises);
}

export const stockUpdateOrCreate = async (tx, poType, inwardOrReturn, item, storeId, branchId) => {
    let stockObject = await getStockObject(poType, inwardOrReturn, item, storeId, branchId)

    if (item?.stockId) {
        await tx.stock.update({
            where: {
                id: parseInt(item.stockId)
            },
            data: stockObject
        })
    } else {
        const stockData = await tx.stock.create({
            data: stockObject
        })
        item["stockId"] = stockData.id;
    }
    return item
}


export const updateManyStockWithId = async (tx, poType, inwardOrReturn, items, storeId, branchId) => {
    let promises = items.map(async (item) => await stockUpdateOrCreate(tx, poType, inwardOrReturn, item, storeId, branchId))
    return Promise.all(promises);
}

export async function getStockQtyForRawMaterials(transType, item, storeId, branchId, stockId) {
    const stockObject = await prisma.stock.aggregate(
        {
            where: {
                id: stockId ? {
                    lt: parseInt(stockId)
                } : undefined,
                itemType: transType,
                yarnId: item?.yarnId ? parseInt(item.yarnId) : undefined,
                accessoryId: item?.accessoryId ? parseInt(item.accessoryId) : undefined,
                fabricId: item?.fabricId ? parseInt(item.fabricId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
                designId: item?.designId ? parseInt(item.designId) : undefined,
                gaugeId: item?.gaugeId ? parseInt(item.gaugeId) : undefined,
                loopLengthId: item?.loopLengthId ? parseInt(item.loopLengthId) : undefined,
                gsmId: item?.gsmId ? parseInt(item.gsmId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                kDiaId: item?.kDiaId ? parseInt(item.kDiaId) : undefined,
                fDiaId: item?.fDiaId ? parseInt(item.fDiaId) : undefined,
                lotNo: item?.lotNo ? item.lotNo : undefined,
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                processId: item.processId ? parseInt(item.processId) : undefined,
            },
            _sum: {
                qty: true,
            }
        })
    return { qty: stockObject?._sum?.qty ? stockObject?._sum?.qty : 0 }
}


export async function getStockQtyForFinishedGoods(item, storeId, branchId, stockId) {
    const stockObject = await prisma.stockForPcs.aggregate(
        {
            where: {
                id: stockId ? {
                    lt: parseInt(stockId)
                } : undefined,
                styleId: item?.styleId ? parseInt(item.styleId) : undefined,
                sizeId: item?.sizeId ? parseInt(item.sizeId) : undefined,
                branchId: parseInt(branchId),
                storeId: parseInt(storeId),
                prevProcessId: item.prevProcessId ? parseInt(item.prevProcessId) : undefined,
                colorId: item?.colorId ? parseInt(item.colorId) : undefined,
                uomId: item?.uomId ? parseInt(item.uomId) : undefined,
            },
            _sum: {
                qty: true,
            }
        })
    return { qty: stockObject?._sum?.qty ? stockObject?._sum?.qty : 0 }
}
