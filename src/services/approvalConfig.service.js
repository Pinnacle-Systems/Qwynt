import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from "../configs/Responses.js";

async function get(req) {
  const { branchId } = req.query;

  const data = await prisma.approvalConfig.findMany({
    where: {
      branchId: branchId ? parseInt(branchId) : undefined,
    },
    include: {
      Module: true,
      ApproverRole: true,
      ApproverUser: true,
      approvalLevels: {
        include: {
          LevelUsers: {
            include: { User: true },
          },
        },
      },
      _count: {
        select: {
          approvalLogs: true,
        },
      },
    },
  });

  return {
    statusCode: 0,
    data: data.map((item) => ({
      ...item,
      childRecord: item._count.approvalLogs,
    })),
  };
}

// notificationService.js or approvalHelper.js
// approvalConfig.service.js — fix getPendingApproval signature
async function getPendingApproval(req) {
  const { userId } = req.query; // ✅ extract from req.query, not just userId

  if (!userId) return { statusCode: 1, message: "userId is required" };

  const pendingToApprove = await prisma.approvalLog.findMany({
    where: {
      status: "PENDING",
      ApprovalConfig: {
        approvalLevels: {
          some: {
            LevelUsers: { some: { userId: parseInt(userId) } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      referenceId: true,
      referencePage: true,
      referenceDocId: true,
      status: true,
      currentLevel: true,
      isRead: true,
      createdAt: true,
      raisedById: true,
      RaisedBy: { select: { id: true, username: true } },
      ApprovalConfig: {
        select: {
          approvalLevels: {
            orderBy: { levelNo: "asc" },
            select: {
              id: true,
              levelNo: true,
              LevelUsers: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  // ✅ Filter to only logs where user is in CURRENT level specifically
  const filteredPending = pendingToApprove.filter((log) => {
    const currentLevelObj = log.ApprovalConfig?.approvalLevels?.find(
      (l) => l.levelNo === log.currentLevel,
    );
    if (!currentLevelObj) return false;
    return currentLevelObj.LevelUsers.some(
      (lu) => lu.userId === parseInt(userId),
    );
  });

  const raisedByLogs = await prisma.approvalLog.findMany({
    where: {
      raisedById: parseInt(userId),
      status: { in: ["APPROVED", "REJECTED", "SUPERSEDED"] },
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      referenceId: true,
      referencePage: true,
      referenceDocId: true,
      status: true,
      currentLevel: true,
      isRead: true,
      createdAt: true,
      raisedById: true,
      RaisedBy: { select: { id: true, username: true } },
      ApprovalConfig: {
        select: {
          approvalLevels: {
            orderBy: { levelNo: "asc" },
            select: { id: true, levelNo: true },
          },
        },
      },
    },
  });

  const merged = [
    ...filteredPending.map((l) => ({
      ...l,
      notificationType: "ACTION_REQUIRED",
    })),
    ...raisedByLogs.map((l) => ({ ...l, notificationType: "RESULT" })),
  ].sort((a, b) => {
    if (a.notificationType !== b.notificationType) {
      return a.notificationType === "ACTION_REQUIRED" ? -1 : 1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return { statusCode: 0, data: merged };
}

async function getOne(id) {
  const data = await prisma.approvalConfig.findUnique({
    where: { id: parseInt(id) },
    include: {
      ConfigConditions: {
        include: {
          Field: true,
          Operator: true,
          CompareField: true,
        },
      },
      approvalLevels: {
        orderBy: { levelNo: "asc" },
        include: {
          LevelUsers: {
            include: { User: true },
          },
        },
      },
      ApproverRole: true,
      ApproverUser: true,
      Module: true,
    },
  });

  if (!data) return NoRecordFound("ApprovalConfig");

  return {
    statusCode: 0,
    data: {
      ...data,
      approvalLevelItems: data.approvalLevels.map((lvl) => ({
        levelNo: lvl.levelNo,
        approveType: lvl.approveType,
        users: lvl.LevelUsers.map((u) => ({
          label: u.User?.username,
          value: u.userId,
        })),
      })),
    },
  };
}

async function getSearch(req) {
  const { searchKey } = req.params;
  const { companyId, active } = req.query;
  const data = await prisma.taxTemplate.findMany({
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
  const {
    branchId,
    moduleId,
    active,
    isAlwaysApproved,
    approvalLevelItems,
    name,
    priority,
    ruleLogicalOperator,
    ConfigConditions,
  } = await body;

  const data = await prisma.approvalConfig.create({
    data: {
      name,
      branchId: parseInt(branchId),
      moduleId: parseInt(moduleId),
      priority: parseInt(priority || 0),
      active,
      isAlwaysApproved: Boolean(isAlwaysApproved),
      ruleLogicalOperator: ruleLogicalOperator || "AND",

      ConfigConditions: {
        create:
          ConfigConditions?.filter((cond) => cond.fieldId && cond.operatorId) // Skip empty/invalid rules
            ?.map((cond) => ({
              fieldId: parseInt(cond.fieldId),
              operatorId: parseInt(cond.operatorId),
              valueType: cond.valueType || "STATIC",
              value: cond.valueType === "STATIC" ? cond.value : null,
              compareFieldId:
                cond.valueType === "DYNAMIC"
                  ? parseInt(cond.compareFieldId)
                  : null,
            })) || [],
      },

      approvalLevels: {
        create: approvalLevelItems.map((lvl, index) => ({
          levelNo: index + 1,
          approveType: lvl.approveType,

          LevelUsers: {
            create: lvl.users.map((u) => ({
              userId: parseInt(u.value),
            })),
          },
        })),
      },
    },
  });

  return { statusCode: 0, data };
}

async function update(id, body) {
  const {
    branchId,
    moduleId,
    active,
    isAlwaysApproved,
    approvalLevelItems,
    name,
    priority,
    ruleLogicalOperator,
    ConfigConditions,
  } = await body;

  const existing = await prisma.approvalConfig.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existing) return NoRecordFound("ApprovalConfig");

  const data = await prisma.approvalConfig.update({
    where: { id: parseInt(id) },
    data: {
      name,
      branchId: parseInt(branchId),
      moduleId: parseInt(moduleId),
      priority: parseInt(priority || 0),
      active,
      isAlwaysApproved: Boolean(isAlwaysApproved),
      ruleLogicalOperator: ruleLogicalOperator || "AND",

      ConfigConditions: {
        deleteMany: {}, // Clear old rules
        create:
          ConfigConditions?.filter((cond) => cond.fieldId && cond.operatorId) // Skip empty/invalid rules
            ?.map((cond) => ({
              fieldId: parseInt(cond.fieldId),
              operatorId: parseInt(cond.operatorId),
              valueType: cond.valueType || "STATIC",
              value: cond.valueType === "STATIC" ? cond.value : null,
              compareFieldId:
                cond.valueType === "DYNAMIC"
                  ? parseInt(cond.compareFieldId)
                  : null,
            })) || [],
      },

      approvalLevels: {
        deleteMany: {}, // 🔥 clear old
        create: approvalLevelItems.map((lvl, index) => ({
          levelNo: index + 1,
          approveType: lvl.approveType,

          LevelUsers: {
            create: lvl.users.map((u) => ({
              userId: parseInt(u.value),
            })),
          },
        })),
      },
    },
  });

  return { statusCode: 0, data };
}

async function remove(id) {
  const data = await prisma.approvalConfig.delete({
    where: { id: parseInt(id) },
  });

  return { statusCode: 0, data };
}

// approvalConfig.service.js — fix markApprovalRead (no userId check needed, simpler)
async function markApprovalRead(id, userId) {
  const data = await prisma.approvalLog.update({
    where: { id: parseInt(id) },
    data: { isRead: true },
  });
  return { statusCode: 0, data };
}

// Frontend — update Notification.jsx to show type label and mark as read on view:
// jsxfunction openRecord(log) {
//   const tabName = PAGE_ROUTE_MAP[log.referencePage] ?? log.referencePage;
//   dispatch(push({ name: tabName, previewId: log.referenceId }));
//   // Mark as read so it disappears from raised-by list
//   if (log.isRead === false) {
//     markRead(log.id); // add useMarkApprovalReadMutation below
//   }
//   setOpen(false);
// }

export {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getPendingApproval,
  markApprovalRead,
};
