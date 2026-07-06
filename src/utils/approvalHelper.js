import { prisma } from "../lib/prisma.js";
import { notifyLevelUsers } from "./notificationHelper.js";

// ═══════════════════════════════════════════════════════════════════════════
// VALUE RESOLVER — handles flat fields, single relations, and array aggregation
// ═══════════════════════════════════════════════════════════════════════════
export function getValueByPath(record, field) {
  if (!record || !field) return undefined;

  const { name, parentRelation, fieldPath, aggregation } = field;

  // ── CASE 1: Flat field (e.g. po.poType, po.netBillValue) ────────────────────
  if (!parentRelation) {
    // Support dotted fieldPath on the flat record too (e.g. "Address.City")
    if (fieldPath) return walkPath(record, fieldPath);
    return record[name];
  }

  // ── CASE 2: Resolve relation (handle Prisma casing quirks) ──────────────────
  const related = resolveRelation(record, parentRelation);
  if (related === undefined || related === null) return undefined;

  const pathKey = fieldPath || name;

  // ── CASE 2a: Array relation (e.g. po.poItems) ───────────────────────────────
  if (Array.isArray(related)) {
    const values = related
      .map((item) => walkPath(item, pathKey))
      .filter((v) => v !== undefined && v !== null);

    switch (aggregation) {
      case "SUM":
        return values.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
      case "COUNT":
        return values.length;
      case "MAX": {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        return nums.length ? Math.max(...nums) : 0;
      }
      case "MIN": {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        return nums.length ? Math.min(...nums) : 0;
      }
      case "AVG": {
        const nums = values.map(Number).filter((n) => !isNaN(n));
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      }
      default:
        // No aggregation set — return raw array so IN/ANY can match
        return values;
    }
  }

  // ── CASE 2b: Single relation object (e.g. po.Supplier) ──────────────────────
  return walkPath(related, pathKey);
}

