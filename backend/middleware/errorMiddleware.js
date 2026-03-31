import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Fault Origin ${req.method} ${req.url}: ${err.message}`, { trace: err.stack, id: req.headers['x-request-id'] });
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production' && statusCode === 500 
            ? 'Unified Engine State Fault — Check Telemetry Logs' 
            : err.message
  });
};
