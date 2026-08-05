import express from 'express';

import {
  current,
  event,
  forecast,
} from '../controllers/weatherController.js';

const router =
  express.Router();

router.get(
  '/current',
  current
);

router.get(
  '/forecast',
  forecast
);

router.get(
  '/event',
  event
);

export default router;
