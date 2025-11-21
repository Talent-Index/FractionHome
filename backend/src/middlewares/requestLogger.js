import logger from '../config/logger.js';

export default (req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
};
