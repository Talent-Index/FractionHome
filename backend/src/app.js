const express = require('express');

const holderRoutes = require('./routes/holderRoutes');
const bodyParser = require('body-parser');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const propertyRoutes = require('./routes/propertyRoutes');

// Purchase-related dependencies
const HederaClient = require('./config/hederaClient');
const PropertyModel = require('./models/propertyModel');
const SaleModel = require('./models/saleModel');
const TokenModel = require('./models/tokenModel');
const HcsService = require('./services/hcsService');
const MirrorNodeService = require('./services/mirrorNodeService');
const PurchaseService = require('./services/purchaseService');
const PurchaseController = require('./controllers/purchaseController');

const app = express();

app.use(bodyParser.json());
app.use(requestLogger);


// Initialize services
const hederaClient = new HederaClient();
const propertyModel = new PropertyModel();
const saleModel = new SaleModel();
const tokenModel = new TokenModel();
const hcsService = new HcsService(hederaClient);
const mirrorNodeService = new MirrorNodeService();

const purchaseService = new PurchaseService(
    hederaClient,
    saleModel,
    hcsService,
    tokenModel
);

const purchaseController = new PurchaseController(
    purchaseService,
    propertyModel,
    mirrorNodeService
);

// Routes
app.use('/api/holders', holderRoutes);
app.use('/api/properties', propertyRoutes(purchaseController));

app.get('/', (req, res) => res.json({ ok: true, service: 'hedera-ipfs-property-backend' }));

app.use(errorHandler);

module.exports = app;