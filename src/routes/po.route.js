import { Router } from "express";
const router = Router();
import {
  create,
  get,
  getOne,
  update,
  remove,
  getPoItems,
  createApproveStatus,
} from "../controllers/po.controller.js";

router.post("/", create);
router.post("/approval", createApproveStatus);
router.get("/", get);
router.get("/getPoItemsDetails", getPoItems);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
