// ─────────────────────────────────────────────────────────────────────────────
//  purchaseReport.routes.js
//  Mount in your main app.js:
//    const purchaseReportRouter = require("./routes/purchaseReport.routes");
//    app.use("/api/purchase-report", purchaseReportRouter);
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from "express";
const router = Router();
import { purchaseReportGet } from "../controllers/purchaseReport.controller.js";

// GET /api/purchase-report
// Query params: branchId, finYearId, startDate, endDate, supplierId, poType, inwardType
router.get("/", purchaseReportGet);

export default router;
