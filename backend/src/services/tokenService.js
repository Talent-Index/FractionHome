import HederaClient from '../config/hederaClient.js';
import logger from '../config/logger.js';
import PropertyModel from '../models/propertyModel.js';

import {
    TokenCreateTransaction,
    TokenInfoQuery,
    TokenMintTransaction,
    TokenBurnTransaction,
    TransferTransaction,
    TokenId,
    AccountId,
    PrivateKey,
} from '@hashgraph/sdk';

// Optional: keep global fallback (remove if you always require explicit treasury)
const GLOBAL_TREASURY_ACCOUNT_ID = process.env.TREASURY_ACCOUNT_ID || null;
const GLOBAL_TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY
    ? PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY)
    : null;

const hederaClient = new HederaClient();
const propertyModel = new PropertyModel();

function _requireClient() {
    if (!hederaClient) throw new Error('Hedera client not configured');
    const client = hederaClient.getClient();
    if (!client) throw new Error('Hedera SDK client not initialized properly');
    return client;
}

/**
 * Resolve treasury account and key.
 * Priority: explicit params > global env (if enabled).
 * Throws if insufficient info.
 */
function _resolveTreasury(treasuryAccountId, treasuryPrivateKey, operationName) {
    let acct = treasuryAccountId;
    let key = treasuryPrivateKey;

    // If not provided explicitly, fall back to global (optional — remove if strict mode desired)
    if (!acct && GLOBAL_TREASURY_ACCOUNT_ID) {
        acct = GLOBAL_TREASURY_ACCOUNT_ID;
        key = key || GLOBAL_TREASURY_PRIVATE_KEY;
    }

    if (!acct) {
        throw new Error(
            `Treasury account ID required for ${operationName}. Provide treasuryAccountId explicitly or set TREASURY_ACCOUNT_ID.`
        );
    }

    // Parse account ID if string
    if (typeof acct === 'string') {
        acct = AccountId.fromString(acct);
    }

    // Parse private key if string
    if (typeof key === 'string') {
        key = PrivateKey.fromString(key);
    }

    return { treasuryAccountId: acct, treasuryPrivateKey: key };
}

// ───────────────────────────────────────────────────────────────
// Public Service Methods
// ───────────────────────────────────────────────────────────────

/**
 * Create an HTS token.
 * If the property already has treasuryId and treasuryKey, the property is considered tokenized.
 * This function will:
 *  - check the property record by propertyId
 *  - if already tokenized, return early indicating so
 *  - otherwise create the token and update the property record with treasury / token details
 *
 * @param {Object} payload
 * @param {string} payload.propertyId
 * @param {string} payload.name
 * @param {string} payload.symbol
 * @param {number} payload.initialSupply
 * @param {number} [payload.decimals=0]
 * @param {string|AccountId} [payload.treasuryAccountId] - Optional if global env set
 * @param {string|PrivateKey} [payload.treasuryPrivateKey]
 */
async function createToken(payload = {}) {
    const client = _requireClient();

    const {
        propertyId,
        name,
        symbol,
        initialSupply,
        decimals = 0,
        treasuryAccountId,
        treasuryPrivateKey,
    } = payload;

    if (!propertyId || !name || !symbol || initialSupply == null) {
        throw new Error('Missing required fields: propertyId, name, symbol, initialSupply');
    }

    // Ensure property exists
    const property = propertyModel.getPropertyById(propertyId);
    if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
    }

    // If property already has treasuryId and treasuryKey, treat as already tokenized
    if (property.treasuryId && property.treasuryKey) {
        logger.info(`Property ${propertyId} already tokenized: treasury=${property.treasuryId}, tokenId=${property.tokenId || 'N/A'}`);
        return {
            alreadyTokenized: true,
            property,
        };
    }

    const { treasuryAccountId: resolvedAcct, treasuryPrivateKey: resolvedKey } = _resolveTreasury(
        treasuryAccountId,
        treasuryPrivateKey,
        'token creation'
    );

    try {
        const tx = new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setDecimals(decimals)
            .setInitialSupply(initialSupply)
            .setTreasuryAccountId(resolvedAcct)
            .freezeWith(client);

        if (resolvedKey) {
            tx.sign(resolvedKey);
        }

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);
        const tokenId = receipt.tokenId?.toString() || null;
        const status = receipt.status?.toString() || null;

        logger.info(`Token created: tokenId=${tokenId}, status=${status}, treasury=${resolvedAcct.toString()}`);

        // Update property record with treasury & token info
        const updates = {
            treasuryId: resolvedAcct.toString(),
            // write treasuryKey if we have it (string form), otherwise null
            treasuryKey: resolvedKey ? resolvedKey.toString() : null,
            tokenId,
            tokenInitialSupply: initialSupply,
            tokenCreatedAt: new Date().toISOString(),
        };

        const updatedProperty = propertyModel.updateProperty(propertyId, updates);

        return {
            tokenId,
            totalSupply: initialSupply,
            treasury: resolvedAcct.toString(),
            metadata: { propertyId, name, symbol, decimals },
            receipt: { status },
            property: updatedProperty,
        };
    } catch (err) {
        logger.error('createToken error:', err);
        throw err;
    }
}

/**
 * Get token info from Hedera.
 */
async function getTokenInfo(propertyId) {
    if (!propertyId) throw new Error('propertyId is required');
    // Resolve property and tokenId from propertyModel
    const property = propertyModel.getPropertyById(propertyId);
    if (!property) throw new Error(`Property not found: ${propertyId}`);
    if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

    const client = _requireClient();
    try {
        const query = new TokenInfoQuery().setTokenId(TokenId.fromString(property.tokenId));
        const info = await query.execute(client);
        return info;
    } catch (err) {
        logger.error('getTokenInfo error:', err);
        throw err;
    }
}

