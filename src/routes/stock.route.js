import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getPcsStock,
  getStock,
  getBoardQty,
} from "../controllers/stock.controller.js";

router.post("/", create);

router.get("/getPcsStock", getPcsStock);

router.get("/", get);

router.get("/getBoardQty", getBoardQty);

router.get("/getStockReport", getStock);

router.get("/:id", getOne);

router.get("/search/:searchKey", getSearch);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
