import { prisma } from '../lib/prisma.js';
import { NoRecordFound } from '../configs/Responses.js';
import { getDateFromDateTime, getYearShortCodeForFinYear } from '../utils/helper.js';
import { getTableRecordWithId } from '../utils/helperQueries.js';
import { getFinYearStartTimeEndTime } from '../utils/finYearHelper.js';


async function getNextDocId(branchId, shortCode, startTime, endTime,) {
    let lastObject = await prisma.payment.findFirst({
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
    let newDocId = `${branchObj.branchCode}/${shortCode}/Pay/1`
    if (lastObject) {
        newDocId = `${branchObj.branchCode}/${shortCode}/Pay/${parseInt(lastObject.docId.split("/").at(-1)) + 1}`
    }
    return newDocId
}

function manualFilterSearchData(searchBillDate, searchMobileNo, searchType, searchDueDate, data) {
    return data.filter(item =>
        (searchBillDate ? String(getDateFromDateTime(item.cvv)).includes(searchBillDate) : true)
        && (searchDueDate ? String(getDateFromDateTime(item.cvv)).includes(searchDueDate) : true)

        && (searchMobileNo ? String(item.contactMobile).includes(searchMobileNo) : true)
        && (searchType ? String(item.paymentType).includes(searchType) : true)

    )
}

async function get(req) {
    const { active, branchId, pagination, pageNumber, dataPerPage, searchDocId, searchBillDate, searchDueDate, searchCustomerName, searchType, searchMobileNo, finYearId, serachDocNo, searchDate, supplier } = req.query
    console.log(searchBillDate, "searchBillDate")
    console.log(searchDueDate, "searchDueDate")

    let data = await prisma.payment.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            docId: Boolean(serachDocNo) ?
                {
                    contains: serachDocNo
                }
                : undefined,
            Party: {
                name: Boolean(supplier) ? {
                    contains: supplier
                } : undefined
            },
            isDeleted: false,
        },
        include: {
            Party: {
                select: {
                    name: true
                }
            }
        }
    });
    data = manualFilterSearchData(searchDate, searchMobileNo, searchType, searchDueDate, data)
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
    const data = await prisma.payment.findUnique({
        where: {
            id: parseInt(id)
        },
    })
    if (!data) return NoRecordFound("purchaseBill");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.payment.findMany({
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
        const { branchId, id, paymentMode, cvv, paymentType, paidAmount, discount, paymentRefNo, supplierId, userId, finYearId, totalBillAmount, totalAmount } = body;

        let finYearDate = await getFinYearStartTimeEndTime(finYearId);
        const shortCode = finYearDate ? getYearShortCodeForFinYear(finYearDate?.startDateStartTime, finYearDate?.endDateEndTime) : "";
        let newDocId = finYearDate ? (await getNextDocId(branchId, shortCode, finYearDate?.startDateStartTime, finYearDate?.endDateEndTime)) : "";

        const dateOnly = new Date(cvv);
        dateOnly.setHours(0, 0, 0, 0);

        console.log(dateOnly, "dateOnly")

        await prisma.$transaction(async (tx) => {
            data = await tx.payment.create({
                data: {
                    docId: newDocId,
                    partyId: parseInt(supplierId),
                    branchId: parseInt(branchId),
                    paymentMode,
                    paidAmount: parseFloat(paidAmount),
                    discount: parseFloat(discount),
                    paymentRefNo: paymentRefNo,
                    createdById: parseInt(userId),
                    cvv: cvv ? new Date(cvv) : null,
                    paymentType,
                    totalBillAmount: totalBillAmount ? parseInt(totalBillAmount) : undefined,
                    totalAmount: totalAmount ? parseInt(totalAmount) : undefined
                }
            });
        });

        return { statusCode: 0, data };
    } catch (error) {
        console.error("Error creating payment:", error);
        return { statusCode: 1, error: error.message || "An error occurred while creating the payment" };
    }
}



async function update(id, body) {
    let data
    const {
        branchId, paymentMode, cvv, paymentType, paidAmount, discount, supplierId, userId, paymentRefNo, partyId, finYearId, totalAmount } = await body


    const dateOnly = new Date(cvv);
    dateOnly.setHours(0, 0, 0, 0);

    console.log(dateOnly, "dateOnly")
    const dataFound = await prisma.payment.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("payment");
    await prisma.$transaction(async (tx) => {
        data = await tx.payment.update({
            where: {
                id: parseInt(id),
            },
            data: {
                partyId: parseInt(supplierId),
                branchId: parseInt(branchId),
                paymentMode,
                paidAmount: parseFloat(paidAmount),
                discount: parseFloat(discount),
                createdById: parseInt(userId),
                cvv: cvv ? new Date(cvv) : null,
                paymentType,
                totalAmount: totalAmount ? parseInt(totalAmount) : undefined

            },
        })
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.payment.delete({
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
