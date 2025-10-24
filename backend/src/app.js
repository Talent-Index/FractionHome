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
