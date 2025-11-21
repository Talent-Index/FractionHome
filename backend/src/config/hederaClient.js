
/**
 * /src/config/hederaClient.js
 *
 * Lightweight wrapper around @hashgraph/sdk Client configured from environment variables.
 *
 * Expected env vars (see .env.example):
 *  - HEDERA_NETWORK         (testnet | mainnet | JSON network map)
 *  - OPERATOR_ID            (account id, e.g. 0.0.1234)
 *  - OPERATOR_KEY           (private key for operator)
 *  - MIRROR_NODE_URL        (optional, e.g. https://testnet.mirrornode.hedera.com)
 *
 * Usage:
 *  const HederaClient = require('./config/hederaClient.js');
 *  const hederaClient = new HederaClient();
 *  const sdkClient = hederaClient.getClient();
 */

import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();


class HederaClient {
    constructor(opts = {}) {
        // allow config pre-loaded by config/env.js or direct process.env
        const networkEnv = (opts.network || process.env.HEDERA_NETWORK || 'testnet').trim();
        const operatorIdEnv = (opts.operatorId || process.env.OPERATOR_ID || process.env.HEDERA_OPERATOR_ID);
        const operatorKeyEnv = (opts.operatorKey || process.env.OPERATOR_KEY || process.env.HEDERA_OPERATOR_KEY);
        const mirrorNode = opts.mirrorNode || process.env.MIRROR_NODE_URL || null;

        if (!operatorIdEnv || !operatorKeyEnv) {
            throw new Error('Hedera operator credentials missing. Set OPERATOR_ID and OPERATOR_KEY in environment.');
        }

        // build client depending on network value
        let client;
        if (networkEnv === 'testnet') {
            client = Client.forTestnet();
        } else if (networkEnv === 'mainnet') {
            client = Client.forMainnet();
        } else {
            // try to parse a JSON network map from env (e.g. {"0.testnet.hedera.com:50211":"0.0.3"})
            try {
                const parsed = JSON.parse(networkEnv);
                client = Client.forNetwork(parsed);
            } catch (err) {
                throw new Error(
                    'Unsupported HEDERA_NETWORK. Use "testnet", "mainnet", or a JSON network map string.'
                );
            }
        }

        // validate keys and set operator
        let operatorAccountId, operatorPrivateKey;
        try {
            operatorAccountId = AccountId.fromString(operatorIdEnv);

            // Prefer explicit constructors to avoid deprecated fromString()
            const keyText = (operatorKeyEnv || '').trim();

            try {
                // If the key looks like a DER/PEM, try DER parser first
                if (keyText.startsWith('-----BEGIN')) {
                    // PEM may not be directly supported by the SDK; try DER parser as a best-effort
                    operatorPrivateKey = PrivateKey.fromStringDer(keyText);
                } else if (/^[0-9a-fA-F]+$/.test(keyText)) {
                    // Hex string: try ED25519 first, then ECDSA
                    try {
                        operatorPrivateKey = PrivateKey.fromStringED25519(keyText);
                    } catch (e) {
                        operatorPrivateKey = PrivateKey.fromStringECDSA(keyText);
                    }
                } else {
                    // Otherwise attempt ED25519, then ECDSA, then fall back to legacy parser
                    try {
                        operatorPrivateKey = PrivateKey.fromStringED25519(keyText);
                    } catch (e1) {
                        try {
                            operatorPrivateKey = PrivateKey.fromStringECDSA(keyText);
                        } catch (e2) {
                            operatorPrivateKey = PrivateKey.fromString(keyText);
                        }
                    }
                }
            } catch (e) {
                // final fallback to deprecated parser for compatibility
                operatorPrivateKey = PrivateKey.fromString(operatorKeyEnv);
            }
        } catch (err) {
            throw new Error('Invalid OPERATOR_ID or OPERATOR_KEY format.');
        }

        client.setOperator(operatorAccountId, operatorPrivateKey);

        // expose internals
        this.client = client;
        this.operatorAccountId = operatorAccountId.toString();
        this.operatorPrivateKey = operatorPrivateKey; // keep as PrivateKey instance
        this.mirrorNodeUrl = mirrorNode;
    }

    // returns the underlying @hashgraph/sdk Client instance
    getClient() {
        return this.client;
    }

    // operator getters
    getOperatorId() {
        return this.operatorAccountId;
    }

    getOperatorKey() {
        return this.operatorPrivateKey;
    }

    // optional mirror node url
    getMirrorNodeUrl() {
        return this.mirrorNodeUrl;
    }

    // convenience: create and sign transactions via provided callback
    // callback receives the sdk Client as argument
    withClient(fn) {
        if (typeof fn !== 'function') return;
        return fn(this.client);
    }

    // close client if supported (no-op for current SDK but kept for future compatibility)
    close() {
        if (this.client && typeof this.client.close === 'function') {
            try {
                this.client.close();
            } catch (e) {
                // ignore
            }
        }
    }
}

export default HederaClient;