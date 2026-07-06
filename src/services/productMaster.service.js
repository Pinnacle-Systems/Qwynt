import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';



async function get(req) {
    const { companyId, active, productBrandId, productCategoryId } = req.query

    const data = await prisma.product.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            productCategoryId: productCategoryId ? parseInt(productCategoryId) : undefined,
            productBrandId: productBrandId ? parseInt(productBrandId) : undefined
        },
        include: {
            ProductUomPriceDetails: {
                include: {
                    Uom: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    return { statusCode: 0, data };
}


async function getOne(id) {
    const childRecord = await prisma.poBillItems.count({ where: { productBrandId: parseInt(id) } });
    const data = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            ProductUomPriceDetails: {
                include: {
                    Uom: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })
    console.log(data, 'pdata');
    if (!data) return NoRecordFound("Product");
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}



async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.product.findMany({
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
    const { name, code, productBrandId, productCategoryId, companyId, active, ProductUomPriceDetails } = await body
    const uomData = ProductUomPriceDetails.map(item => {
        return {
            uomId: parseInt(item.uomId),
            price: parseFloat(item.price),
        }
    })
    const data = await prisma.product.create(
        {
            data: {
                name, companyId: parseInt(companyId), active, ProductUomPriceDetails: { createMany: { data: uomData } }
            }
        }
    )
    return { statusCode: 0, data };
}

async function update(id, body) {
    const { name, code, productBrandId, productCategoryId, active, ProductUomPriceDetails } = await body
    const uomData = ProductUomPriceDetails.map(item => {
        return {
            uomId: parseInt(item.uomId),
            price: parseFloat(item.price),
        }
    })
    const dataFound = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("Product");
    const data = await prisma.product.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, active, productBrandId: parseInt(productBrandId), productCategoryId: parseInt(productCategoryId), ProductUomPriceDetails: {
                deleteMany: {},
                createMany: { data: uomData }
            }
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.product.delete({
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
