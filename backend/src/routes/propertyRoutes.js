const express = require('express');
const multer = require('multer');
const upload = multer(); // memory storage
const ctrl = require('../controllers/propertyController');


const router = express.Router();


router.post('/', upload.array('files'), ctrl.uploadProperty);
router.get('/', ctrl.listAll);
router.get('/:id', ctrl.getProperty);
router.get('/:id/verify', ctrl.verifyProperty);


module.exports = router;
