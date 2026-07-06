import { prisma } from "../lib/prisma.js";
const REFERENCE_PAGE = "ORDER ENTRY";

async function checkPendingJobCards(userId) {
  const today = new Date();

  const pendingItems = await prisma.orderItems.findMany({
    where: {
      jobCards: {
        none: {},
      },

      OrderEntry: {
        validTo: {
          lt: today,
        },
      },
    },

    include: {
      OrderEntry: true,
      StyleItem: true,
    },
  });

  for (const item of pendingItems) {
    const alreadyExists = await prisma.notification.findFirst({
      where: {
        referenceId: item.id,
        referencePage: REFERENCE_PAGE,
      },
    });

    if (!alreadyExists) {
      await prisma.notification.create({
        data: {
          title: "Job Card Pending",

          message: `Job Card not created for ${item.StyleItem?.name || ""} in ${item.OrderEntry?.docId || ""}`,

          type: "WARNING",

          userId: parseInt(userId),

          referenceId: item.id,

          referencePage: REFERENCE_PAGE,
        },
      });
    }
  }
}

async function getNotifications(req) {
  const userId = req.userId;

  await checkPendingJobCards(userId);

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    statusCode: 0,
    data: notifications,
  };
}

async function markAsRead(req) {
  const { id } = req.body;

  await prisma.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });

  return {
    statusCode: 0,
    data: "Notification marked as read",
  };
}

// await prisma.notification.updateMany({
//   where: {
//     referenceId: orderItemId,
//     referencePage: "JOB_CARD_PENDING",
//   },

//   data: {
//     isResolved: true,
//   },
// });

// And query:

// isResolved: false
export { checkPendingJobCards, getNotifications, markAsRead };
