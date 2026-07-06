import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';




async function get(req) {
    const { companyId, active } = req.query
    let data;
    data = await prisma.style.findMany({
        where: {


            active: active ? Boolean(active) : undefined,
        },
        include: {
            _count: {
                select: {
                    DeliveryChallanItems: true
                }
            }
        }

    });
    return {
        statusCode: 0, data: data = data.map(color => ({
            ...color,
            childRecord: color?._count.DeliveryChallanItems > 0
        })),
    };
}


async function getOne(id) {
    const childRecord = await prisma.deliveryChallanItems.count({ where: { styleId: parseInt(id) } });
    const data = await prisma.style.findUnique({
        where: {
            id: parseInt(id)
        },
        // include: {
        //     StylePanel: {
        //         select: {
        //             panelId: true,
        //             StylePanelProcess: {
        //                 select: {
        //                     processId: true
        //                 }
        //             }
        //         }
        //     }
        // }
    });

    if (!data) return NoRecordFound("style");

    // const modifiedData = {
    //     ...data,
    //     StylePanel: data.StylePanel.map(panel => ({
    //         panelId: panel.panelId,
    //         selectedAddons: panel.StylePanelProcess.map(process => process.processId)
    //     }))
    // };
    return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}


async function getSearch(req) {
    const searchKey = req.params.searchKey
    const { branchId, active } = req.query
    const data = await prisma.style.findMany({
        where: {

            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },

            ],
        },

    })
    // return { statusCode: 0, data: data.map((item) => exclude({ ...item }, ["image"])) };
    return { statusCode: 0, data: data };

}

export async function upload(req) {
    const { id } = req.params
    const { isDelete } = req.body
    const data = await prisma.style.update({
        where: {
            id: parseInt(id)
        },
        data: {
            logo: (isDelete && JSON.parse(isDelete)) ? "" : req.file.filename,
        }
    }
    )
    return { statusCode: 0, data };
}


async function create(req) {
    String
    const { name, fabricId, colorId, aliasName, active, styleCode, code, sku } = await req;
    const data = await prisma.style.create({
        data: {
            name, aliasName: sku, active, code

        }
    });



    return { statusCode: 0, data };
}
async function updateStylePanel(tx, sampleDetails, sampleData) {


    const parsedSampleDetails = typeof sampleDetails === "string"
        ? JSON.parse(sampleDetails)
        : sampleDetails;

    const removedItems = sampleData.StylePanel.filter(oldItem => {
        return !parsedSampleDetails.some(newItem => newItem.panelId === oldItem.panelId);
    });

    const removedItemsId = removedItems.map(item => item.id);
    await tx.StylePanel.deleteMany({
        where: {
            id: { in: removedItemsId }
        }
    });
    const promises = parsedSampleDetails.map(async (panelDetail) => {
        const stylePanel = await tx.StylePanel.upsert({
            where: { panelId_styleId: { panelId: panelDetail.panelId, styleId: sampleData.id } },
            update: {},
            create: {
                panelId: panelDetail.panelId,
                styleId: sampleData.id,
            }
        });

        await tx.StylePanelProcess.deleteMany({
            where: { stylePanelId: stylePanel.id }
        });

        const processPromises = panelDetail.selectedAddons.map(async (addonId) => {
            return await tx.StylePanelProcess.create({
                data: {
                    stylePanelId: stylePanel.id,
                    processId: addonId
                }
            });
        });

        return Promise.all(processPromises);
    });

    return Promise.all(promises);
}

async function update(id, body) {


    const { name, fabricId, colorId, aliasName, active, styleCode, code, sku } = await body;

    const dataFound = await prisma.style.findUnique({
        where: { id: parseInt(id) },
    });

    if (!dataFound) return NoRecordFound("style");


    const data = await prisma.style.update({
        where: { id: parseInt(id) },
        data: {
            name,
            aliasName: sku,
            active: active !== undefined ? JSON.parse(active) : undefined, code
        },

    });

    // await updateStylePanel(tx, panelId, updatedStyle);

    // return updatedStyle;


    return { statusCode: 0, data };
}


async function remove(id) {
    const data = await prisma.style.delete({
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
