// src/routes/propertyRoutes.js
const express = require('express');
const multer = require('multer');
const upload = multer(); // memory storage
const propertyCtrl = require('../controllers/propertyController');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

// Controllers
const propertyController = require('../controllers/propertyController');
const tokenController = require('../controllers/tokenController');
const holderController = require('../controllers/holderController');


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

module.exports = router;
