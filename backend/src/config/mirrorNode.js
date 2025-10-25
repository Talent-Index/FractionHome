const logger = require('./logger');

const MIRROR_NODE_CONFIG = {
  // Hedera Testnet Mirror Node
  testnet: {
    baseUrl: 'https://testnet.mirrornode.hedera.com',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  // Hedera Mainnet Mirror Node
  mainnet: {
    baseUrl: 'https://mainnet-public.mirrornode.hedera.com',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  }
};

const network = process.env.HEDERA_NETWORK || 'testnet';

if (!['testnet', 'mainnet'].includes(network)) {
  logger.warn(`Invalid network ${network}, defaulting to testnet`);
}

const config = MIRROR_NODE_CONFIG[network] || MIRROR_NODE_CONFIG.testnet;

logger.info(`Mirror Node configured for ${network}: ${config.baseUrl}`);

module.exports = {
  ...config,
  network
};