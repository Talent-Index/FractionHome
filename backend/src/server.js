require('./config/env');
const app = require('./app');
const logger = require('./config/logger');


const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () => {
logger.info(`Server listening on port ${port}`);
});
