import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

router.get('/', contactController.list);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

export default router;
