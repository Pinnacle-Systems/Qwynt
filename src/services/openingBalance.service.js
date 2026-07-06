import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';


async function getNextDocId(branchId, shortCode, startTime, endTime,) {
    let lastObject = await prisma.openingBalance.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/OPBL/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/OPBL/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, partCategory, searchMobileNo, searchType, searchDueDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.cvv)).includes(searchBillDate) : true)
        && (partCategory ? String(item?.partCategory).includes(partCategory) : true)
        && (searchDueDate ? String(getDateFromDateTime(item.cvv)).includes(searchDueDate) : true)


        && (searchMobileNo ? String(item.contactMobile).includes(searchMobileNo) : true)
        && (searchType ? String(item.paymentType).includes(searchType) : true)

    )
}

async function get(req) {
    const { active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchDueDate, searchCustomerName, searchType, searchMobileNo, finYearId, serachDocNo, searchDate, partCategory, supplier, party } = req.query


    let data = await prisma.openingBalance.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            Party: party
                ? {
                    name: {
                        contains: party, // ✅ no `is`
                    },
                }
                : undefined,

        },
        include: {
            Party: true
        }
    });
    console.log(data, "ipdjfpdopi");

    data = manualFilterSearchData(searchDate, partCategory, searchMobileNo, searchType, searchDueDate, data)
    const totalCount = data.length
    // if (pagination) {
    //     data = data.slice(((pageNumber - 1) * parseInt(dataPerPage)), pageNumber * dataPerPage)
    // }
    let finYearDate = await getFinYearStartTimeEndTime(finYearId);
    const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
    let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startTime, finYearDate?.endTime)) : "";
    return { statusCode: 0, nextDocId: newDocId, data, totalCount };
}
async function getOne(id) {
    const childRecord = 0;
    const data = await prisma.openingBalance.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Party: true
        }
    })
    if (!data) return NoRecordFound("purchaseBill");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.openingBalance.findMany({
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



async function create(body) {
    let data;
    try {
        const {
            date,
            partCategory,
            partyId,
            amount,
            branchId,
            companyId,
            finYearId,
            userId, } = body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";


        await prisma.$transaction(async (tx) => {
            data = await tx.openingBalance.create({
                data: {
                    docId: newDocId,
                    date: date ? new Date(date) : null,
                    partCategory: partCategory || '',
                    partyId: partyId ? parseInt(partyId) : undefined,
                    amount: parseInt(amount),
                    branchId: branchId ? parseInt(branchId) : undefined,
                    companyId: companyId ? parseInt(companyId) : undefined,
                    finYearId: finYearId ? parseInt(finYearId) : undefined,
                    createdById: userId ? parseInt(userId) : undefined,
                }
            });
        });

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error creating Opening Balance:", error);
        return { statusCode: 1, error: error.message || "An error occurred while creating the Opening Balance" };
    }
}



async function update(id, body) {
    let data
    const {
        date,
        partCategory,
        partyId,
        amount,

        userId, } = await body
    const dataFound = await prisma.openingBalance.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("openingBalance");
    await prisma.$transaction(async (tx) => {
        data = await tx.openingBalance.update({
            where: {
                id: parseInt(id),
            },
            data: {

                date: date ? new Date(date) : null,
                partCategory: partCategory || '',
                partyId: partyId ? parseInt(partyId) : undefined,
                amount: parseInt(amount),

                updatedById: userId ? parseInt(userId) : undefined,

            },
        })
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.openingBalance.delete({
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