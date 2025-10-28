import logger from '../config/logger.js';

export default (err, req, res, next) => {
    logger.error(err.stack || err.message || err);
    res.status(500).json({ error: err.message || 'internal error' });
};