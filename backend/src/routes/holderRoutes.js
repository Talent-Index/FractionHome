import express from 'express';
const router = express.Router();
import holderController from '../controllers/holderController.js';

/**
 * GET /api/holders/:tokenId
 * Get all holders of a token
 */
router.get('/:tokenId', (req, res) => 
  holderController.getTokenHolders(req, res)
);

/**
 * GET /api/holders/:tokenId/transfers
 * Get transfer history for a token
 */
router.get('/:tokenId/transfers', (req, res) => 
  holderController.getTokenTransferHistory(req, res)
);

/**
 * GET /api/holders/:tokenId/verify
 * Force verification from mirror node (bypass cache)
 */
router.get('/:tokenId/verify', (req, res) => 
  holderController.verifyTokenOnChain(req, res)
);

/**
 * GET /api/holders/account/:accountId
 * Get all tokens held by an account
 */
router.get('/account/:accountId', (req, res) => 
  holderController.getAccountHoldings(req, res)
);

export default router;