import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.payTerm.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          pos: true,
          proformaInvoices: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((item) => {
      return {
        ...item,
        childRecord: item._count.pos + item._count.proformaInvoices,
      };
    }),
  };
}

async function getOne(id) {
  const childRecord = await prisma.po.count({
    where: { payTermId: parseInt(id) },
  });
  const data = await prisma.payTerm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("payTerm");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.payTerm.findMany({
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
  const { name, days, months, years, companyId, active, aliasName } =
    await body;
  const data = await prisma.payTerm.create({
    data: {
      name,
      days: days ? parseInt(days) : undefined,
      companyId: parseInt(companyId),
      months: months ? parseInt(months) : undefined,
      years: years ? parseInt(years) : undefined,
      active,
      aliasName,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, days, companyId, months, years, active, aliasName } =
    await body;
  const dataFound = await prisma.payTerm.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("payTerm");
  const data = await prisma.payTerm.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      days: days ? parseInt(days) : undefined,
      companyId: companyId ? parseInt(companyId) : undefined,
      active,
      aliasName: aliasName ? aliasName : undefined,
      months: months ? parseInt(months) : undefined,
      years: years ? parseInt(years) : undefined,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.payTerm.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
