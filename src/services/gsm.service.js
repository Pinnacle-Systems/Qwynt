import { NoRecordFound } from "../configs/Responses.js";

import { prisma } from "../lib/prisma.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.gsm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          styleItems: true,
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
          item._count.styleItems +
          item._count.poItems +
          item._count.inwardItems,
      };
    }),
  };
}

async function getOne(id) {
  const childRecord = 0;
  const data = await prisma.gsm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("gsm");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.gsm.findMany({
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
  const data = await prisma.gsm.create({
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
  const dataFound = await prisma.gsm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("gsm");
  const data = await prisma.gsm.update({
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
  const data = await prisma.gsm.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
