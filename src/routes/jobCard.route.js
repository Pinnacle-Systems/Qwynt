import { Router } from "express";
const router = Router();
import {
  get,
  getOne,
  create,
  update,
  remove,
  getJobCardList,get_mob_joblist,get_mob_jobcard,
  getMachinebydep,
  getEmployeeTakenJobcard,
  get_mob_compl_jobcard
} from "../controllers/jobCard.controller.js";


router.post("/", create);

router.get("/", get);
router?.get("/get_mob_joblist",get_mob_joblist)

router?.get("/getEmployeeTakenJobcard",getEmployeeTakenJobcard)

router?.get("/get_mob_compl_jobcard",get_mob_compl_jobcard)

router?.get("/get_mob_jobcard",get_mob_jobcard)
router.get("/jobCardList", getJobCardList);
router.get("/getMachinebydep",getMachinebydep)
router.put("/:id", update);

router.get("/:id", getOne);
router.delete("/:id", remove);

export default router;
