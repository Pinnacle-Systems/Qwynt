import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove } from '../controllers/style.controller.js';
import multer from 'multer';

const upload = multer()

router.post('/', upload.single('image'), create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', upload.single('image'), update);

router.delete('/:id', remove);

export default router;