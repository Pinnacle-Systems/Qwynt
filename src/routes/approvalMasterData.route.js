import { Router } from "express";
import {
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
} from "../controllers/approvalMasterData.controller.js";

const router = Router();

router.get("/fields", getFields);
router.post("/fields", addField);
router.put("/fields/:id", updateField);
router.delete("/fields/:id", deleteField);

router.get("/operators", getOperators);
router.post("/operators", addOperator);
router.put("/operators/:id", updateOperator);
router.delete("/operators/:id", deleteOperator);

router.get("/modules", getModules);
router.post("/modules", addModule);
router.put("/modules/:id", updateModule);
router.delete("/modules/:id", deleteModule);

router.post("/seed", seedDefaults);

export default router;
