const logger = require('../lib/logger');

// Middleware to track API response times and log requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to log after response
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    
    // Log API call
    logger.trackAPICall(
      req.method,
      req.path,
      req.user?.id || 'anonymous',
      res.statusCode,
      responseTime
    );
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn(`Slow API request detected`, {
        method: req.method,
        path: req.path,
        responseTime,
        userId: req.user?.id
      });
    }
    
    // Call original end function
    originalEnd.apply(res, args);
  };
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.trackError(err, {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    }
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};