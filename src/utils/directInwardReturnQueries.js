import { prisma } from '../lib/prisma.js'

async function getAllDataWithLotDetails(allData) {
    let promises = allData.map(async (item) => {
        item["lotDetails"] = await getLotDetailsForDInwardOrReturn(item.directInwardOrReturnId, item.lotNoCommonIndex)
        return item
    })
    return Promise.all(promises)
}

async function getLotDetailsForDInwardOrReturn(directInwardOrReturnId, lotNoCommonIndex) {
    let dataArr = await prisma.directItems.groupBy({
        where: {
            directInwardOrReturnId: parseInt(directInwardOrReturnId),
            lotNoCommonIndex: Number.isInteger(lotNoCommonIndex) ? parseInt(lotNoCommonIndex) : undefined
        },
        by: ["lotNo", "stockId","directInwardOrReturnId", "id", "lotNoCommonIndex"],
        _sum: {
            qty: true,
            weightPerBag: true,
            noOfBags: true,
            noOfRolls: true
        },
    })
    return dataArr.map(item => {
        let newItem = {}; 
        newItem["id"] = item["id"]
        newItem["stockId"] = item["stockId"]
        newItem["lotNoCommonIndex"] = item["lotNoCommonIndex"]
        newItem["directInwardOrReturnId"] = item["directInwardOrReturnId"]
        newItem["lotNo"] = item["lotNo"];
        newItem["noOfBags"] = item?._sum.noOfBags;
        newItem["weightPerBag"] = item?._sum.weightPerBag;
        newItem["noOfRolls"] = item?._sum.noOfRolls;
        newItem["qty"] = item?._sum.qty;
        return newItem
    })
}

export async function getDirectInwardReturnItemsLotBreakUp(directInwardOrReturnId, poType) {
    let allData = await prisma.directItems.findMany({
        where: {
            directInwardOrReturnId: parseInt(directInwardOrReturnId)
        },
        distinct: poType !== "Accessory" ? "lotNoCommonIndex" : undefined
    })
    return await getAllDataWithLotDetails(allData)
}
