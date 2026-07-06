import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getPIList,
} from "../controllers/ProformaInvoice.Controller.js";
import { multerUploadForGrid } from "../utils/multerUpload.js";

router.post("/", multerUploadForGrid.array("images"), create);

router.get("/", get);
router.get("/proFormaList", getPIList);
router.put("/:id", multerUploadForGrid.array("images"), update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
