import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  // const { companyId } = req.query;
  const data = await prisma.printingDesign.findMany({
    // where: {
    //   companyId: companyId ? parseInt(companyId) : undefined,
    //   active: active ? Boolean(active) : undefined,
    // },
    include: {
      _count: {
        select: {
          ItemVariantMasterDetails: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((printDesign) => ({
      ...printDesign,
      childRecord: printDesign?._count.ItemVariantMasterDetails,
    })),
  };
}

async function getOne(id) {
  const childRecord = await prisma.itemVariantMasterDetails.count({
    where: { printingDesignId: parseInt(id) },
  });
  const data = await prisma.printingDesign.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Printing Design");
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.printingDesign.findMany({
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
  const { name, active, companyId, userId, branchId, finYearId } = await body;
  const data = await prisma.printingDesign.create({
    data: {
      name,

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
  const { name, active, userId } = await body;
  const dataFound = await prisma.printingDesign.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Printing Design");
  const data = await prisma.printingDesign.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,

      active,

      updatedById: userId ? parseInt(userId) : undefined,
      updatedAt: new Date() ?? null,
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.printingDesign.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
