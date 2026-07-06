import { Router } from "express";
const router = Router();
import {
  getNotifications as _getNotifications,
  markAsRead as _markAsRead,
  checkPendingJobCards as _checkPendingJobCards,
} from "../controllers/notification.controller.js";

router.get("/", _getNotifications);
router.put("/markAsRead", _markAsRead);
router.get("/checkPendingJobCards", _checkPendingJobCards);

export default router;
