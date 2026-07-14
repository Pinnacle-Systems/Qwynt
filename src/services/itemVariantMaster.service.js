import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  // const { companyId } = req.query;
  const data = await prisma.itemVariantMaster.findMany({
    // where: {
    //   companyId: companyId ? parseInt(companyId) : undefined,
    //   active: active ? Boolean(active) : undefined,
    // },
    include: {
      // _count: {
      //   select: {
      //     StyleMaster: true,
      //   },
      // },
      styleMaster: {
        include: {
          modelName: {
            select: {
              name: true,
              id: true,
              gender: true,
            },
          },
        },
      },
      ItemVariantMasterDetails: {
        include: {
          printingDesign: true,
          size: true,
          color: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((modelName) => ({
      ...modelName,
      //   childRecord: modelName?._count.StyleMaster,
    })),
  };
}

async function getOne(id) {
  //   const childRecord = await prisma.styleMaster.count({
  //     where: { modelId: parseInt(id) },
  //   });
  const data = await prisma.itemVariantMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      styleMaster: {
        include: {
          modelName: {
            select: {
              name: true,
              id: true,
              gender: true,
            },
          },
        },
      },
      ItemVariantMasterDetails: {
        include: {
          printingDesign: true,
          size: true,
          color: true,
        },
      },
    },
  });
  if (!data) return NoRecordFound("Model Name");
  //   return { statusCode: 0, data: { ...data, ...{ childRecord } } };
  return { statusCode: 0, data: data };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.itemVariantMaster.findMany({
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
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const {
    styleId,
    itemDetails,
    active,
    companyId,
    userId,
    branchId,
    finYearId,
  } = await body;

  let data;

  await prisma.$transaction(async (tx) => {
    data = await tx.itemVariantMaster.create({
      data: {
        styleId: parseInt(styleId),
        companyId: parseInt(companyId),
        branchId: parseInt(branchId),
        finYearId: parseInt(finYearId),
        createdById: userId ? parseInt(userId) : undefined,
        active,
        ItemVariantMasterDetails: {
          createMany: {
            data: itemDetails?.map((item) => ({
              printingDesignId: item.printingDesignId
                ? parseInt(item.printingDesignId)
                : undefined,
              sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
              colorId: item.colorId ? parseInt(item.colorId) : undefined,
              price: item.price ? parseInt(item.price) : 0,
            })),
          },
        },
      },
    });
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { styleId, itemDetails, active, userId } = await body;
  console.log(itemDetails, "itemDetails");
  let data;
  const dataFound = await prisma.itemVariantMaster.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      ItemVariantMasterDetails: true,
    },
  });
  if (!dataFound) return NoRecordFound("Model Name");

  const incomingItemIds = itemDetails
    ?.filter((i) => i.id)
    .map((i) => parseInt(i.id));
  const removedItemIds = dataFound.ItemVariantMasterDetails.filter(
    (item) => !incomingItemIds.includes(item.id),
  ).map((item) => item.id);

  await prisma.$transaction(async (tx) => {
    data = await tx.itemVariantMaster.update({
      where: {
        id: parseInt(id),
      },
      data: {
        styleId: parseInt(styleId),

        updatedById: userId ? parseInt(userId) : undefined,
        active,
        updatedAt: new Date() ?? null,
        ItemVariantMasterDetails: {
          deleteMany: incomingItemIds.length
            ? { id: { notIn: incomingItemIds } }
            : {},
          updateMany: itemDetails.filter((item) => item.id)
            ? itemDetails
                .filter((item) => item.id)
                .map((item) => ({
                  where: {
                    id: parseInt(item.id),
                  },
                  data: {
                    printingDesignId: item.printingDesignId
                      ? parseInt(item.printingDesignId)
                      : undefined,
                    sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                    colorId: item.colorId ? parseInt(item.colorId) : undefined,
                    price: item.price ? parseInt(item.price) : 0,
                  },
                }))
            : {},
          createMany: {
            data: itemDetails
              .filter((item) => !item.id)
              .map((item) => ({
                printingDesignId: item.printingDesignId
                  ? parseInt(item.printingDesignId)
                  : undefined,
                sizeId: item.sizeId ? parseInt(item.sizeId) : undefined,
                colorId: item.colorId ? parseInt(item.colorId) : undefined,
                price: item.price ? parseInt(item.price) : 0,
              })),
          },
        },
      },
    });
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.itemVariantMaster.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
