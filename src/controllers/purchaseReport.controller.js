// ─────────────────────────────────────────────────────────────────────────────
//  purchaseReport.controller.js
// ─────────────────────────────────────────────────────────────────────────────

import { Prisma } from "../lib/prisma.js";
import { getPurchaseReport } from "../services/purchaseReport.service.js";

async function purchaseReportGet(req, res) {
  try {
    const result = await getPurchaseReport(req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("purchaseReport error:", error);
    return res.status(500).json({ statusCode: 1, message: error.message });
  }
}

export { purchaseReportGet };
