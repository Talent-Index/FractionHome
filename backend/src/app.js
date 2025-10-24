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

const express = require('express');
const bodyParser = require('body-parser');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const propertyRoutes = require('./routes/propertyRoutes');


const app = express();
app.use(bodyParser.json());
app.use(requestLogger);


app.use('/api/properties', propertyRoutes);


app.get('/', (req, res) => res.json({ ok: true, service: 'hedera-ipfs-property-backend' }));


app.use(errorHandler);


module.exports = app;

require('./config/env');
const app = require('./app');
const logger = require('./config/logger');


const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () => {
logger.info(`Server listening on port ${port}`);
});