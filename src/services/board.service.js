import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.board.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
    },
    include: {
      _count: {
        select: {
          JobCards: true,
          boardQualities: true,
        },
      },
    },
  });
  return {
    statusCode: 0,
    data: data.map((board) => ({
      ...board,
      childRecord: board._count.JobCards + board._count.boardQualities,
    })),
  };
}

async function getOne(id) {
  const data = await prisma.board.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("board");
  const childRecord = 0;
  return { statusCode: 0, data: { ...data, ...{ childRecord } } };
}

async function create(body) {
  const { name, companyId, active = true } = await body;

  const data = await prisma.board.create({
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
  const dataFound = await prisma.board.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("board");
  const data = await prisma.board.update({
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
  const data = await prisma.board.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
