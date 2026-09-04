import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  getSearch,
  create,
  update,
  remove,
  getBoxReport,
  getBoxForSales,
} from "../controllers/boxCreation.service.js";

router.post("/", create);

router.get("/", get);

router.get("/report/:id", getBoxReport);

router.get("/search", getSearch);
router.get("/forSalesDelivery/search", getBoxForSales);

router.get("/:id", getOne);

router.put("/:id", update);

router.delete("/:id", remove);

export default router;
