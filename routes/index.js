import express from 'express';
import * as AppController from '../controllers/AppController';

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
