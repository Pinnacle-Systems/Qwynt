import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";
import { getFinYearStartTimeEndTime } from "../utils/finYearHelper.js";
import { getYearShortCodeForFinYear } from "../utils/helper.js";

async function get(req) {
  const { branchId, companyId, finYearId } = req.query;
  const data = await prisma.box.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      branchId: branchId ? parseInt(branchId) : undefined,
      finYearId: finYearId ? parseInt(finYearId) : undefined,
    },
    orderBy: {
      id: "desc",
    },
  });
  return {
    statusCode: 0,
    data: data,
  };
}

async function getOne(id) {
  const data = await prisma.box.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!data) return NoRecordFound("Box");
  return { statusCode: 0, data: { ...data } };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.box.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      active: active ? Boolean(active) : undefined,
      OR: [
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
  const { active, companyId, userId, branchId, finYearId, boxNo } = await body;

  const count = parseInt(boxNo) || 1;

  const finYearDate = await getFinYearStartTimeEndTime(parseInt(finYearId));
  const shortCode = finYearDate
    ? getYearShortCodeForFinYear(
        finYearDate.startDateStartTime,
        finYearDate.endDateEndTime,
      )
    : "";

  let lastBox = await prisma.box.findFirst({
    where: {
      finYearId: parseInt(finYearId),
      companyId: parseInt(companyId),
      branchId: parseInt(branchId),
    },
    orderBy: { id: "desc" },
  });

  let lastNo = 0;
  if (lastBox && lastBox.code) {
    const parts = lastBox.code.split("/");
    const lastPart = parts[parts.length - 1];
    if (!isNaN(lastPart)) {
      lastNo = parseInt(lastPart);
    }
  }

  const boxesData = [];
  for (let i = 1; i <= count; i++) {
    const sequenceNo = (lastNo + i).toString().padStart(12, "0");
    const code = `BOX/${shortCode}/${sequenceNo}`;
    boxesData.push({
      code,
      active: active !== undefined ? Boolean(active) : true,
      companyId: parseInt(companyId),
      branchId: parseInt(branchId),
      finYearId: parseInt(finYearId),
      createdById: userId ? parseInt(userId) : undefined,
    });
  }

  const data = await prisma.box.createMany({
    data: boxesData,
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const { active, userId } = await body;
  const dataFound = await prisma.box.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  if (!dataFound) return NoRecordFound("Box");
  const data = await prisma.box.update({
    where: {
      id: parseInt(id),
    },
    data: {
      active: active !== undefined ? Boolean(active) : true,
      updatedById: userId ? parseInt(userId) : undefined,
      updatedAt: new Date(),
    },
  });
  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.box.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, getSearch, create, update, remove };
