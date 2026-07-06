import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.currency.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          proformaInvoices: true,
        },
      },
    },
  });

  data.forEach((item) => {
    item.childRecord = item._count.proformaInvoices;
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const childRecord = await prisma.proformaInvoice.count({
    where: { currencyId: parseInt(id) },
  });
  const data = await prisma.currency.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("currency");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.currency.findMany({
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
    },
  });
  return { statusCode: 0, data: data };
}

async function create(body) {
  const { name, code, symbol, companyId, active, exchangeRate } = await body;
  const data = await prisma.currency.create({
    data: {
      name,
      code,
      symbol,
      exchangeRate: parseFloat(exchangeRate),
      companyId: parseInt(companyId),
      active,
    },
  });
  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, code, active, symbol, exchangeRate } = await body;
  const dataFound = await prisma.currency.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("currency");
  const data = await prisma.currency.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      code,
      active,
      symbol,
      exchangeRate: parseFloat(exchangeRate),
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.currency.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
