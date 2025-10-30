import { TopicMessageSubmitTransaction, TopicId } from '@hashgraph/sdk';
import logger from '../config/logger.js';
import HcsModel from '../models/hcsModel.js';
import constants from '../utils/constants.js';
import mirrorNodeService from './mirrorNodeService.js';

class HcsService {
    /**
     * @param {import('../config/hederaClient.js').default} hederaClient - initialized Hedera client instance
     * @param {Object} [opts]
     * @param {string} [opts.topicId] - override topic id (falls back to env or constants)
     * @param {Object} [opts.hcsModel] - optional injected HCS model
     */
    constructor(hederaClient, opts = {}) {
        this.client = hederaClient;
        this.topicId = opts.topicId || process.env.HCS_TOPIC_ID || constants.HCS_TOPIC_ID;
        this.hcsModel = opts.hcsModel || new HcsModel();
    }

    /**
     * Submit a JSON-serializable message to the configured HCS topic.
     * Persists a minimal reference in local hcsModel when available.
     *
     * @param {Object|string} message - object or string to publish
     * @returns {Promise<string>} - persisted record id if model used, otherwise Hedera transaction id
     */
    async submitMessage(message) {
        if (!this.topicId) {
            throw new Error('HCS topic ID is not configured');
        }

        const payload = typeof message === 'string' ? message : JSON.stringify(message);

        try {
            const tx = new TopicMessageSubmitTransaction()
                .setTopicId(TopicId.fromString(this.topicId))
                .setMessage(payload)
                .freezeWith(this.client);

            const submitResponse = await tx.execute(this.client);
            const receipt = await submitResponse.getReceipt(this.client);
            const txId = submitResponse.transactionId.toString();
            const status = receipt.status.toString();

            logger.info(`HCS submit: topic=${this.topicId} tx=${txId} status=${status}`);

            // try to persist a reference locally; if fails, still return txId
            try {
                if (this.hcsModel && typeof this.hcsModel.create === 'function') {
                    const record = await this.hcsModel.create({
                        topicId: this.topicId,
                        message: typeof message === 'string' ? message : message,
                        transactionId: txId,
                        status,
                        consensusTimestamp: receipt.consensusTimestamp ? receipt.consensusTimestamp.toString() : null,
                        createdAt: new Date().toISOString()
                    });
                    // prefer returning local record id so callers can reference DB entries
                    return record.id || txId;
                }
            } catch (dbErr) {
                logger.warn('Failed to persist HCS record locally:', dbErr);
            }

            return txId;
        } catch (err) {
            logger.error('Failed to submit HCS message:', err);
            throw err;
        }
    }

    /**
     * Fetch messages for a topic.
     * Delegates to mirrorNodeService when available; falls back to local hcsModel.
     *
     * @param {Object} [opts]
     * @param {string} [opts.topicId]
     * @param {number} [opts.limit]
     * @param {string} [opts.start] - ISO date or mirror node cursor
     * @returns {Promise<any>}
     */
    async getMessages(opts = {}) {
        const topic = opts.topicId || this.topicId;
        if (!topic) throw new Error('HCS topic ID is not configured');

        // Prefer mirror node for canonical HCS messages
        try {
            if (mirrorNodeService && typeof mirrorNodeService.getMessagesForTopic === 'function') {
                return await mirrorNodeService.getMessagesForTopic(topic, opts);
            }
        } catch (mnErr) {
            logger.warn('Mirror node query failed, falling back to local HCS store:', mnErr);
        }

        // Fallback: return locally stored HCS records
        if (this.hcsModel && typeof this.hcsModel.find === 'function') {
            const query = { topicId: topic };
            if (opts.limit) query._limit = opts.limit;
            return await this.hcsModel.find(query);
        }

        throw new Error('No available method to fetch HCS messages');
    }
}

export default HcsService;