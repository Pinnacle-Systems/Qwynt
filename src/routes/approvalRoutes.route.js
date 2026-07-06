import { Router } from "express";
const router = Router();
import { markNotificationAsRead } from "../utils/approvalHelper.js";

router.patch("/approval-notification/:id/read", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const result = await markNotificationAsRead(id, userId);
  res.json(result);
});
