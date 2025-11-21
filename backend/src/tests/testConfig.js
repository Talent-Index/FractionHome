// Test configuration and shared utilities
module.exports = {
  testnet: {
    mirrorNode: 'https://testnet.mirrornode.hedera.com',
    network: 'testnet'
  },
  
  // Test data
  mockTokenId: '0.0.12345',
  mockAccountId: '0.0.67890',
  mockTopicId: '0.0.11111',
  
  // Test timeouts
  timeout: {
    short: 5000,
    medium: 15000,
    long: 30000
  },
  
  // Mock mirror node responses
  mockBalances: {
    balances: [
      { account: '0.0.12345', balance: '1000' },
      { account: '0.0.67890', balance: '500' }
    ],
    decimals: 0
  },
  
  mockTransfers: {
    transactions: [
      {
        transaction_id: '0.0.1@1234567890.123456789',
        consensus_timestamp: '1234567890.123456789',
        name: 'CRYPTOTRANSFER',
        token_transfers: [
          { token_id: '0.0.12345', account: '0.0.67890', amount: '100' }
        ],
        result: 'SUCCESS'
      }
    ]
  },
  
  mockMessages: {
    messages: [
      {
        consensus_timestamp: '1234567890.123456789',
        sequence_number: 1,
        message: Buffer.from(JSON.stringify({ type: 'TEST' })).toString('base64'),
        running_hash: 'abc123',
        running_hash_version: 3
      }
    ]
  }
};