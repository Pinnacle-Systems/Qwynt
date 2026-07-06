import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.size.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          sizeTemplateLists: true,
          poItems: true,
          inwardItems: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => {
      return {
        ...item,
        childRecord:
          item._count.sizeTemplateLists +
          item._count.poItems +
          item._count.inwardItems,
      };
    }),
  };
}

async function getOne(id) {
  const childRecordPo = await prisma.poItems.count({
    where: {
      sizeId: parseInt(id),
    },
  });
  const childRecordInward = await prisma.inwardItems.count({
    where: {
      sizeId: parseInt(id),
    },
  });
  const data = await prisma.size.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("size");
  return {
    statusCode: 0,
    data: { ...data, ...{ childRecord: childRecordPo + childRecordInward } },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.size.findMany({
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
  const { name, companyId, active } = await body;
  const data = await prisma.size.create({
    data: {
      name,
      companyId: parseInt(companyId),
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active } = await body;
  const dataFound = await prisma.size.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("size");
  const data = await prisma.size.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.size.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
