import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from '../configs/Responses.js';

async function get(req) {
    console.log("hit")
    const { companyId, active } = req.query
    let data;
    data = await prisma.branchType.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    Party: true
                }
            }
        }

    });
    return {
        statusCode: 0, data: data = data.map(color => ({
            ...color,
            childRecord: color?._count.Party > 0
        })),
    };
}

async function getOne(id) {
    const childRecord = await prisma.party.count({ where: { branchTypeId: parseInt(id) } });

    const data = await prisma.branchType.findUnique({
        where: {
            id: parseInt(id)
        },

    })
    if (!data) return NoRecordFound("Branch");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.branchType.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    branchName: {
                        contains: searchKey,
                    },
                },
                {
                    branchCode: {
                        contains: searchKey,
                    },
                }
            ],
        },
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, contactEmail, contactName, contactMobile, companyId, active } = await body
    const data = await prisma.branchType.create({
        data: {
            name, active,

        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, contactEmail, contactName, contactMobile, active, prefixCategory, idPrefix, idSequence, tempPrefix, tempSequence, address } = await body

    const dataFound = await prisma.branchType.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("branchType");
    const data = await prisma.branchType.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, active
        },
    })
    return { statusCode: 0, data };
};

async function updateMany(req) {
    const branchDetails = await req.body;
    for (let branch of branchDetails) {
        if (!branch.prefixCategory) continue
        const dataFound = await prisma.branchType.findUnique({
            where: {
                id: parseInt(branch.id)
            }
        })
        if (!dataFound) return NoRecordFound("Branch", branch.branchName);
        const data = await prisma.branchType.update({
            where: {
                id: parseInt(branch.id),
            },
            data: {
                branchName: branch.branchName,
                idPrefix: branch.idPrefix, idSequence: branch.idSequence, tempPrefix: branch.tempPrefix,
                tempSequence: branch.tempSequence,
                prefixCategory: branch.prefixCategory
            },
        })
    }
    return { statusCode: 0, message: "Updated Successfully" };
}


async function remove(id) {
    const data = await prisma.branchType.delete({
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
    updateMany,
    remove
}
