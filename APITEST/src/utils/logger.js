import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, '../../logs/api.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

export const logger = {
  log: (message, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // Write to file
    fs.appendFileSync(logFile, logMessage);
    
    // Also log to console
    console.log(logMessage.trim());
  },

  info: (message) => logger.log(message, 'INFO'),
  warn: (message) => logger.log(message, 'WARN'),
  error: (message) => logger.log(message, 'ERROR'),
  audit: (userId, action, details) => {
    const message = `User ${userId || 'anonymous'} - ${action} - ${details}`;
    logger.log(message, 'AUDIT');
  }
};