import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId } = req.query;

  const data = await prisma.bank.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
    },
    include: {
      Company: true,
      Branch: {
        select: {
          name: true,
        },
      },
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
    where: { bankId: parseInt(id) },
  });

  const data = await prisma.bank.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      Company: true,
      Branch: true,
    },
  });

  if (!data) return NoRecordFound("bank");

  return {
    statusCode: 0,
    data: { ...data, ...{ childRecord } },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId } = req.query;

  const data = await prisma.bank.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      OR: [
        {
          name: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          accNo: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          ifsc: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
        {
          swiftCode: {
            contains: searchKey,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      Company: true,
      Branch: true,
    },
  });

  return { statusCode: 0, data };
}

async function create(body) {
  const { name, accNo, ifsc, swiftCode, companyId, branchId, active } =
    await body;

  const data = await prisma.bank.create({
    data: {
      name,
      accNo,
      ifsc,
      swiftCode,
      active,
      companyId: companyId ? parseInt(companyId) : null,
      branchId: branchId ? parseInt(branchId) : null,
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, accNo, ifsc, swiftCode, companyId, branchId, active } =
    await body;

  const dataFound = await prisma.bank.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!dataFound) return NoRecordFound("bank");

  const data = await prisma.bank.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      accNo,
      ifsc,
      swiftCode,
      active,
      companyId: companyId ? parseInt(companyId) : null,
      branchId: branchId ? parseInt(branchId) : null,
    },
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.bank.delete({
    where: {
      id: parseInt(id),
    },
  });

  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
