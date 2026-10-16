const config = require('../config/env');

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    });
  }
  next();
}

function globalErrorHandler(err, req, res, next) {
  console.error('[Unhandled Error]', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Specific Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = `File is too large. Maximum allowed size is ${config.upload.maxSizeMb}MB.`;
  }

  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (config.isDev) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
