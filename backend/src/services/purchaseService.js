import { TransferTransaction, TokenId, AccountId, PrivateKey } from '@hashgraph/sdk';
import logger from '../config/logger.js';
import mirrorNodeService from './mirrorNodeService.js';
import constants from '../utils/constants.js';


const { SALE_STATUS } = constants;

class PurchaseService {
  constructor(hederaClient, saleModel, hcsService, tokenModel) {
    this.client = hederaClient;
    this.saleModel = saleModel;
    this.hcsService = hcsService;
    this.tokenModel = tokenModel;
  }

  /**
   * Simulate payment verification (always returns true for MVP)
   */
  async simulatePayment(amount, currency = 'USD') {
    logger.info(`Simulating payment: ${amount} ${currency}`);
    // In production: integrate Stripe, PayPal, crypto payment gateway
    await new Promise(resolve => setTimeout(resolve, 500)); // Fake delay
    return { success: true, transactionId: `SIM-${Date.now()}` };
  }

  /**
   * Execute token transfer from treasury to buyer
   */
  async transferTokens(tokenId, treasuryKey, buyerAccountId, quantity) {
    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, this.client.operatorAccountId, -quantity)
        .addTokenTransfer(tokenId, buyerAccountId, quantity)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(PrivateKey.fromString(treasuryKey));
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      logger.info(`Token transfer successful: ${txResponse.transactionId.toString()}`);
      
      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      logger.error('Token transfer failed:', error);
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  /**
   * Complete purchase flow
   */
  async completePurchase(propertyId, tokenId, buyerAccountId, quantity, pricePerToken) {
    const totalPrice = quantity * pricePerToken;
    
    // Step 1: Create pending sale record
    const sale = await this.saleModel.create({
      propertyId,
      tokenId,
      buyerAccountId,
      quantity,
      pricePerToken,
      totalPrice,
      status: SALE_STATUS.PENDING
    });

    try {
      // Step 2: Simulate payment
      const paymentResult = await this.simulatePayment(totalPrice);
      if (!paymentResult.success) {
        throw new Error('Payment simulation failed');
      }

      // Step 3: Get token treasury key
      const token = await this.tokenModel.findByTokenId(tokenId);
      if (!token || !token.treasuryKey) {
        throw new Error('Token treasury key not found');
      }

      // Step 4: Execute Hedera token transfer
      const transferResult = await this.transferTokens(
        tokenId,
        token.treasuryKey,
        buyerAccountId,
        quantity
      );

      // Step 5: Log to HCS
      const hcsMessage = {
        type: 'TOKEN_SALE',
        propertyId,
        tokenId,
        buyerAccountId,
        quantity,
        pricePerToken,
        totalPrice,
        hederaTxId: transferResult.transactionId,
        timestamp: new Date().toISOString()
      };
      
      const hcsMessageId = await this.hcsService.submitMessage(hcsMessage);

      // Step 6: Update sale record
      await this.saleModel.updateStatus(
        sale.id,
        SALE_STATUS.COMPLETED,
        transferResult.transactionId,
        hcsMessageId
      );

      // Step 7: Invalidate cache after successful purchase
      mirrorNodeService.invalidateCacheForToken(tokenId);
      if (token.hcsTopicId) {
        mirrorNodeService.invalidateCacheForTopic(token.hcsTopicId);
      }

      return {
        saleId: sale.id,
        hederaTxId: transferResult.transactionId,
        hcsMessageId,
        quantity,
        totalPrice,
        buyerAccountId
      };

    } catch (error) {
      // Mark sale as failed
      await this.saleModel.updateStatus(sale.id, SALE_STATUS.FAILED);
      logger.error('Purchase failed:', error);
      throw error;
    }
  }
}

export default PurchaseService;