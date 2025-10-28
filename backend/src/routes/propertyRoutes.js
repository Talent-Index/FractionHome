// src/routes/propertyRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer(); // memory storage
import * as propertyCtrl from '../controllers/propertyController.js';
import purchaseController from '../controllers/purchaseController.js'; // or see note below

const router = express.Router();

/**
 * Property Routes
 */
router.post('/:id/buy', (req, res) =>
  purchaseController.buyTokens(req, res)
);

router.post('/', upload.array('files'), propertyCtrl.uploadProperty);
router.get('/', propertyCtrl.listAll);
router.get('/:id', propertyCtrl.getProperty);
router.get('/:id/verify', propertyCtrl.verifyProperty);

export default router;
