import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active, isGrey } = req.query;
  let data;
  data = await prisma.color.findMany({
    where: {
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          poItems: true,
          inwardItems: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: (data = data.map((color) => ({
      ...color,
      childRecord: color?._count.poItems + color?._count.inwardItems,
    }))),
  };
}

async function getOne(id) {
  const childRecordPo = await prisma.poItems.count({
    where: { colorId: parseInt(id) },
  });
  const childRecordInward = await prisma.inwardItems.count({
    where: { colorId: parseInt(id) },
  });
  const data = await prisma.color.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("color");
  return {
    statusCode: 0,
    data: { ...data, ...{ childRecord: childRecordPo + childRecordInward } },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.color.findMany({
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
  const { name, active, pantone, isGrey, companyId } = await body;
  const data = await prisma.color.create({
    data: {
      name,
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active } = await body;
  const dataFound = await prisma.color.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("color");
  const data = await prisma.color.update({
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
  const data = await prisma.color.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
