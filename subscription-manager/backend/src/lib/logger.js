const fs = require('fs');
const path = require('path');
const util = require('util');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    
    // Different log levels
    this.levels = {
      ERROR: 'ERROR',
      WARN: 'WARN',
      INFO: 'INFO',
      DEBUG: 'DEBUG'
    };
    
    // Use environment variable for log level
    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatLogEntry(level, message, meta = {}) {
    const entry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      ...meta
    };

    // Include stack trace for errors
    if (meta.error && meta.error instanceof Error) {
      entry.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack
      };
    }

    return JSON.stringify(entry);
  }

  writeToFile(level, logEntry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${level.toLowerCase()}.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFileSync(filepath, logEntry + '\n');
  }

  log(level, message, meta = {}) {
    const logEntry = this.formatLogEntry(level, message, meta);
    
    // Console output with color coding
    if (process.env.NODE_ENV !== 'test') {
      const coloredOutput = this.colorizeOutput(level, logEntry);
      console.log(coloredOutput);
    }
    
    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(level, logEntry);
    }
  }

  colorizeOutput(level, logEntry) {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[37m'  // White
    };
    
    const reset = '\x1b[0m';
    return `${colors[level] || ''}${logEntry}${reset}`;
  }

  // Convenience methods
  error(message, meta = {}) {
    this.log(this.levels.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(this.levels.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(this.levels.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (this.currentLevel === 'DEBUG') {
      this.log(this.levels.DEBUG, message, meta);
    }
  }

  // Track specific events
  trackAuthEvent(eventType, userId, success, details = {}) {
    this.info(`Auth Event: ${eventType}`, {
      category: 'authentication',
      eventType,
      userId,
      success,
      ...details
    });
  }

  trackAPICall(method, path, userId, statusCode, responseTime) {
    this.info(`API Call: ${method} ${path}`, {
      category: 'api',
      method,
      path,
      userId,
      statusCode,
      responseTime,
      timestamp: this.getTimestamp()
    });
  }

  trackError(error, context = {}) {
    this.error(`Application Error: ${error.message}`, {
      category: 'error',
      error,
      context
    });
  }

  // Clean up old logs (keep last 30 days)
  cleanupOldLogs() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    fs.readdirSync(this.logDir).forEach(file => {
      const filepath = path.join(this.logDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filepath);
        this.info(`Cleaned up old log file: ${file}`);
      }
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Run cleanup daily in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    logger.cleanupOldLogs();
  }, 24 * 60 * 60 * 1000); // 24 hours
}

module.exports = logger;