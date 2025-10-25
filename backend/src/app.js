const PurchaseService = require('./services/purchaseService');
const PurchaseController = require('./controllers/purchaseController');

// Initialize services
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

// Pass to routes
app.use('/api/properties', propertyRoutes(purchaseController));