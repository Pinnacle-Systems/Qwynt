import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove } from '../controllers/payOut.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id/:advanceAdjustmentId', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update); 

router.delete('/:id', remove);

export default router;