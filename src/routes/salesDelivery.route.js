import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
} from "../controllers/salesDelivery.controller.js";

router.get("/", get);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
