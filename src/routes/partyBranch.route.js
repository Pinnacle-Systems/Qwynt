import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove } from '../controllers/partyBranch.controller.js';
import { multerUploadForGrid } from '../utils/multerUpload.js';


router.post('/', multerUploadForGrid.array('images'), create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', multerUploadForGrid.array('images'), update);

router.delete('/:id', remove);

export default router;