import { prisma } from "../lib/prisma.js";
import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { companyId, active } = req.query;
  const data = await prisma.processGroup.findMany({
    where: {
      companyId: companyId ? parseInt(companyId) : undefined,
      //   active: active ? Boolean(active) : undefined,
    },
    include: {
      processGroupList: true,
    },
  });
  return { statusCode: 0, data };
}

async function getOne(id) {
  const data = await prisma.processGroup.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      processGroupList: true,
    },
  });
  if (!data) return NoRecordFound("processGroup");
  const processIds = data.processGroupList
    .map((item) => item.processId)
    .filter(Boolean);

  return { statusCode: 0, data: { ...data } };
}

async function create(body) {
  const { name, companyId, active = true, processGroupList } = body;
  const result = await prisma.$transaction(async (tx) => {
    const processGroup = await tx.processGroup.create({
      data: {
        name,
        active,
        companyId: parseInt(companyId),
      },
    });
    if (processGroupList?.length) {
      await tx.processGroupList.createMany({
        data: processGroupList.map((processId) => ({
          processGroupId: processGroup.id,
          processId: parseInt(processId),
        })),
      });
    }
    return processGroup;
  });
  return { statusCode: 0, data: result };
}

function findRemovedItems(dataFound, processGroupLists) {
  let removedItems = dataFound.processGroupLists.filter((oldItem) => {
    let result = processGroupLists.find(
      (newItem) => parseInt(newItem.id) === parseInt(oldItem.id),
    );
    if (result) return false;
    return true;
  });
  return removedItems;
}

async function update(id, body) {
  const { name, active, companyId, processGroupList } = body;

  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Check if SizeTemplate exists
    const dataFound = await tx.processGroup.findUnique({
      where: { id: parseInt(id) },
      include: { processGroupList: true },
    });
    if (!dataFound) return NoRecordFound("processGroup");

    // Step 2: Update SizeTemplate
    const updatedTemplate = await tx.processGroup.update({
      where: { id: parseInt(id) },
      data: {
        name,
        active,
        companyId: companyId ? parseInt(companyId) : null,
      },
    });

    // Step 3: Replace SizeTemplateList
    if (Array.isArray(processGroupList)) {
      // Delete all existing rows for this template
      await tx.processGroupList.deleteMany({
        where: { processGroupId: updatedTemplate.id },
      });

      // Insert new rows
      for (const processId of processGroupList) {
        await tx.processGroupList.create({
          data: {
            processGroup: { connect: { id: updatedTemplate.id } },
            Process: { connect: { id: parseInt(processId) } },
          },
        });
      }
    }

    return updatedTemplate;
  });

  return { statusCode: 0, data: result };
}

async function remove(id) {
  const data = await prisma.processGroup.delete({
    where: {
      id: parseInt(id),
    },
  });
  return { statusCode: 0, data };
}

export { get, getOne, create, update, remove };