/**
 * Mint tokens.
 * @param {string} tokenId
 * @param {number} amount
 * @param {Object} opts
 * @param {string|AccountId} opts.treasuryAccountId - Required
 * @param {string|PrivateKey} [opts.treasuryPrivateKey]
 */
async function mint(propertyId, amount, opts = {}) {
    const client = _requireClient();
    if (!propertyId) throw new Error('propertyId is required');
    if (amount == null) throw new Error('amount is required');

    // Resolve property -> tokenId and default treasury from property if not provided
    const property = propertyModel.getPropertyById(propertyId);
    if (!property) throw new Error(`Property not found: ${propertyId}`);
    if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

    const { treasuryAccountId = property.treasuryId, treasuryPrivateKey = property.treasuryKey } = opts;
    const { treasuryAccountId: resolvedAcct, treasuryPrivateKey: resolvedKey } = _resolveTreasury(
        treasuryAccountId,
        treasuryPrivateKey,
        'minting'
    );

    try {
        const tx = new TokenMintTransaction()
            .setTokenId(TokenId.fromString(property.tokenId))
            .setAmount(amount)
            .freezeWith(client);

        if (resolvedKey) {
            tx.sign(resolvedKey);
        }

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);
        const txId = response.transactionId.toString();
        const status = receipt.status?.toString() || null;

        logger.info(`Mint: property=${propertyId}, token=${property.tokenId}, amount=${amount}, tx=${txId}, status=${status}`);
        return { txId, status };
    } catch (err) {
        logger.error('mint error:', err);
        throw err;
    }
}

/**
 * Burn tokens by propertyId.
 * @param {string} propertyId
 * @param {number} amount
 * @param {Object} opts
 * @param {string|AccountId} opts.treasuryAccountId - Optional, falls back to property's treasuryId
 * @param {string|PrivateKey} [opts.treasuryPrivateKey] - Optional, falls back to property's treasuryKey
 */
async function burn(propertyId, amount, opts = {}) {
    const client = _requireClient();
    if (!propertyId) throw new Error('propertyId is required');
    if (amount == null) throw new Error('amount is required');

    const property = propertyModel.getPropertyById(propertyId);
    if (!property) throw new Error(`Property not found: ${propertyId}`);
    if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

    const { treasuryAccountId = property.treasuryId, treasuryPrivateKey = property.treasuryKey } = opts;
    const { treasuryAccountId: resolvedAcct, treasuryPrivateKey: resolvedKey } = _resolveTreasury(
        treasuryAccountId,
        treasuryPrivateKey,
        'burning'
    );

    try {
        const tx = new TokenBurnTransaction()
            .setTokenId(TokenId.fromString(property.tokenId))
            .setAmount(amount)
            .freezeWith(client);

        if (resolvedKey) {
            tx.sign(resolvedKey);
        }

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);
        const txId = response.transactionId.toString();
        const status = receipt.status?.toString() || null;

        logger.info(`Burn: property=${propertyId}, token=${property.tokenId}, amount=${amount}, tx=${txId}, status=${status}`);
        return { txId, status };
    } catch (err) {
        logger.error('burn error:', err);
        throw err;
    }
}

/**
 * Transfer tokens from property's treasury to another account.
 * @param {string} propertyId
 * @param {string|AccountId} toAccountId
 * @param {number} amount
 * @param {Object} opts
 * @param {string|AccountId} [opts.treasuryAccountId] - Optional, falls back to property's treasuryId
 * @param {string|PrivateKey} [opts.treasuryPrivateKey] - Optional, falls back to property's treasuryKey
 * @param {string} [opts.memo]
 */
async function transfer(propertyId, toAccountId, amount, opts = {}) {
    const client = _requireClient();
    if (!propertyId) throw new Error('propertyId is required');
    if (!toAccountId) throw new Error('toAccountId is required');
    if (amount == null) throw new Error('amount is required');

    const property = propertyModel.getPropertyById(propertyId);
    if (!property) throw new Error(`Property not found: ${propertyId}`);
    if (!property.tokenId) throw new Error(`Property ${propertyId} is not tokenized (missing tokenId)`);

    const { memo } = opts;

    // Resolve treasury from opts, property, or global env
    const { treasuryAccountId: resolvedAcct, treasuryPrivateKey: resolvedKey } = _resolveTreasury(
        opts.treasuryAccountId || property.treasuryId,
        opts.treasuryPrivateKey || property.treasuryKey,
        'transfer'
    );

    try {
        const fromAccount = typeof resolvedAcct === 'string' ? AccountId.fromString(resolvedAcct) : resolvedAcct;
        const toAccount = typeof toAccountId === 'string' ? AccountId.fromString(toAccountId) : toAccountId;

        let tx = new TransferTransaction()
            .addTokenTransfer(TokenId.fromString(property.tokenId), fromAccount, -Math.abs(Number(amount)))
            .addTokenTransfer(TokenId.fromString(property.tokenId), toAccount, Math.abs(Number(amount)));

        if (memo) tx.setTransactionMemo(memo);

        // Must freeze the transaction before signing
        tx = tx.freezeWith(client);

        if (resolvedKey) {
            const signingKey = typeof resolvedKey === 'string' ? PrivateKey.fromString(resolvedKey) : resolvedKey;
            tx.sign(signingKey);
        }

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);
        const txId = response.transactionId.toString();
        const status = receipt.status?.toString() || null;

        logger.info(`Transfer: property=${propertyId}, token=${property.tokenId}, to=${toAccountId}, amount=${amount}, tx=${txId}, status=${status}`);
        return { txId, status };
    } catch (err) {
        logger.error('transfer error:', err);
        throw err;
    }
}

export default {
    createToken,
    getTokenInfo,
    mint,
    burn,
    transfer,
};