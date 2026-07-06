import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";


async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.termsAndConditions.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include:{
      _count:{
        select:{
          pos:true
        }
      }
    }
  });
  return { statusCode: 0, data : 
    data.map((item) => {
      return {
        ...item,
        childRecord : item._count.pos
      }
    })
   };
}

async function getOne(id) {
  const childRecord = await prisma.po.count({
    where: {
      termsId: parseInt(id),
    },
  });
  const data = await prisma.termsAndConditions.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("termsAndConditions");
  return { statusCode: 0, data: { ...data, ...{ childRecord : childRecord} } };
}

async function getSearch(req) {
  const { companyId, active } = req.query;
  const { searchKey } = req.params;
  const data = await prisma.termsAndConditions.findMany({
    where: {
      country: {
        companyId: companyId ? parseInt(companyId) : undefined,
      },
      active: active ? Boolean(active) : undefined,
      OR: [
        {
          aliasName: {
            contains: searchKey,
          },
        },
      ],
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { description, companyId, active, name } = await body;
  const data = await prisma.termsAndConditions.create({
    data: {
      description,
      active,
      companyId: parseInt(companyId),
      name,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { description, companyId, active, name } = await body;
  const dataFound = await prisma.termsAndConditions.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("termsAndConditions");
  const data = await prisma.termsAndConditions.update({
    where: {
      id: parseInt(id),
    },
    data: {
      description,
      companyId: parseInt(companyId),
      active,
      name,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.termsAndConditions.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
