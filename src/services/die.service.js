import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.die.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,

      // active: active ? Boolean(active) : undefined,
    },
    include: {
      _count: {
        select: {
          JobCard: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((die) => ({
      ...die,
      childRecord: die._count.JobCard,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.die.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("die");
  const childRecord = 0;
  //   await prisma.dieGroupList.count({
  //     where: {
  //       dieId: parseInt(id),
  //     },
  //   });
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function create(body) {
  const { name, companyId, active = true } = await body;

  const data = await prisma.die.create({
    data: {
      name,
      active,
      companyId: parseInt(companyId),
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { name, active, companyId } = await body;
  const dataFound = await prisma.die.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("die");
  const data = await prisma.die.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      active,
      companyId: parseInt(companyId),
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.die.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
