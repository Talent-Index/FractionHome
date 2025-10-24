const logger = require('../config/logger');
module.exports = (req, res, next) => {
logger.info(`${req.method} ${req.originalUrl}`);
next();
};
