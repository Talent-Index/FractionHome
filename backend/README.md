```
backend/
├── src/
│   ├── app.js                      # Express app entry
│   ├── server.js                   # Starts the server
│   │
│   ├── config/
│   │   ├── hederaClient.js         # Initialize Hedera SDK client using .env
│   │   ├── ipfsClient.js           # IPFS/HFS integration setup
│   │   ├── mirrorNode.js           # Mirror node query config
│   │   ├── env.js                  # Load environment variables
│   │   └── logger.js               # Logging configuration
│   │
│   ├── controllers/
│   │   ├── propertyController.js   # Upload, list, detail
│   │   ├── tokenController.js      # Token creation (HTS)
│   │   ├── purchaseController.js   # Simulated token transfers
│   │   ├── auditController.js      # HCS event retrieval
│   │   ├── holderController.js     # Mirror node ownership verification
│   │   ├── distributionController.js # Rental income prototype (optional)
│   │   └── adminController.js      # Error logs and system observability
│   │
│   ├── models/
│   │   ├── propertyModel.js        # Metadata schema & DB interface
│   │   ├── tokenModel.js           # Token info (id, metadata, treasury)
│   │   ├── saleModel.js            # Sale records & simulated purchases
│   │   ├── hcsModel.js             # HCS message references
│   │   ├── distributionModel.js    # Rental distribution records
│   │   └── logModel.js             # Local error & tx logs
│   │
│   ├── routes/
│   │   ├── propertyRoutes.js       # /api/properties/*
│   │   ├── tokenRoutes.js          # /api/tokenize, /api/buy
│   │   ├── auditRoutes.js          # /api/audit
│   │   ├── holderRoutes.js         # /api/holders
│   │   ├── distributionRoutes.js   # /api/distribute
│   │   └── adminRoutes.js          # /api/admin
│   │
│   ├── services/
│   │   ├── propertyService.js      # Property metadata creation & hashing
│   │   ├── ipfsService.js          # IPFS/HFS upload + verification
│   │   ├── tokenService.js         # HTS token creation logic
│   │   ├── purchaseService.js      # Token transfer logic (simulated sale)
│   │   ├── hcsService.js           # Publish & query Hedera Consensus Service
│   │   ├── mirrorNodeService.js    # Query token balances, HCS messages
│   │   ├── distributionService.js  # Rental income simulation logic
│   │   └── cacheService.js         # In-memory/Redis caching utilities
│   │
│   ├── utils/
│   │   ├── hashUtil.js             # SHA-256 content hashing
│   │   ├── validateUtil.js         # Input validation helpers
│   │   ├── responseUtil.js         # Standard API response formatters
│   │   ├── errorUtil.js            # Error formatting & codes
│   │   └── constants.js            # Token prefix, HCS topic IDs, etc.
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js         # Global error handler
│   │   ├── requestLogger.js        # Logs incoming requests
│   │   └── validateRequest.js      # Schema validation middleware
│   │
│   ├── db/
│   │   ├── index.js                # DB initialization (lowdb/SQLite)
│   │   └── seed.js                 # Dummy property and account data
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── metadata.test.js
│   │   │   ├── ipfs.test.js
│   │   │   ├── hash.test.js
│   │   │   └── utils.test.js
│   │   ├── integration/
│   │   │   ├── tokenizeFlow.test.js
│   │   │   ├── transferFlow.test.js
│   │   │   └── mirrorNode.test.js
│   │   └── testConfig.js
│   │
│   ├── logs/
│   │   ├── app.log
│   │   └── hedera.log
│   │
│   └── index.js                    # Fallback entry point
│
├── .env.example
├── package.json
├── README.md
├── runbook.md                      # Demo script & instructions
├── openapi.yaml                    # API documentation
└── scripts/
    ├── start.sh                    # Starts backend server
    ├── createTestAccounts.sh       # Setup dummy Hedera testnet accounts
    └── verifyMirrorData.sh         # Quick CLI for on-chain verification

```
