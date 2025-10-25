const express = require('express');
const router = express.Router();

// ... existing routes

/**
 * POST /api/properties/:id/buy
 * Purchase tokens for a property
 */
router.post('/:id/buy', (req, res) => 
  purchaseController.buyTokens(req, res)
);

module.exports = router;