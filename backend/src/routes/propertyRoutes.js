// src/routes/propertyRoutes.js
const express = require('express');
const multer = require('multer');

// Controllers
const propertyController = require('../controllers/propertyController');
const tokenController = require('../controllers/tokenController');
const holderController = require('../controllers/holderController');

// Middleware for file uploads (in-memory for MVP)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Property Routes Factory
 * Accepts purchaseController to support buy/transfer logic (even if not all routes use it yet)
 */
module.exports = (purchaseController) => {
  const router = express.Router();

  // ─── Step 1: Property Upload ───────────────────────────────
  /**
   * POST /api/properties/upload
   * Upload property metadata + image → store image on IPFS, metadata locally
   */
  router.post(
    '/upload',
    upload.single('image'), // expects <input name="image" />
    propertyController.uploadProperty
  );

  // ─── Step 2: Tokenization ──────────────────────────────────
  /**
   * POST /api/properties/:id/tokenize
   * Create HTS token representing property shares
   */
  router.post(
    '/:id/tokenize',
    tokenController.tokenizeProperty
  );

  // ─── Step 3: Buy Tokens (Simulated Purchase) ────────────────
  /**
   * POST /api/properties/:id/buy
   * Transfer tokens from treasury to investor (simulated purchase)
   */
  router.post(
    '/:id/buy',
    purchaseController.buyProperty // uses injected controller
  );

  // ─── Step 4: Ownership Dashboard ───────────────────────────
  /**
   * GET /api/properties/:id/holders
   * Fetch token holders & balances from Hedera Mirror Node
   */
  router.get(
    '/:id/holders',
    holderController.getPropertyHolders
  );

  // ─── Utility: Get Property Details ─────────────────────────
  /**
   * GET /api/properties/:id
   * Retrieve full property info (metadata, token ID, etc.)
   */
  router.get(
    '/:id',
    propertyController.getPropertyById
  );

  // ─── Optional: List All Properties ─────────────────────────
  /**
   * GET /api/properties
   * List all uploaded properties (for demo UI)
   */
  router.get(
    '/',
    propertyController.listProperties
  );

  return router;
};