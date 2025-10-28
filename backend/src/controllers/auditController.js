import mirrorNodeService from '../services/mirrorNodeService.js';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import logger from '../config/logger.js';

class AuditController {
  constructor(hcsModel) {
    this.hcsModel = hcsModel;
  }

  /**
   * GET /api/audit/topic/:topicId
   * Get all messages from an HCS topic
   */
  async getTopicMessages(req, res) {
    try {
      const { topicId } = req.params;
      const { limit = 25, useCache = 'true' } = req.query;

      const messages = await mirrorNodeService.getTopicMessages(
        topicId,
        parseInt(limit),
        useCache === 'true'
      );

      return successResponse(res, {
        topicId,
        messageCount: messages.length,
        messages,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get topic messages error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/audit/property/:propertyId
   * Get all audit events for a property
   */
  async getPropertyAuditTrail(req, res) {
    try {
      const { propertyId } = req.params;
      const { useCache = 'true' } = req.query;

      // Get property's HCS topic from database
      const hcsRecord = await this.hcsModel.findByPropertyId(propertyId);
      if (!hcsRecord || !hcsRecord.topicId) {
        return errorResponse(res, 'No audit topic found for this property', 404);
      }

      // Fetch messages from mirror node
      const messages = await mirrorNodeService.getTopicMessages(
        hcsRecord.topicId,
        100,
        useCache === 'true'
      );

      // Filter messages related to this property
      const propertyMessages = messages.filter(msg => {
        try {
          return msg.message.propertyId === propertyId;
        } catch (e) {
          return false;
        }
      });

      return successResponse(res, {
        propertyId,
        topicId: hcsRecord.topicId,
        auditTrail: propertyMessages,
        totalEvents: propertyMessages.length,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get property audit trail error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * GET /api/audit/token/:tokenId
   * Get all events related to a token
   */
  async getTokenAuditTrail(req, res) {
    try {
      const { tokenId } = req.params;
      const { useCache = 'true' } = req.query;

      // Get both transfers and HCS messages
      const [transfers, hcsRecord] = await Promise.all([
        mirrorNodeService.getTokenTransfers(tokenId, 50, useCache === 'true'),
        this.hcsModel.findByTokenId(tokenId)
      ]);

      let hcsMessages = [];
      if (hcsRecord && hcsRecord.topicId) {
        const messages = await mirrorNodeService.getTopicMessages(
          hcsRecord.topicId,
          50,
          useCache === 'true'
        );

        hcsMessages = messages.filter(msg => {
          try {
            return msg.message.tokenId === tokenId;
          } catch (e) {
            return false;
          }
        });
      }

      return successResponse(res, {
        tokenId,
        auditTrail: {
          transfers: transfers,
          hcsMessages: hcsMessages
        },
        totalTransfers: transfers.length,
        totalMessages: hcsMessages.length,
        cached: useCache === 'true'
      });
    } catch (error) {
      logger.error('Get token audit trail error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * POST /api/audit/invalidate
   * Manually invalidate cache (admin only)
   */
  async invalidateCache(req, res) {
    try {
      const { tokenId, topicId } = req.body;

      if (tokenId) {
        mirrorNodeService.invalidateCacheForToken(tokenId);
      }

      if (topicId) {
        mirrorNodeService.invalidateCacheForTopic(topicId);
      }

      if (!tokenId && !topicId) {
        cacheService.clear();
      }

      return successResponse(res, {
        message: 'Cache invalidated successfully',
        tokenId,
        topicId
      });
    } catch (error) {
      logger.error('Invalidate cache error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default AuditController;