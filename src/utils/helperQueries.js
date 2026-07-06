import { prisma } from '../lib/prisma.js'


export async function getTableRecordWithId(id, tableName) {
    return await prisma[tableName].findUnique({
        where: {
            id: parseInt(id)
        }
    })
}

export async function getPoItemsLotBreakUp(poItemsId) {
    return await prisma.poInwardReturnItems.groupBy({
        where: {
            poItemsId
        },
        by: ['poItemsId', "lotNo"],
        _sum: {
            qty: true
        },
    })
}

export async function getAlreadyPaidAmount(billEntryId, payOutId, advanceAdjustmentId) {
    let payOuts = await prisma.payOutItems.aggregate({
        where: {
            billEntryId: parseInt(billEntryId),
            payoutId: {
                lt: JSON.parse(payOutId) ? parseInt(payOutId) : undefined
            }
        },
        _sum: {
            amount: true
        }
    })
    payOuts = payOuts?._sum?.amount ? payOuts?._sum?.amount : 0
    let advanceAdjustMents = await prisma.advanceAdjustDetails.aggregate({
        where: {
            billEntryId: parseInt(billEntryId),
            advanceAdjustMentId: {
                lt: JSON.parse(advanceAdjustmentId) ? parseInt(advanceAdjustmentId) : undefined
            }
        },
        _sum: {
            amount: true
        }
    })
    advanceAdjustMents = advanceAdjustMents?._sum?.amount ? advanceAdjustMents?._sum?.amount : 0
    return payOuts + advanceAdjustMents    
}