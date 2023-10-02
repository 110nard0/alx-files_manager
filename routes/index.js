import { Router } from 'express';

import AppController from '../controllers/AppController';
import * as AuthController from '../controllers/AuthController';
import * as FilesController from '../controllers/FilesController';
import * as UsersController from '../controllers/UsersController';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.route('/files')
  .get(FilesController.getIndex)
  .post(FilesController.postUpload);

router.get('/files/:id', FilesController.getShow);
router.get('/files/:id/data', FilesController.getFile);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

router.get('/users/me', UsersController.getMe);
router.post('/users', UsersController.postNew);

// export default router;
module.exports = router;
