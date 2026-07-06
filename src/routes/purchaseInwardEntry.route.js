import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getPurchaseDetail,
  getPurInwardItems,
  getOneBillEntry,
  getPurchaseInwardBillEntryItems,
} from "../controllers/purchaseInwardEntry.controller.js";
import { multerUploadForGrid } from "../utils/multerUpload.js";

router.post("/", multerUploadForGrid.array("images"), create);

router.get("/", get);
router.get("/purInwardItemDetails", getPurInwardItems);
router.get("/purchaseDetail", getPurchaseDetail);
// router.get("/purchaseInwardEntryForBill",getOneBillEntry)
router.get("/purchaseInwardEntryForBill", getPurchaseInwardBillEntryItems);
router.put("/:id", multerUploadForGrid.array("images"), update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
