import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';



async function get(req) {
    const { branchId, active} = req.query
    let data;
     data = await prisma.employeeCategory.findMany({
        where: {
            active: active ? Boolean(active) : undefined,
            branchId: branchId ? parseInt(branchId) : undefined,
        },
        include : {
            _count : {
                select : {
                 Employee : true   
                }
            }
        }
    });
    return { statusCode: 0,  data: data = data.map(order => ({
            ...order,
            childRecord: order?._count.Employee > 0
        })), };
}


async function getOne(id) {
    const childRecord = await prisma.employee.count({ where: { employeeCategoryId: parseInt(id) } });
    const data = await prisma.employeeCategory.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!data) return NoRecordFound("Employee Category");
    return { statusCode: 0, data: {...data, ...{childRecord}} };
}

async function getSearch(req) {
    const { branchId, active } = req.query
    const { searchKey } = req.params
    const data = await prisma.employeeCategory.findMany({
        where: {
            branchId: branchId ? parseInt(branchId) : undefined,
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
    const { name, code, branchId } = await body
    const data = await prisma.employeeCategory.create({
        data: {
            name, code,
            branchId: branchId ? parseInt(branchId) : undefined,
        },
    });
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, active } = await body
    const dataFound = await prisma.employeeCategory.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Employee Category");
    const data = await prisma.employeeCategory.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name, code,
            active
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.employeeCategory.delete({
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
