export default {
  // Sale statuses
  SALE_STATUS: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    TOKEN_BALANCES: 30,        // 30 seconds
    TOKEN_TRANSFERS: 60,       // 1 minute
    TOPIC_MESSAGES: 60,        // 1 minute
    ACCOUNT_INFO: 120,         // 2 minutes
    TOKEN_INFO: 300            // 5 minutes
  },

  // Mirror Node query limits
  MIRROR_NODE: {
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 25,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
  },

  // Cache key prefixes
  CACHE_KEYS: {
    TOKEN_BALANCES: 'balances',
    TOKEN_TRANSFERS: 'transfers',
    TOPIC_MESSAGES: 'messages',
    ACCOUNT_INFO: 'account',
    TOKEN_INFO: 'token'
  },

  HCS_MESSAGE_TYPES: {
    PROPERTY_TOKENIZED: 'PROPERTY_TOKENIZED',
    TOKEN_SALE: 'TOKEN_SALE',
    DISTRIBUTION: 'DISTRIBUTION'
  },

  MIN_PURCHASE_QUANTITY: 1,
  MAX_PURCHASE_QUANTITY: 10000
};
