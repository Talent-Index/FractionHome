import { successResponse, errorResponse } from '../utils/responseUtil.js';
import logger from '../config/logger.js';
import constants from '../utils/constants.js';

const { MIN_PURCHASE_QUANTITY, MAX_PURCHASE_QUANTITY } = constants;

class PurchaseController {
  constructor(purchaseService, propertyModel, mirrorNodeService) {
    this.purchaseService = purchaseService;
    this.propertyModel = propertyModel;
    this.mirrorNodeService = mirrorNodeService;
  }

  /**
   * POST /api/properties/:id/buy
   */
  async buyTokens(req, res) {
    try {
      const { id: propertyId } = req.params;
      const { quantity, buyerAccountId } = req.body;

      // Validation
      if (!quantity || quantity < MIN_PURCHASE_QUANTITY || quantity > MAX_PURCHASE_QUANTITY) {
        return errorResponse(res, `Quantity must be between ${MIN_PURCHASE_QUANTITY} and ${MAX_PURCHASE_QUANTITY}`, 400);
      }

      if (!buyerAccountId) {
        return errorResponse(res, 'Buyer account ID is required', 400);
      }

      // Get property and token info
      const property = await this.propertyModel.findById(propertyId);
      if (!property) {
        return errorResponse(res, 'Property not found', 404);
      }

      if (!property.tokenId) {
        return errorResponse(res, 'Property not tokenized', 400);
      }

      // Execute purchase
      const result = await this.purchaseService.completePurchase(
        propertyId,
        property.tokenId,
        buyerAccountId,
        parseInt(quantity),
        property.pricePerToken || 100 // Default price
      );

      // Fetch updated balances from mirror node
      const balances = await this.mirrorNodeService.getTokenBalances(property.tokenId);

      logger.info(`Purchase completed: ${result.hederaTxId}`);

      return successResponse(res, {
        message: 'Purchase completed successfully',
        sale: result,
        balances
      }, 201);

    } catch (error) {
      logger.error('Purchase error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/sales/:id
   */
  async getSaleDetails(req, res) {
    try {
      const { id: saleId } = req.params;
      const sale = await this.purchaseService.saleModel.findById(saleId);

      if (!sale) {
        return errorResponse(res, 'Sale not found', 404);
      }

      return successResponse(res, sale);
    } catch (error) {
      logger.error('Get sale error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default PurchaseController;