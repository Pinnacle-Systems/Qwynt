import {
  getNotifications as _getNotifications,
  markAsRead as _markAsRead,
  checkPendingJobCards as _checkPendingJobCards,
} from "../services/notification.service.js";

async function getNotifications(req, res, next) {
  try {
    res.json(await _getNotifications(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function markAsRead(req, res, next) {
  try {
    res.json(await _markAsRead(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

async function checkPendingJobCards(req, res, next) {
  try {
    res.json(await _checkPendingJobCards(req));
  } catch (err) {
    console.error(`Error `, err.message);
  }
}

export { getNotifications, markAsRead, checkPendingJobCards };
