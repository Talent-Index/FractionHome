import './config/env.js';
import app from './app.js';
import logger from './config/logger.js';


const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, () => {
logger.info(`Server listening on port ${port}`);
});
