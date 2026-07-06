import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
} from "../controllers/style.controller.js";



router.get("/", get);

router.post("/",create );


router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
