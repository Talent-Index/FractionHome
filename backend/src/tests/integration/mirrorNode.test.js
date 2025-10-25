const mirrorNodeService = require('../../services/mirrorNodeService');
const cacheService = require('../../services/cacheService');

// These tests require actual Hedera testnet access
// Set SKIP_INTEGRATION_TESTS=true to skip
const SKIP_TESTS = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe('MirrorNode Integration Tests', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  // Use a known testnet token for integration tests
  const TEST_TOKEN_ID = '0.0.48938298'; // Replace with actual testnet token
  const TEST_TOPIC_ID = '0.0.48938299'; // Replace with actual testnet topic
  const TEST_ACCOUNT_ID = '0.0.2'; // Hedera treasury account

  (SKIP_TESTS ? describe.skip : describe)('Real Mirror Node Integration', () => {
    it('should fetch real token balances', async () => {
      const balances = await mirrorNodeService.getTokenBalances(TEST_TOKEN_ID, false);
      
      expect(Array.isArray(balances)).toBe(true);
      if (balances.length > 0) {
        expect(balances[0]).toHaveProperty('accountId');
        expect(balances[0]).toHaveProperty('balance');
        expect(typeof balances[0].balance).toBe('number');
      }
    }, 30000); // 30s timeout

    it('should fetch real token transfers', async () => {
      const transfers = await mirrorNodeService.getTokenTransfers(TEST_TOKEN_ID, 10, false);
      
      expect(Array.isArray(transfers)).toBe(true);
      if (transfers.length > 0) {
        expect(transfers[0]).toHaveProperty('transactionId');
        expect(transfers[0]).toHaveProperty('consensusTimestamp');
        expect(transfers[0]).toHaveProperty('transfers');
      }
    }, 30000);

    it('should fetch real topic messages', async () => {
      const messages = await mirrorNodeService.getTopicMessages(TEST_TOPIC_ID, 10, false);
      
      expect(Array.isArray(messages)).toBe(true);
      if (messages.length > 0) {
        expect(messages[0]).toHaveProperty('consensusTimestamp');
        expect(messages[0]).toHaveProperty('sequenceNumber');
        expect(messages[0]).toHaveProperty('message');
      }
    }, 30000);

    it('should fetch real account token balances', async () => {
      const tokens = await mirrorNodeService.getAccountTokenBalances(TEST_ACCOUNT_ID, false);
      
      expect(Array.isArray(tokens)).toBe(true);
      if (tokens.length > 0) {
        expect(tokens[0]).toHaveProperty('tokenId');
        expect(tokens[0]).toHaveProperty('balance');
      }
    }, 30000);

    it('should fetch real token info', async () => {
      const tokenInfo = await mirrorNodeService.getTokenInfo(TEST_TOKEN_ID, false);
      
      expect(tokenInfo).toHaveProperty('tokenId');
      expect(tokenInfo).toHaveProperty('name');
      expect(tokenInfo).toHaveProperty('symbol');
      expect(tokenInfo).toHaveProperty('totalSupply');
    }, 30000);

    it('should cache results between requests', async () => {
      const start1 = Date.now();
      await mirrorNodeService.getTokenBalances(TEST_TOKEN_ID, true);
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await mirrorNodeService.getTokenBalances(TEST_TOKEN_ID, true);
      const duration2 = Date.now() - start2;

      // Cached request should be significantly faster
      expect(duration2).toBeLessThan(duration1 / 10);
    }, 30000);
  });
});