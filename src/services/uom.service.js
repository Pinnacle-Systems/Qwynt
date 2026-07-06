import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';



async function get(req) {
    const { companyId, active } = req.query
    let data;
    data = await prisma.uom.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
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
    const childRecord = await prisma.styleItem.count({ where: { uomId: parseInt(id) } });
    // const childRecord = 0;
    const data = await prisma.uom.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("uom");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };

}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.uom.findMany({
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
    const { name, companyId, active } = await body
    const data = await prisma.uom.create(
        {
            data: {
                name, companyId: parseInt(companyId), active
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, active } = await body
    const dataFound = await prisma.uom.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("uom");
    const data = await prisma.uom.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.uom.delete({
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
