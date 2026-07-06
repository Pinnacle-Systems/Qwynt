import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';


async function get(req) {
    const { companyId, active } = req.query
    let data;
    data = await prisma.hsn.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    styleItems: true
                }
            }
        }
    });
    return {
        statusCode: 0, data: data = data.map(color => ({
            ...color,
            childRecord: color?._count.styleItems > 0
        })),
    };
}


async function getOne(id) {
    const childRecord = await prisma.styleItem.count({ where: { hsnId: parseInt(id) } });
    const data = await prisma.hsn.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("hsn");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.hsn.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, code, companyId, active, tax } = await body
    const data = await prisma.hsn.create(
        {
            data: {
                name, code, active, tax
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active, tax } = await body
    const dataFound = await prisma.hsn.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("hsn");
    const data = await prisma.hsn.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, tax
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.hsn.delete({
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
