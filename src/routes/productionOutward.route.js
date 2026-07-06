import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getOutwardJobCardDtls,
} from "../controllers/productionOutward.controller.js";

router.post("/", create);

router.get("/", get);
router.get("/getOutwardJobCardDtls", getOutwardJobCardDtls);
router.put("/:id", update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
