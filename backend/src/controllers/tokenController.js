import tokenService from '../services/tokenService.js';
import validateUtil from '../utils/validateUtil.js';
import * as responseUtil from '../utils/responseUtil.js';
import errorUtil from '../utils/errorUtil.js';
import logger from '../config/logger.js';

/**
 * src/controllers/tokenController.js
 *
 * Controller now relies on tokenService for token operations (no local tokenModel usage).
 */

async function createToken(req, res) {
    try {
        // expected body: { propertyId, name, symbol, initialSupply, decimals, treasuryAccountId?, treasuryPrivateKey? }
        const payload = {
            propertyId: req.body.propertyId,
            name: req.body.name,
            symbol: req.body.symbol,
            initialSupply: req.body.initialSupply,
            decimals: req.body.decimals ?? 0,
            treasuryAccountId: req.body.treasuryAccountId,
            treasuryPrivateKey: req.body.treasuryPrivateKey
        };

        const missing = validateUtil.required(['propertyId', 'name', 'symbol', 'initialSupply'], payload);
        if (missing.length) {
            return responseUtil.errorResponse(res, 'Validation error', 400, { missing });
        }

        // Delegate creation to tokenService (which updates property record)
        const result = await tokenService.createToken(payload);

        if (result.alreadyTokenized) {
            return responseUtil.successResponse(res, { message: 'Property already tokenized', property: result.property }, 200);
        }

        // result contains tokenId, totalSupply, treasury, metadata, property, etc.
        return responseUtil.successResponse(res, { token: {
            tokenId: result.tokenId,
            totalSupply: result.totalSupply,
            treasury: result.treasury,
            metadata: result.metadata
        }, property: result.property, message: 'Token created' }, 201);
    } catch (err) {
        logger.error('createToken error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
    }
}

async function getToken(req, res) {
    try {
        // Using propertyId (service resolves tokenId via propertyModel)
        const propertyId = req.params.id;
        if (!propertyId) return responseUtil.errorResponse(res, 'property id required', 400);

        const info = await tokenService.getTokenInfo(propertyId);
        return responseUtil.successResponse(res, { propertyId, chainInfo: info });
    } catch (err) {
        logger.error('getToken error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
    }
}

async function listTokens(req, res) {
    try {
        // Return token info for a single property (expecting ?id= or ?propertyId=)
        const propertyId = req.query.id || req.query.propertyId;
        if (!propertyId) {
            return responseUtil.errorResponse(res, 'property id required as query param "id" or "propertyId"', 400);
        }

        const info = await tokenService.getTokenInfo(propertyId);
        return responseUtil.successResponse(res, { propertyId, chainInfo: info });
    } catch (err) {
        logger.error('listTokens error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
    }
}

async function mintToken(req, res) {
    try {
        const propertyId = req.params.id;
        const { amount, treasuryAccountId, treasuryPrivateKey } = req.body;
        if (!propertyId || amount == null) return responseUtil.errorResponse(res, 'property id and amount are required', 400);

        // Mint on Hedera via service (service will use property's treasury if not provided)
        const tx = await tokenService.mint(propertyId, amount, { treasuryAccountId, treasuryPrivateKey });

        return responseUtil.successResponse(res, { propertyId, amount, tx, message: 'Mint successful' });
    } catch (err) {
        logger.error('mintToken error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
    }
}

async function burnToken(req, res) {
    try {
        const propertyId = req.params.id;
        const { amount, treasuryAccountId, treasuryPrivateKey } = req.body;
        if (!propertyId || amount == null) return responseUtil.errorResponse(res, 'property id and amount are required', 400);

        const tx = await tokenService.burn(propertyId, amount, { treasuryAccountId, treasuryPrivateKey });

        return responseUtil.successResponse(res, { propertyId, amount, tx, message: 'Burn successful' });
    } catch (err) {
        logger.error('burnToken error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
    }
}

async function transferToken(req, res) {
    try {
        const propertyId = req.params.id;
        const { toAccountId, amount, memo, treasuryAccountId, treasuryPrivateKey } = req.body;

        console.log('transferToken called. params:', { propertyId });
        console.log('transferToken body:', { toAccountId, amount, memo, treasuryAccountId, hasTreasuryPrivateKey: !!treasuryPrivateKey });

        if (!propertyId || !toAccountId || amount == null) {
            return responseUtil.errorResponse(res, 'Missing required fields: propertyId, toAccountId, and amount are required', 400);
        }

        if (!treasuryAccountId || !treasuryPrivateKey) {
            return responseUtil.errorResponse(res, 'Treasury account credentials are required', 400);
        }

        // verify tokenized property
        const property = await tokenService.getTokenInfo(propertyId);
        if (!property || !property.tokenId) {
            return responseUtil.errorResponse(res, 'Property not found or not tokenized', 404);
        }

        try {
            const tx = await tokenService.transfer(propertyId, toAccountId, Number(amount), {
                treasuryAccountId,
                treasuryPrivateKey: String(treasuryPrivateKey), // ensure string
                memo
            });

            console.log('Transfer successful:', { transactionId: tx?.transactionId, propertyId, amount });
            return responseUtil.successResponse(res, {
                propertyId,
                toAccountId,
                amount,
                tx,
                message: 'Token transfer successful'
            });
        } catch (serviceErr) {
            // Log full Hedera error object for debugging
            logger.error('tokenService.transfer failed', { message: serviceErr?.message, stack: serviceErr?.stack, original: serviceErr });
            // return the detailed error back to client (safe for dev; remove sensitive details in prod)
            const formatted = errorUtil.format(serviceErr);
            return responseUtil.errorResponse(
                res,
                formatted.message || 'Token transfer failed',
                formatted.status || 500,
                { ...formatted, originalError: serviceErr }
            );
        }
    } catch (err) {
        logger.error('transferToken error', err);
        const formatted = errorUtil.format(err);
        return responseUtil.errorResponse(res, formatted.message, formatted.status || 500, formatted);
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
