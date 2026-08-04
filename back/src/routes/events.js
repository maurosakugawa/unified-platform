import express from 'express';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

router.get('/', eventController.list);
router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.remove);
router.get('/:id/contacts', eventController.getContacts);

export default router;
