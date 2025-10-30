import express from 'express';

import holderRoutes from './routes/holderRoutes.js';
import bodyParser from 'body-parser';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/propertyRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Purchase-related dependencies
import HederaClient from './config/hederaClient.js';
import PropertyModel from './models/propertyModel.js';
import SaleModel from './models/saleModel.js';
import TokenModel from './models/tokenModel.js';
import HcsService from './services/hcsService.js';
import MirrorNodeService from './services/mirrorNodeService.js';
import PurchaseService from './services/purchaseService.js';
import PurchaseController from './controllers/purchaseController.js';

const app = express();

import cors from "cors";

app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

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
app.use('/api/properties', routes);
app.use('/api/audits', auditRoutes);

app.use('/api/holders', holderRoutes);
// app.use('/api/properties', propertyRoutes(purchaseController));

app.get('/', (req, res) => res.json({ ok: true, service: 'hedera-ipfs-property-backend' }));

app.use(errorHandler);

export default app;
