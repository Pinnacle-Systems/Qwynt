import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getInwardJobCardDtls,
} from "../controllers/productionInward.controller.js";

router.post("/", create);

router.get("/", get);
router.get("/getInwardJobCardDtls", getInwardJobCardDtls);

router.put("/:id", update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
