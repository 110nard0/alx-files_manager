import { Router } from 'express';

import * as AppController from '../controllers/AppController';
import * as AuthController from '../controllers/AuthController';
import * as FilesController from '../controllers/FilesController';
import * as UsersController from '../controllers/UsersController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// router.route('/files')
  // .get(FilesController.getIndex)
router.post('/files', FilesController.postUpload);

router.get('/users/me', UsersController.getMe);
router.post('/users', UsersController.postNew);

export default router;
