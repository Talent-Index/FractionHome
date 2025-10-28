import tokenService from '../services/tokenService.js';
import tokenModel from '../models/tokenModel.js';
import validateUtil from '../utils/validateUtil.js';
import responseUtil from '../utils/responseUtil.js';
import errorUtil from '../utils/errorUtil.js';
import logger from '../config/logger.js';

/**
 * src/controllers/tokenController.js
 *
 * Logical flow and interface for tokenController used by the Hedera dApp.
 *
 * Example usage (routes/tokenRoutes.js):
 * import express from 'express';
 * const router = express.Router();
 * import tokenController from '../controllers/tokenController.js';
 *
 * router.post('/tokenize', tokenController.createToken);           // create HTS token
 * router.get('/token/:id', tokenController.getToken);              // get token record
 * router.get('/tokens', tokenController.listTokens);               // list saved tokens
 * router.post('/token/:id/mint', tokenController.mintToken);       // mint more tokens
 * router.post('/token/:id/burn', tokenController.burnToken);       // burn tokens
 * router.post('/token/:id/transfer', tokenController.transferToken); // transfer tokens
 *
 * The controller delegates Hedera interactions to services/tokenService.js
 * and persists a lightweight token record via models/tokenModel.js.
 */


async function createToken(req, res) {
    try {
        // expected body: { propertyId, name, symbol, initialSupply, decimals, treasuryAccountId? }
        const payload = {
            propertyId: req.body.propertyId,
            name: req.body.name,
            symbol: req.body.symbol,
            initialSupply: req.body.initialSupply,
            decimals: req.body.decimals ?? 0,
            treasuryAccountId: req.body.treasuryAccountId
        };

        const missing = validateUtil.required(['propertyId', 'name', 'symbol', 'initialSupply'], payload);
        if (missing.length) {
            return res.status(400).json(responseUtil.error('Validation error', { missing }));
        }

        // Create HTS token on Hedera
        const tokenInfo = await tokenService.createToken(payload);
        // Persist token metadata locally (tokenId, propertyId, treasury, metadata)
        const saved = await tokenModel.create({
            tokenId: tokenInfo.tokenId,
            propertyId: payload.propertyId,
            name: payload.name,
            symbol: payload.symbol,
            decimals: payload.decimals,
            totalSupply: tokenInfo.totalSupply,
            treasury: tokenInfo.treasury,
            metadata: tokenInfo.metadata || {}
        });

        return res.status(201).json(responseUtil.success(saved, 'Token created'));
    } catch (err) {
        logger.error('createToken error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

async function getToken(req, res) {
    try {
        const tokenId = req.params.id;
        if (!tokenId) return res.status(400).json(responseUtil.error('token id required'));

        // Try local DB first
        let record = await tokenModel.findByTokenId(tokenId);
        // Optionally refresh from chain if not found or query param ?refresh=true
        if (!record || req.query.refresh === 'true') {
            const chainInfo = await tokenService.getTokenInfo(tokenId);
            record = record ? Object.assign(record, { chainInfo }) : { tokenId, chainInfo };
        }

        if (!record) return res.status(404).json(responseUtil.error('Token not found'));

        return res.json(responseUtil.success(record));
    } catch (err) {
        logger.error('getToken error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

async function listTokens(req, res) {
    try {
        const list = await tokenModel.listAll(req.query || {});
        return res.json(responseUtil.success(list));
    } catch (err) {
        logger.error('listTokens error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

async function mintToken(req, res) {
    try {
        const tokenId = req.params.id;
        const { amount } = req.body;
        if (!tokenId || !amount) return res.status(400).json(responseUtil.error('token id and amount are required'));

        // Mint on Hedera
        const tx = await tokenService.mint(tokenId, amount);
        // Update local record totalSupply if present
        await tokenModel.incrementSupply(tokenId, amount);

        return res.json(responseUtil.success({ tokenId, amount, tx }, 'Mint successful'));
    } catch (err) {
        logger.error('mintToken error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

async function burnToken(req, res) {
    try {
        const tokenId = req.params.id;
        const { amount } = req.body;
        if (!tokenId || !amount) return res.status(400).json(responseUtil.error('token id and amount are required'));

        const tx = await tokenService.burn(tokenId, amount);
        await tokenModel.decrementSupply(tokenId, amount);

        return res.json(responseUtil.success({ tokenId, amount, tx }, 'Burn successful'));
    } catch (err) {
        logger.error('burnToken error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

async function transferToken(req, res) {
    try {
        const tokenId = req.params.id;
        const { toAccountId, amount, memo } = req.body;
        if (!tokenId || !toAccountId || !amount) return res.status(400).json(responseUtil.error('token id, toAccountId and amount are required'));

        const tx = await tokenService.transfer(tokenId, toAccountId, amount, { memo });

        return res.json(responseUtil.success({ tokenId, toAccountId, amount, tx }, 'Transfer submitted'));
    } catch (err) {
        logger.error('transferToken error', err);
        const formatted = errorUtil.format(err);
        return res.status(formatted.status || 500).json(responseUtil.error(formatted.message, formatted));
    }
}

export {
    createToken,
    getToken,
    listTokens,
    mintToken,
    burnToken,
    transferToken
};
