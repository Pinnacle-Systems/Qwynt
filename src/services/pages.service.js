import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';


async function get(req) {
    const { active } = req.query
    const data = await prisma.page.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
        },
        orderBy: {
            order: 'asc'
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const data = await prisma.page.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Page");
    return { statusCode: 0, data };
}

async function getPermissions(req) {
    const { roleId, pageId } = req.params
    const data = await prisma.roleOnPage.findUnique({
        where: {
            roleId_pageId: {
                roleId: parseInt(roleId),
                pageId: parseInt(pageId)
            }
        },
    })
    if (!data) return NoRecordFound("Page");
    return { statusCode: 0, data };
}


async function getSearch(req) {
    const { searchKey } = req.params
    const data = await prisma.page.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    link: {
                        contains: searchKey,
                    },
                },
            ],
        },
        orderBy: {
            order: 'asc'
        }
    })
    return { statusCode: 0, data: data };
}

async function create(body) {
    const { name, link, active, type, pageGroupId, order } = await body
    const data = await prisma.page.create(
        {
            data: {
                name, link, active, type, pageGroupId: parseInt(pageGroupId), order
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, link, active, type, pageGroupId, order } = await body
    const dataFound = await prisma.page.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Page");
    const data = await prisma.page.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, link, active, type, pageGroupId: parseInt(pageGroupId), order
        }
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.page.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getPermissions,
    getOne,
    getSearch,
    create,
    update,
    remove
}
