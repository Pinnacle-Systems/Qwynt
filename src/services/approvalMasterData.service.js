import { prisma } from "../lib/prisma.js";

async function getFields(req) {
  const { moduleId } = req.query;
  const whereClause = { active: true };
  if (moduleId) {
    whereClause.moduleId = Number(moduleId);
  }
  const data = await prisma.approvalRuleField.findMany({
    where: whereClause,
    include: { Operators: true, Module: true },
  });
  return { statusCode: 0, data };
}

async function getOperators(req) {
  const data = await prisma.approvalRuleOperator.findMany({
    where: { active: true },
  });
  return { statusCode: 0, data };
}

async function addField(req) {
  const {
    id, // stripped out (used for update, not create)
    operatorIds,
    parentRelation,
    fieldPath,
    aggregation, // ✅ NEW — for array relations (SUM, COUNT, etc.)
    moduleId,
    ...rest
  } = req.body;

  // ✅ Validate aggregation value (prevents garbage data)
  const validAggregations = ["SUM", "COUNT", "MAX", "MIN", "AVG"];
  const cleanAggregation =
    aggregation && validAggregations.includes(aggregation) ? aggregation : null;

  const data = await prisma.approvalRuleField.create({
    data: {
      ...rest,
      moduleId: Number(moduleId),
      parentRelation: parentRelation?.trim() || null, // ✅ trim whitespace
      fieldPath: fieldPath?.trim() || null,
      aggregation: cleanAggregation, // ✅ validated
      Operators: operatorIds?.length
        ? { connect: operatorIds.map((opId) => ({ id: Number(opId) })) }
        : undefined,
    },
  });

  return { statusCode: 0, data };
}

async function updateField(req) {
  const { id } = req.params;
  const {
    operatorIds,
    parentRelation,
    fieldPath,
    aggregation,
    moduleId,
    ...rest
  } = req.body;
  console.log("Incoming parentRelation:", parentRelation);
  const validAggregations = ["SUM", "COUNT", "MAX", "MIN", "AVG"];
  const cleanAggregation =
    aggregation && validAggregations.includes(aggregation) ? aggregation : null;

  const data = await prisma.approvalRuleField.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      moduleId: moduleId ? Number(moduleId) : undefined,
      parentRelation: parentRelation?.trim() || null,
      fieldPath: fieldPath?.trim() || null,
      aggregation: cleanAggregation,
      Operators: operatorIds
        ? { set: operatorIds.map((opId) => ({ id: Number(opId) })) } // ✅ `set` not `connect` on update
        : undefined,
    },
  });

  return { statusCode: 0, data };
}

async function deleteField(req) {
  await prisma.approvalRuleField.delete({
    where: { id: Number(req.params.id) },
  });
  return { statusCode: 0, message: "Deleted successfully" };
}

async function addOperator(req) {
  const { id, ...rest } = req.body;
  const data = await prisma.approvalRuleOperator.create({ data: rest });
  return { statusCode: 0, data };
}

async function updateOperator(req) {
  const data = await prisma.approvalRuleOperator.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  return { statusCode: 0, data };
}

async function deleteOperator(req) {
  await prisma.approvalRuleOperator.delete({
    where: { id: Number(req.params.id) },
  });
  return { statusCode: 0, message: "Deleted successfully" };
}

// Module Services
async function getModules(req) {
  const data = await prisma.approvalRuleModule.findMany({
    where: { active: true },
  });
  return { statusCode: 0, data };
}

async function addModule(req) {
  const data = await prisma.approvalRuleModule.create({ data: req.body });
  return { statusCode: 0, data };
}

async function updateModule(req) {
  const data = await prisma.approvalRuleModule.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  return { statusCode: 0, data };
}

async function deleteModule(req) {
  await prisma.approvalRuleModule.delete({
    where: { id: Number(req.params.id) },
  });
  return { statusCode: 0, message: "Deleted successfully" };
}

async function seedDefaults(req) {
  // Insert common operators
  const operators = [
    { operator: "=", label: "Equals to" },
    { operator: "!=", label: "Not Equals to" },
    { operator: ">", label: "Greater than" },
    { operator: "<", label: "Less than" },
    { operator: ">=", label: "Greater than or equals" },
    { operator: "<=", label: "Less than or equals" },
    { operator: "IN", label: "In List" },
  ];

  for (const op of operators) {
    await prisma.approvalRuleOperator
      .upsert({
        where: { operator: op.operator }, // needs @@unique on operator field in schema
        create: op,
        update: {},
      })
      .catch(async () => {
        const exists = await prisma.approvalRuleOperator.findFirst({
          where: { operator: op.operator },
        });
        if (!exists) {
          await prisma.approvalRuleOperator.create({ data: op });
        }
      });
  }

  const allDbOperators = await prisma.approvalRuleOperator.findMany();
  const getOpIds = (symbols) =>
    allDbOperators
      .filter((o) => symbols.includes(o.operator))
      .map((o) => ({ id: o.id }));

  const equalityOps = getOpIds(["=", "!="]);
  const comparisonOps = getOpIds(["=", "!=", ">", "<", ">=", "<="]);
  const listOps = getOpIds(["IN"]);
  const textOps = [...equalityOps, ...listOps];
  const numberOps = [...comparisonOps, ...listOps];

  const poModule = await prisma.approvalRuleModule.upsert({
    where: { name: "PURCHASE ORDER" },
    create: { name: "PURCHASE ORDER" },
    update: {},
  });

  const fields = [
    {
      moduleId: poModule.id,
      name: "poType",
      label: "PO Type",
      type: "text",
      operators: textOps,
    },
    {
      moduleId: poModule.id,
      name: "discountValue",
      label: "Discount Amount",
      type: "number",
      operators: numberOps,
    },
    {
      moduleId: poModule.id,
      name: "taxPercent",
      label: "Tax Percentage",
      type: "number",
      operators: numberOps,
    },
    {
      moduleId: poModule.id,
      name: "supplierId",
      label: "Supplier ID",
      type: "number",
      operators: textOps,
    },
    {
      moduleId: poModule.id,
      name: "branchId",
      label: "Branch ID",
      type: "number",
      operators: textOps,
    },
    // New Relation-based seeds
    {
      moduleId: poModule.id,
      name: "aliasName",
      label: "Supplier Alias",
      type: "text",
      parentRelation: "Supplier",
      operators: textOps,
    },
    {
      moduleId: poModule.id,
      name: "branchName",
      label: "Branch Name",
      type: "text",
      parentRelation: "Branch",
      operators: textOps,
    },
  ];

  for (const field of fields) {
    const { operators: fieldOps, ...fieldData } = field;
    const exists = await prisma.approvalRuleField.findFirst({
      where: { moduleId: fieldData.moduleId, name: fieldData.name },
    });
    if (!exists) {
      await prisma.approvalRuleField.create({
        data: {
          ...fieldData,
          Operators: { connect: fieldOps },
        },
      });
    } else {
      await prisma.approvalRuleField.update({
        where: { id: exists.id },
        data: {
          Operators: { set: fieldOps },
        },
      });
    }
  }

  // Final Data Clean-up: If any configs exist without moduleId (due to manual migrations), link them for SAFETY
  await prisma.approvalConfig.updateMany({
    where: { moduleId: null },
    data: { moduleId: poModule.id },
  });

  return {
    statusCode: 0,
    message: "Seed completed for operators and base PO module fields",
  };
}

export {
  getFields,
  getOperators,
  seedDefaults,
  addField,
  updateField,
  deleteField,
  addOperator,
  updateOperator,
  deleteOperator,
  getModules,
  addModule,
  updateModule,
  deleteModule,
};
