import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  UpdateProcess,
  UpdatePushProcess,
  UpdateCurrentProcess
} from "../controllers/process.controller.js";

router.post("/", create);

router.get("/", get);

router.get("/:id", getOne);

router.put("/:id", update);

router.put("/Update/Process",UpdateProcess)

router.put("/Update/PushProcess",UpdatePushProcess)

router.put("/Update/CurrentProcess",UpdateCurrentProcess)

router.delete("/:id", remove);

export default router;
