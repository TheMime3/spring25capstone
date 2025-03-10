import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.message} - ${req.method} ${req.url} - IP: ${req.ip}`);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      status: err.status,
      code: err.code
    });
  }

  // Handle MySQL unique constraint violations
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      message: 'Email already registered',
      status: 400,
      code: 'DUPLICATE_EMAIL'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    code: 'INTERNAL_ERROR'
  });
};