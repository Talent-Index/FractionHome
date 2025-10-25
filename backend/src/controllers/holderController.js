const mirrorNodeService = require('../services/mirrorNodeService');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const logger = require('../config/logger');

class HolderController {
  /**
   * GET /api/holders/:tokenId
   * Get all holders of a token
   */
  async getTokenHolders(req, res) {
    try {
      const { tokenId } = req.params;
      const { useCache = 'true' } = req.query;

      const balances = await mirrorNodeService.getTokenBalances(
        tokenId,
        useCache === 'true'
      );

      // Filter out zero balances
      const holders = balances.filter(b => b.balance > 0);

      return successResponse(res, {
        tokenId,
        holderCount: holders.length,
        holders,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get token holders error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/holders/:tokenId/transfers
   * Get transfer history for a token
   */
  async getTokenTransferHistory(req, res) {
    try {
      const { tokenId } = req.params;
      const { limit = 25, useCache = 'true' } = req.query;

      const transfers = await mirrorNodeService.getTokenTransfers(
        tokenId,
        parseInt(limit),
        useCache === 'true'
      );

      return successResponse(res, {
        tokenId,
        transferCount: transfers.length,
        transfers,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get token transfers error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/holders/account/:accountId
   * Get all tokens held by an account
   */
  async getAccountHoldings(req, res) {
    try {
      const { accountId } = req.params;
      const { useCache = 'true' } = req.query;

      const tokens = await mirrorNodeService.getAccountTokenBalances(
        accountId,
        useCache === 'true'
      );

      return successResponse(res, {
        accountId,
        tokenCount: tokens.length,
        tokens,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get account holdings error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/holders/:tokenId/verify
   * Force verification from mirror node (bypass cache)
   */
  async verifyTokenOnChain(req, res) {
    try {
      const { tokenId } = req.params;

      // Force fresh data from mirror node
      const [tokenInfo, balances, transfers] = await Promise.all([
        mirrorNodeService.getTokenInfo(tokenId, false),
        mirrorNodeService.getTokenBalances(tokenId, false),
        mirrorNodeService.getTokenTransfers(tokenId, 10, false)
      ]);

      return successResponse(res, {
        tokenInfo,
        currentHolders: balances.filter(b => b.balance > 0).length,
        totalSupply: tokenInfo.totalSupply,
        recentTransfers: transfers.length,
        verifiedAt: new Date().toISOString(),
        cached: false
      });
    } catch (error) {
      logger.error('Verify token on-chain error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new HolderController();