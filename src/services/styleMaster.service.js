import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  // const { companyId } = req.query;
  const data = await prisma.styleMaster.findMany({
    // where: {
    //   companyId: companyId ? parseInt(companyId) : undefined,
    //   active: active ? Boolean(active) : undefined,
    // },
    include: {
      modelName: {
        select: {
          name: true,
          id: true,
          gender: true,
        },
      },

      _count: {
        select: {
          ItemVariantMaster: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((styleMaster) => ({
      ...styleMaster,
      childRecord: styleMaster?._count.ItemVariantMaster,
    })),
  };
}

async function getOne(id) {
  const childRecord = await prisma.itemVariantMaster.count({
    where: { styleId: parseInt(id) },
  });
  const data = await prisma.styleMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Style Master");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.styleMaster.findMany({
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
    modelId,
    name,
    basePrice,
    active,
    companyId,
    userId,
    branchId,
    finYearId,
  } = await body;
  const data = await prisma.styleMaster.create({
    data: {
      modelId: modelId ? parseInt(modelId) : undefined,
      name,
      basePrice: basePrice ? parseInt(basePrice) : 0,
      active,
      companyId: parseInt(companyId),
      branchId: parseInt(branchId),
      finYearId: parseInt(finYearId),
      createdById: userId ? parseInt(userId) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { modelId, name, basePrice, active, userId } = await body;
  const dataFound = await prisma.styleMaster.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Style Master");
  const data = await prisma.styleMaster.update({
    where: {
      id: parseInt(id),
    },
    data: {
      modelId: modelId ? parseInt(modelId) : undefined,
      name,
      basePrice: basePrice ? parseInt(basePrice) : 0,
      active,
      updatedById: userId ? parseInt(userId) : undefined,
      updatedAt: new Date() ?? null,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.styleMaster.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
