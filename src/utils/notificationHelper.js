/**
 * notificationHelper.js
 *
 * Real-time notification pusher using the shared Socket.io instance.
 * Backend services import { sendApprovalNotification } and call it after
 * creating/advancing an ApprovalLog to instantly alert approvers.
 */

import { io } from "../../server.js";

/**
 * Sends a real-time approval notification to a specific user.
 *
 * @param {number} userId - Target user's ID
 * @param {object} payload - Notification body
 * @param {string} payload.type       - e.g. "APPROVAL_REQUIRED" | "APPROVED" | "REJECTED"
 * @param {string} payload.module     - e.g. "PURCHASE ORDER"
 * @param {string} payload.docId      - Document ID (e.g. "KDY/26-27/PO/5")
 * @param {number} payload.referenceId - The record's primary key
 * @param {string} payload.message    - Human-readable message
 * @param {number} payload.levelNo    - Approval level this relates to
 */

// FIX — lazy getter, resolved at call time
let _io = null;
export function setIo(instance) {
  _io = instance;
}

export function sendApprovalNotification(userId, payload) {
  if (!_io) {
    console.warn("[NOTIFICATION] Socket.io not initialized yet");
    return;
  }
  const room = `user_${userId}`;
  try {
    _io.to(room).emit("approval_notification", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[NOTIFICATION] Failed:`, err.message);
  }
}

/**
 * Sends approval notifications to ALL users in a given approval level.
 *
 * @param {Array<{userId: number}>} levelUsers - LevelUsers array from ApprovalLevel
 * @param {object} payload - Notification body (same as sendApprovalNotification)
 */
export function notifyLevelUsers(levelUsers = [], payload) {
  for (const lu of levelUsers) {
    if (lu.userId) {
      sendApprovalNotification(lu.userId, payload);
    }
  }
}
