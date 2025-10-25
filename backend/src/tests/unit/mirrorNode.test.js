const mirrorNodeService = require('../../services/mirrorNodeService');
const cacheService = require('../../services/cacheService');

// Mock fetch
global.fetch = jest.fn();

describe('MirrorNodeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();
  });

  describe('getTokenBalances', () => {
    it('should fetch token balances from mirror node', async () => {
      const mockResponse = {
        balances: [
          { account: '0.0.12345', balance: '1000' },
          { account: '0.0.67890', balance: '500' }
        ],
        decimals: 0
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const balances = await mirrorNodeService.getTokenBalances('0.0.11111', false);

      expect(balances).toHaveLength(2);
      expect(balances[0].accountId).toBe('0.0.12345');
      expect(balances[0].balance).toBe(1000);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should use cached data when available', async () => {
      const mockResponse = {
        balances: [{ account: '0.0.12345', balance: '1000' }],
        decimals: 0
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // First call - should fetch
      await mirrorNodeService.getTokenBalances('0.0.11111', true);
      
      // Second call - should use cache
      const balances = await mirrorNodeService.getTokenBalances('0.0.11111', true);

      expect(balances).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only once
    });

    it('should handle fetch errors with retry', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ balances: [], decimals: 0 })
        });

      const balances = await mirrorNodeService.getTokenBalances('0.0.11111', false);

      expect(balances).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Retried twice
    });
  });

  describe('getTokenTransfers', () => {
    it('should fetch token transfer history', async () => {
      const mockResponse = {
        transactions: [
          {
            transaction_id: '0.0.1@1234567890.123456789',
            consensus_timestamp: '1234567890.123456789',
            name: 'CRYPTOTRANSFER',
            token_transfers: [
              { token_id: '0.0.11111', account: '0.0.12345', amount: '-100' },
              { token_id: '0.0.11111', account: '0.0.67890', amount: '100' }
            ],
            result: 'SUCCESS'
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const transfers = await mirrorNodeService.getTokenTransfers('0.0.11111', 25, false);

      expect(transfers).toHaveLength(1);
      expect(transfers[0].type).toBe('CRYPTOTRANSFER');
      expect(transfers[0].transfers).toHaveLength(2);
    });
  });

  describe('getTopicMessages', () => {
    it('should fetch and parse topic messages', async () => {
      const message = { type: 'TOKEN_SALE', amount: 100 };
      const encodedMessage = Buffer.from(JSON.stringify(message)).toString('base64');

      const mockResponse = {
        messages: [
          {
            consensus_timestamp: '1234567890.123456789',
            sequence_number: 1,
            message: encodedMessage,
            running_hash: 'abc123'
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages = await mirrorNodeService.getTopicMessages('0.0.22222', 25, false);

      expect(messages).toHaveLength(1);
      expect(messages[0].message.type).toBe('TOKEN_SALE');
      expect(messages[0].message.amount).toBe(100);
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate token cache', async () => {
      const mockResponse = {
        balances: [{ account: '0.0.12345', balance: '1000' }],
        decimals: 0
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      // Fetch and cache
      await mirrorNodeService.getTokenBalances('0.0.11111', true);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Invalidate
      mirrorNodeService.invalidateCacheForToken('0.0.11111');

      // Fetch again - should hit API
      await mirrorNodeService.getTokenBalances('0.0.11111', true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });