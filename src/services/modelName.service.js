import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { duplicate } = req.query;
  console.log(duplicate, "duplicate");

  let whereClause = {};
  if (duplicate === "false" || duplicate === false) {
    whereClause = {
      StyleMaster: {
        none: {},
      },
    };
  }

  const data = await prisma.modelName.findMany({
    // where: whereClause,
    include: {
      _count: {
        select: {
          StyleMaster: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((modelName) => ({
      ...modelName,
      childRecord: modelName?._count.StyleMaster,
    })),
  };
}

async function getOne(id) {
  const childRecord = await prisma.styleMaster.count({
    where: { modelId: parseInt(id) },
  });
  const data = await prisma.modelName.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Model Name");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.modelName.findMany({
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
  const { name, gender, active, companyId, userId, branchId, finYearId } =
    await body;
  const data = await prisma.modelName.create({
    data: {
      name,
      gender: gender ? gender : "",
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
  const { name, gender, active, userId } = await body;
  const dataFound = await prisma.modelName.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Model Name");
  const data = await prisma.modelName.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      gender: gender ? gender : "",
      active,
      updatedById: userId ? parseInt(userId) : undefined,
      updatedAt: new Date() ?? null,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.modelName.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
