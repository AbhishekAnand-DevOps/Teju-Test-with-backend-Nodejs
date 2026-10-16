const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_tejashwini_portfolio_2025',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@tejashwini.art',
    password: process.env.ADMIN_PASSWORD || 'Admin@2025!',
    name: process.env.ADMIN_NAME || 'Tejashwini'
  },
  
  email: {
    host: process.env.SMTP_HOST || null,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    from: process.env.SMTP_FROM || '"Tejashwini Portfolio" <no-reply@tejashwini.art>',
    notificationReceiver: process.env.NOTIFICATION_RECEIVER || 'tejashwini.vfx@gmail.com'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  
  upload: {
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 25,
    destDir: path.resolve(__dirname, '../../uploads')
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  dbPath: path.resolve(__dirname, '../../data/database.sqlite')
};

module.exports = config;
