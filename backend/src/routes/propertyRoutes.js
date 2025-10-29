// src/routes/propertyRoutes.js
import express from 'express';
import multer from 'multer';
const upload = multer(); // memory storage
import db from '../db/index.js';
import * as propertyCtrl from '../controllers/propertyController.js';
import purchaseService from '../services/purchaseService.js';
import propertyModel from '../models/propertyModel.js';
import mirrorNodeService from '../services/mirrorNodeService.js';
import purchaseController from '../controllers/purchaseController.js'; 
import * as tokenCtrl from '../controllers/tokenController.js';
import * as tokenizer from '../services/tokenizationService.js'

const purchaseCtrl = new purchaseController(
  purchaseService,
  new propertyModel(db),
  mirrorNodeService
);

const router = express.Router();

/**
 * Property Routes
 */
router.post('/:id/buy', (req, res) =>
  purchaseCtrl.buyTokens(req, res)
);

router.post('/', upload.array('files'), propertyCtrl.uploadProperty);
router.post('/:id/photo', upload.single('file'), propertyCtrl.uploadPhoto);
router.get('/', propertyCtrl.listAll);
router.get('/:id', propertyCtrl.getProperty);
router.get('/:id/verify', propertyCtrl.verifyProperty);

router.post('/:id/tokenize', (req, res) => {
  req.body = req.body || {};
  req.body.propertyId = req.params.id;
  return tokenCtrl.createToken(req, res);
});

router.get('/:id/tokens', (req, res) => {
  req.query = req.query || {};
  req.query.propertyId = req.params.id;
  return tokenCtrl.listTokens(req, res);
});

router.get('/:id/token', (req, res) => {
  req.params.id = req.params.id;
  return tokenCtrl.getToken(req, res);
});

router.post('/:id/token/mint', (req, res) => {
  req.params.id = req.params.id;
  return tokenCtrl.mintToken(req, res);
});

router.post('/:id/token/burn', (req, res) => {
  req.params.id = req.params.id;
  return tokenCtrl.burnToken(req, res);
});

router.post('/:id/token/transfer', (req, res) => {
  req.params.id = req.params.id;
  return tokenCtrl.transferToken(req, res);
});


// create treasury account and initial token supply for a property
router.post('/:id/treasury', (req, res, next) =>
  tokenizer.createTreasuryForProperty(req, res, next)
);

export default router;
