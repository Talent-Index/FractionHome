const express = require('express');
const holderRoutes = require('./routes/holderRoutes');
// ... other imports

const PurchaseService = require('./services/purchaseService');
const PurchaseController = require('./controllers/purchaseController');

const app = express();

// ... middleware setup

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

// Routes
app.use('/api/holders', holderRoutes);
// ... other routes

// Pass to routes
app.use('/api/properties', propertyRoutes(purchaseController));

module.exports = app;