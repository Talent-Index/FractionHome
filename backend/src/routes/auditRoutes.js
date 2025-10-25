const express = require('express');
const router = express.Router();

module.exports = (auditController) => {
  /**
   * GET /api/audit/topic/:topicId
   * Get all messages from an HCS topic
   */
  router.get('/topic/:topicId', (req, res) => 
    auditController.getTopicMessages(req, res)
  );

  /**
   * GET /api/audit/property/:propertyId
   * Get complete audit trail for a property
   */
  router.get('/property/:propertyId', (req, res) => 
    auditController.getPropertyAuditTrail(req, res)
  );

  /**
   * GET /api/audit/token/:tokenId
   * Get complete audit trail for a token
   */
  router.get('/token/:tokenId', (req, res) => 
    auditController.getTokenAuditTrail(req, res)
  );

  /**
   * POST /api/audit/invalidate
   * Manually invalidate cache
   */
  router.post('/invalidate', (req, res) => 
    auditController.invalidateCache(req, res)
  );

  return router;
};