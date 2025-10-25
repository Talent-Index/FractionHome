const fetch = require('node-fetch');
const mirrorNodeConfig = require('../config/mirrorNode');
const cacheService = require('./cacheService');
const logger = require('../config/logger');
const { CACHE_TTL, CACHE_KEYS, MIRROR_NODE } = require('../utils/constants');

class MirrorNodeService {
    constructor() {
        this.baseUrl = mirrorNodeConfig.baseUrl;
        this.timeout = mirrorNodeConfig.timeout;
        this.retryAttempts = mirrorNodeConfig.retryAttempts;
        this.retryDelay = mirrorNodeConfig.retryDelay;
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, options = {}, retries = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Mirror node returned ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (retries < this.retryAttempts) {
                logger.warn(`Mirror node request failed, retrying (${retries + 1}/${this.retryAttempts})...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.makeRequest(url, options, retries + 1);
            }

            logger.error(`Mirror node request failed after ${this.retryAttempts} attempts:`, error);
            throw error;
        }
    }

    /**
     * Get token balances for a specific token
     * @param {string} tokenId - Token ID (e.g., "0.0.12345")
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Array of balance objects
     */
    async getTokenBalances(tokenId, useCache = true) {
        const cacheKey = cacheService.constructor.buildKey(CACHE_KEYS.TOKEN_BALANCES, tokenId);

        // Check cache
        if (useCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = `${this.baseUrl}/api/v1/tokens/${tokenId}/balances?limit=${MIRROR_NODE.MAX_LIMIT}`;
            logger.info(`Fetching token balances: ${tokenId}`);
            
            const data = await this.makeRequest(url);
            
            const balances = (data.balances || []).map(b => ({
                accountId: b.account,
                balance: parseInt(b.balance),
                decimals: data.decimals || 0
            }));

            // Cache the result
            cacheService.set(cacheKey, balances, CACHE_TTL.TOKEN_BALANCES);

            return balances;
        } catch (error) {
            logger.error(`Failed to fetch token balances for ${tokenId}:`, error);
            throw new Error(`Failed to fetch token balances: ${error.message}`);
        }
    }

    /**
     * Get token transfer history
     * @param {string} tokenId - Token ID
     * @param {number} limit - Number of transfers to fetch
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Array of transfer objects
     */
    async getTokenTransfers(tokenId, limit = MIRROR_NODE.DEFAULT_LIMIT, useCache = true) {
        const cacheKey = cacheService.constructor.buildKey(CACHE_KEYS.TOKEN_TRANSFERS, tokenId, limit);

        // Check cache
        if (useCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = `${this.baseUrl}/api/v1/tokens/${tokenId}/transactions?limit=${limit}&order=desc`;
            logger.info(`Fetching token transfers: ${tokenId}`);
            
            const data = await this.makeRequest(url);
            
            const transfers = (data.transactions || []).map(tx => ({
                transactionId: tx.transaction_id,
                consensusTimestamp: tx.consensus_timestamp,
                type: tx.name,
                transfers: (tx.token_transfers || [])
                    .filter(t => t.token_id === tokenId)
                    .map(t => ({
                        accountId: t.account,
                        amount: parseInt(t.amount)
                    })),
                result: tx.result,
                memo: tx.memo_base64 ? Buffer.from(tx.memo_base64, 'base64').toString('utf8') : null
            }));

            // Cache the result
            cacheService.set(cacheKey, transfers, CACHE_TTL.TOKEN_TRANSFERS);

            return transfers;
        } catch (error) {
            logger.error(`Failed to fetch token transfers for ${tokenId}:`, error);
            throw new Error(`Failed to fetch token transfers: ${error.message}`);
        }
    }

    /**
     * Get HCS topic messages
     * @param {string} topicId - Topic ID
     * @param {number} limit - Number of messages to fetch
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Array of message objects
     */
    async getTopicMessages(topicId, limit = MIRROR_NODE.DEFAULT_LIMIT, useCache = true) {
        const cacheKey = cacheService.constructor.buildKey(CACHE_KEYS.TOPIC_MESSAGES, topicId, limit);

        // Check cache
        if (useCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = `${this.baseUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`;
            logger.info(`Fetching topic messages: ${topicId}`);
            
            const data = await this.makeRequest(url);
            
            const messages = (data.messages || []).map(msg => {
                let parsedMessage = null;
                try {
                    const decoded = Buffer.from(msg.message, 'base64').toString('utf8');
                    parsedMessage = JSON.parse(decoded);
                } catch (e) {
                    parsedMessage = msg.message; // Keep as base64 if not JSON
                }

                return {
                    consensusTimestamp: msg.consensus_timestamp,
                    sequenceNumber: msg.sequence_number,
                    message: parsedMessage,
                    runningHash: msg.running_hash,
                    runningHashVersion: msg.running_hash_version
                };
            });

            // Cache the result
            cacheService.set(cacheKey, messages, CACHE_TTL.TOPIC_MESSAGES);

            return messages;
        } catch (error) {
            logger.error(`Failed to fetch topic messages for ${topicId}:`, error);
            throw new Error(`Failed to fetch topic messages: ${error.message}`);
        }
    }

    /**
     * Get account token balances
     * @param {string} accountId - Account ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Array of token balance objects
     */
    async getAccountTokenBalances(accountId, useCache = true) {
        const cacheKey = cacheService.constructor.buildKey(CACHE_KEYS.ACCOUNT_INFO, accountId, 'tokens');

        // Check cache
        if (useCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = `${this.baseUrl}/api/v1/accounts/${accountId}/tokens?limit=${MIRROR_NODE.MAX_LIMIT}`;
            logger.info(`Fetching account token balances: ${accountId}`);
            
            const data = await this.makeRequest(url);
            
            const tokens = (data.tokens || []).map(t => ({
                tokenId: t.token_id,
                balance: parseInt(t.balance),
                decimals: t.decimals || 0
            }));

            // Cache the result
            cacheService.set(cacheKey, tokens, CACHE_TTL.ACCOUNT_INFO);

            return tokens;
        } catch (error) {
            logger.error(`Failed to fetch account token balances for ${accountId}:`, error);
            throw new Error(`Failed to fetch account token balances: ${error.message}`);
        }
    }

    /**
     * Get token information
     * @param {string} tokenId - Token ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Token info object
     */
    async getTokenInfo(tokenId, useCache = true) {
        const cacheKey = cacheService.constructor.buildKey(CACHE_KEYS.TOKEN_INFO, tokenId);

        // Check cache
        if (useCache) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const url = `${this.baseUrl}/api/v1/tokens/${tokenId}`;
            logger.info(`Fetching token info: ${tokenId}`);
            
            const data = await this.makeRequest(url);
            
            const tokenInfo = {
                tokenId: data.token_id,
                name: data.name,
                symbol: data.symbol,
                decimals: data.decimals,
                totalSupply: data.total_supply,
                treasuryAccountId: data.treasury_account_id,
                type: data.type,
                createdTimestamp: data.created_timestamp,
                memo: data.memo
            };

            // Cache the result (longer TTL for token info)
            cacheService.set(cacheKey, tokenInfo, CACHE_TTL.TOKEN_INFO);

            return tokenInfo;
        } catch (error) {
            logger.error(`Failed to fetch token info for ${tokenId}:`, error);
            throw new Error(`Failed to fetch token info: ${error.message}`);
        }
    }

    /**
     * Invalidate cache after write operations
     * @param {string} tokenId - Token ID that was modified
     */
    invalidateCacheForToken(tokenId) {
        logger.info(`Invalidating cache for token: ${tokenId}`);
        
        // Invalidate token balances
        cacheService.invalidateByPrefix(
            cacheService.constructor.buildKey(CACHE_KEYS.TOKEN_BALANCES, tokenId)
        );
        
        // Invalidate token transfers
        cacheService.invalidateByPrefix(
            cacheService.constructor.buildKey(CACHE_KEYS.TOKEN_TRANSFERS, tokenId)
        );
    }

    /**
     * Invalidate cache for HCS topic
     * @param {string} topicId - Topic ID that was modified
     */
    invalidateCacheForTopic(topicId) {
        logger.info(`Invalidating cache for topic: ${topicId}`);
        
        cacheService.invalidateByPrefix(
            cacheService.constructor.buildKey(CACHE_KEYS.TOPIC_MESSAGES, topicId)
        );
    }
}

module.exports = new MirrorNodeService();