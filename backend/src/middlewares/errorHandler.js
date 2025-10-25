const logger = require('../config/logger');
module.exports = (err, req, res, next) => {
logger.error(err.stack || err.message || err);
res.status(500).json({ error: err.message || 'internal error' });
};