// Walk dot-notation paths like "City.name"
function walkPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// Handle capitalization quirks between schema and loaded record
function resolveRelation(record, relationName) {
  if (record[relationName] !== undefined) return record[relationName];
  const cap = relationName.charAt(0).toUpperCase() + relationName.slice(1);
  if (record[cap] !== undefined) return record[cap];
  const low = relationName.charAt(0).toLowerCase() + relationName.slice(1);
  if (record[low] !== undefined) return record[low];
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// RULE EVALUATION
// ═══════════════════════════════════════════════════════════════════════════
export function applyOperator(op, a, b) {
  const n1 = isNaN(a) ? a : Number(a);
  const n2 = isNaN(b) ? b : Number(b);
  switch (op) {
    case "=":
      return n1 == n2;
    case "!=":
      return n1 != n2;
    case ">":
      return n1 > n2;
    case "<":
      return n1 < n2;
    case ">=":
      return n1 >= n2;
    case "<=":
      return n1 <= n2;
    case "IN":
      return (b || "")
        .split(",")
        .map((s) => s.trim())
        .includes(String(a));
    default:
      return false;
  }
}

export function evaluateRuleCondition(cond, recordData) {
  const sourceVal = getValueByPath(recordData, cond.Field);
  const compareVal =
    cond.valueType === "DYNAMIC"
      ? getValueByPath(recordData, cond.CompareField)
      : cond.value;

  // Non-aggregated arrays — ANY element matches
  if (Array.isArray(sourceVal)) {
    return sourceVal.some((v) =>
      applyOperator(cond.Operator?.operator, v, compareVal),
    );
  }
  return applyOperator(cond.Operator?.operator, sourceVal, compareVal);
}

export function evaluateConfigTrigger(config, recordData) {
  if (config.isAlwaysApproved) return true;
  if (!config.ConfigConditions || config.ConfigConditions.length === 0)
    return true;
  const results = config.ConfigConditions.map((c) =>
    evaluateRuleCondition(c, recordData),
  );
  return config.ruleLogicalOperator === "OR"
    ? results.some(Boolean)
    : results.every(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGERED CONFIG LOOKUP
// ═══════════════════════════════════════════════════════════════════════════
// approvalHelper.js
export async function getTriggeredConfig(
  branchId,
  moduleId,
  recordData,
  db = prisma,
) {
  const configs = await db.approvalConfig.findMany({
    where: {
      branchId: parseInt(branchId),
      moduleId: parseInt(moduleId),
      active: true,
    },
    orderBy: { priority: "asc" },
    include: {
      ConfigConditions: {
        include: { Field: true, Operator: true, CompareField: true },
      },
      approvalLevels: {
        include: { LevelUsers: true },
        orderBy: { levelNo: "asc" },
      },
    },
  });

  if (!configs.length) return null;

  // ✅ Only consider configs that have at least one level with users
  const validConfigs = configs.filter(
    (c) =>
      c.approvalLevels?.length > 0 &&
      c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
  );

  for (const config of validConfigs) {
    if (evaluateConfigTrigger(config, recordData)) {
      return config;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE SETUP CHECK
// ═══════════════════════════════════════════════════════════════════════════
export async function isApprovalEnabled(branchId, moduleId) {
  const configs = await prisma.approvalConfig.findMany({
    where: { branchId: +branchId, moduleId: +moduleId, active: true },
    orderBy: { priority: "asc" },
  });
  return { enabled: configs.length > 0, configs };
}

export async function getModuleApprovalSetup(referencePage, branchId) {
  const module = await prisma.approvalRuleModule.findUnique({
    where: { name: referencePage },
    select: { id: true, name: true },
  });
  if (!module) return { module: null, hasApproval: false };

  const activeConfig = await prisma.approvalConfig.findFirst({
    where: { moduleId: module.id, branchId: parseInt(branchId), active: true },
    select: { id: true },
  });
  return { module, hasApproval: !!activeConfig };
}
// approvalHelper.js — add this helper
export async function buildIncludeForModule(moduleId) {
  const fields = await prisma.approvalRuleField.findMany({
    where: { moduleId: parseInt(moduleId), active: true },
    select: { parentRelation: true },
  });

  const relations = [
    ...new Set(fields.map((f) => f.parentRelation).filter(Boolean)),
  ];

  return relations.reduce((acc, rel) => {
    acc[rel] = true;
    return acc;
  }, {});
}
// ═══════════════════════════════════════════════════════════════════════════
// CREATE APPROVAL LOG
// ═══════════════════════════════════════════════════════════════════════════
export async function createApprovalLog(
  tx,
  branchId,
  moduleId,
  referenceId,
  referencePage,
  recordData = {},
  referenceDocId,
  userId,
) {
  // ✅ Pass tx so lookup runs inside the transaction
  const triggeredConfig = await getTriggeredConfig(
    branchId,
    moduleId,
    recordData,
    tx,
  );

  if (!triggeredConfig || triggeredConfig.approvalLevels.length === 0) {
    return null;
  }

  const firstLevel = triggeredConfig.approvalLevels[0];

  const log = await tx.approvalLog.create({
    data: {
      approvalConfigId: triggeredConfig.id,
      referenceId: parseInt(referenceId),
      referencePage,
      status: "PENDING",
      currentLevel: firstLevel.levelNo,
      referenceDocId,
      raisedById: parseInt(userId),
    },
  });

  // Notify first-level approvers
  notifyLevelUsers(firstLevel.LevelUsers, {
    type: "APPROVAL_REQUIRED",
    module: referencePage,
    docId: referenceDocId,
    referenceId: parseInt(referenceId),
    levelNo: firstLevel.levelNo,
    configName: triggeredConfig.name,
    message: `Approval required for ${referencePage} - ${referenceDocId ?? referenceId} (Level ${firstLevel.levelNo})`,
  });

  return { log, triggeredConfig };
}

// ═══════════════════════════════════════════════════════════════════════════
// GET APPROVAL LOG
// ═══════════════════════════════════════════════════════════════════════════
export async function getApprovalLog(referenceId, referencePage) {
  return await prisma.approvalLog.findFirst({
    where: { referenceId: parseInt(referenceId), referencePage },
    orderBy: { createdAt: "desc" },
    include: {
      ApprovalConfig: {
        include: {
          approvalLevels: {
            include: { LevelUsers: { include: { User: true } } },
            orderBy: { levelNo: "asc" },
          },
        },
      },
      LevelLogs: {
        include: { User: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH CHECK
// ═══════════════════════════════════════════════════════════════════════════
export async function canUserActOnLevel(approvalLog, userId) {
  const config = approvalLog.ApprovalConfig;
  if (!config) return false;

  const currentLevel = config.approvalLevels.find(
    (l) => l.levelNo === approvalLog.currentLevel,
  );
  if (!currentLevel) return false;

  return currentLevel.LevelUsers.some((lu) => lu.userId === parseInt(userId));
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCE APPROVAL — moves to next level or marks APPROVED
// ═══════════════════════════════════════════════════════════════════════════
async function advanceApproval(
  tx,
  approvalLog,
  applicableLevels,
  userId,
  remarks,
) {
  const nextLevelNo = applicableLevels
    .map((l) => l.levelNo)
    .find((n) => n > approvalLog.currentLevel);

  if (nextLevelNo) {
    const updated = await tx.approvalLog.update({
      where: { id: approvalLog.id },
      data: { currentLevel: nextLevelNo },
    });

    const nextLevel = applicableLevels.find((l) => l.levelNo === nextLevelNo);
    if (nextLevel?.LevelUsers?.length) {
      notifyLevelUsers(nextLevel.LevelUsers, {
        type: "APPROVAL_REQUIRED",
        module: approvalLog.referencePage,
        docId: approvalLog.referenceDocId,
        referenceId: approvalLog.referenceId,
        levelNo: nextLevelNo,
        message: `Approval required for ${approvalLog.referencePage} - ${approvalLog.referenceDocId ?? approvalLog.referenceId} (Level ${nextLevelNo})`,
      });
    }
    return updated;
  }

  // All levels done → fully APPROVED
  const updated = await tx.approvalLog.update({
    where: { id: approvalLog.id },
    data: {
      status: "APPROVED",
      approvedById: parseInt(userId),
      approvedAt: new Date(),
      remarks: remarks || null,
      isRead: false,
    },
  });

  // Notify the raiser
  if (approvalLog.raisedById) {
    notifyLevelUsers([{ userId: approvalLog.raisedById }], {
      type: "APPROVED",
      module: approvalLog.referencePage,
      docId: approvalLog.referenceDocId,
      referenceId: approvalLog.referenceId,
      message: `${approvalLog.referencePage} - ${approvalLog.referenceDocId ?? approvalLog.referenceId} has been fully approved!`,
    });
  }
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════
// APPROVE
// ═══════════════════════════════════════════════════════════════════════════
export async function approveRecord(
  referenceId,
  referencePage,
  userId,
  remarks,
) {
  return await prisma.$transaction(async (tx) => {
    const log = await tx.approvalLog.findFirst({
      where: { referenceId: parseInt(referenceId), referencePage },
      orderBy: { createdAt: "desc" },
      include: {
        ApprovalConfig: {
          include: {
            approvalLevels: {
              include: { LevelUsers: true },
              orderBy: { levelNo: "asc" },
            },
          },
        },
        LevelLogs: true,
      },
    });
    if (!log) return { statusCode: 1, message: "Approval log not found" };
    if (log.status === "APPROVED")
      return { statusCode: 1, message: "Already approved" };
    if (log.status === "REJECTED")
      return { statusCode: 1, message: "Already rejected" };

    const config = log.ApprovalConfig;
    const applicableLevels = config.approvalLevels;
    const currentLevel = applicableLevels.find(
      (l) => l.levelNo === log.currentLevel,
    );
    if (!currentLevel)
      return { statusCode: 1, message: "Current level not found" };

    // Auth check
    const isAuthorised = currentLevel.LevelUsers.some(
      (lu) => lu.userId === parseInt(userId),
    );
    if (!isAuthorised) {
      return { statusCode: 1, message: "Not authorised to approve this level" };
    }

    // ✅ Prevent double-approval at same level by same user
    const alreadyActed = log.LevelLogs.some(
      (ll) =>
        ll.approvalLevelId === currentLevel.id &&
        ll.userId === parseInt(userId) &&
        ll.action === "APPROVED",
    );
    if (alreadyActed) {
      return { statusCode: 1, message: "You have already approved this level" };
    }

    // Record this user's approval
    await tx.approvalLevelLog.create({
      data: {
        approvalLogId: log.id,
        approvalLevelId: currentLevel.id,
        levelNo: currentLevel.levelNo,
        userId: parseInt(userId),
        action: "APPROVED",
        remarks: remarks || null,
      },
    });

    // Check if level is satisfied (OR = 1 approver, AND = all)
    const existingApprovers = log.LevelLogs.filter(
      (ll) =>
        ll.approvalLevelId === currentLevel.id && ll.action === "APPROVED",
    ).map((ll) => ll.userId);

    const uniqueApprovers = new Set([...existingApprovers, parseInt(userId)]);
    const requiredCount = currentLevel.LevelUsers.length;

    const levelSatisfied =
      currentLevel.approveType === "OR"
        ? uniqueApprovers.size >= 1
        : uniqueApprovers.size >= requiredCount;

    if (!levelSatisfied) {
      return {
        statusCode: 0,
        message: "Approval recorded. Waiting for other approvers.",
        data: log,
      };
    }

    // Level satisfied → advance to next or mark APPROVED
    // ✅ Removed erroneous REJECTED notification that was here
    const updated = await advanceApproval(
      tx,
      log,
      applicableLevels,
      userId,
      remarks,
    );
    return { statusCode: 0, data: updated };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// REJECT
// ═══════════════════════════════════════════════════════════════════════════
export async function rejectRecord(
  referenceId,
  referencePage,
  userId,
  remarks,
) {
  return await prisma.$transaction(async (tx) => {
    const log = await tx.approvalLog.findFirst({
      where: { referenceId: parseInt(referenceId), referencePage },
      orderBy: { createdAt: "desc" },
      include: {
        ApprovalConfig: {
          include: { approvalLevels: { include: { LevelUsers: true } } },
        },
        LevelLogs: true,
      },
    });

    if (!log) return { statusCode: 1, message: "Approval log not found" };
    if (log.status !== "PENDING") {
      return {
        statusCode: 1,
        message: `Cannot reject status is ${log.status}`,
      };
    }

    const currentLevel = log.ApprovalConfig.approvalLevels.find(
      (l) => l.levelNo === log.currentLevel,
    );
    const isAuthorised = currentLevel?.LevelUsers.some(
      (lu) => lu.userId === parseInt(userId),
    );
    if (!isAuthorised) {
      return { statusCode: 1, message: "Not authorised to reject this level" };
    }

    await tx.approvalLevelLog.create({
      data: {
        approvalLogId: log.id,
        approvalLevelId: currentLevel.id,
        levelNo: currentLevel.levelNo,
        userId: parseInt(userId),
        action: "REJECTED",
        remarks: remarks || null,
      },
    });

    const updated = await tx.approvalLog.update({
      where: { id: log.id },
      data: {
        status: "REJECTED",
        rejectedById: parseInt(userId),
        rejectedAt: new Date(),
        remarks: remarks || null,
        isRead: false,
      },
    });

    // ✅ Notify the raiser about rejection (this was missing)
    if (log.raisedById) {
      notifyLevelUsers([{ userId: log.raisedById }], {
        type: "REJECTED",
        module: log.referencePage,
        docId: log.referenceDocId,
        referenceId: log.referenceId,
        message: `${log.referencePage} - ${log.referenceDocId ?? log.referenceId} was rejected. Remarks: ${remarks || "None"}`,
      });
    }

    return { statusCode: 0, data: updated };
  });
}

// approvalHelper.js — add this export
export async function markNotificationAsRead(approvalLogId, userId) {
  // Mark the specific log as read for this user
  const log = await prisma.approvalLog.findFirst({
    where: {
      id: parseInt(approvalLogId),
      // Only the raiser can mark their own notifications as read
      raisedById: parseInt(userId),
    },
    select: { id: true, isRead: true },
  });

  if (!log) {
    return { statusCode: 1, message: "Notification not found" };
  }

  const updated = await prisma.approvalLog.update({
    where: { id: parseInt(approvalLogId) },
    data: { isRead: true },
  });

  return { statusCode: 0, data: updated };
}
// notificationService.js or approvalHelper.js

export function getApprovalStatus(log, isApprovalConfigured = false) {
  if (!log) {
    return isApprovalConfigured
      ? {
          status: "NOTAPPROVED",
          label: "Not Approved",
          color: "orange",
          currentLevel: 1,
          levelLogs: [],
        }
      : {
          status: "NOT_CONFIGURED",
          label: "No Approval",
          color: "gray",
          currentLevel: null,
          levelLogs: [],
        };
  }
  const base = {
    currentLevel: log.currentLevel,
    levelLogs: log.LevelLogs ?? [],
    remarks: log.remarks,
  };
  const map = {
    APPROVED: {
      ...base,
      status: "APPROVED",
      label: "Approved",
      color: "green",
    },
    REJECTED: { ...base, status: "REJECTED", label: "Rejected", color: "red" },
    PENDING: { ...base, status: "PENDING", label: "Pending", color: "orange" },
    NOTAPPROVED: {
      ...base,
      status: "NOTAPPROVED",
      label: "Not Approved",
      color: "orange",
    },
    SUPERSEDED: {
      ...base,
      status: "SUPERSEDED",
      label: "Re-approval Needed",
      color: "yellow",
    }, // ✅ NEW
  };
  return (
    map[log.status] ?? {
      ...base,
      status: "UNKNOWN",
      label: "Unknown",
      color: "gray",
    }
  );
}

export function evaluateConfigs(activeConfigs, record) {
  if (!activeConfigs?.length) return false;

  // ✅ Only valid configs with levels + users, sorted by priority
  const valid = activeConfigs
    .filter(
      (c) =>
        c.approvalLevels?.length > 0 &&
        c.approvalLevels.some((l) => l.LevelUsers?.length > 0),
    )
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  // ✅ Use shared evaluator — same logic as getTriggeredConfig for consistency
  return valid.some((config) => evaluateConfigTrigger(config, record));
}
