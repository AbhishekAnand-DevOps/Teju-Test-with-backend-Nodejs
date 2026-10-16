const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./src/config/env');
const db = require('./src/config/database');

// Import Middlewares
const { notFoundHandler, globalErrorHandler } = require('./src/middlewares/errorHandler');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

// Import Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const inquiriesRoutes = require('./src/routes/inquiriesRoutes');
const projectsRoutes = require('./src/routes/projectsRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();
const projectRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(projectRoot, 'frontend');

// 1. Trust Reverse Proxy (if deployed behind Nginx, Render, Railway, Fly.io)
app.set('trust proxy', 1);

// 2. Security Headers (configured to allow local scripts, Three.js, audio & fonts)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline audio synthesis, Three.js shaders & Google Fonts
    crossOriginEmbedderPolicy: false
  })
);

// 3. CORS & Parsing Middlewares
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 5. Static Files Serving
// Serve user uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Serve admin portal assets and direct routes
app.use('/admin/assets', express.static(path.join(frontendRoot, 'assets')));
app.get(['/admin/admin.css', '/admin.css'], (req, res) => {
  res.sendFile(path.join(frontendRoot, 'admin/admin.css'));
});
app.get(['/admin/admin.js', '/admin.js'], (req, res) => {
  res.sendFile(path.join(frontendRoot, 'admin/admin.js'));
});
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(frontendRoot, 'admin/index.html'));
});
app.use('/admin', express.static(path.join(frontendRoot, 'admin')));

// Serve portfolio website static files (CSS, JS, Assets, Fonts)
app.use(express.static(frontendRoot));

// Explicit route to serve Main Website
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

// Support legacy filename with spaces
app.get('/index%20%20edited%20abhi%201.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index  edited abhi 1.html'));
});

// 6. System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  try {
    const dbTest = db.prepare('SELECT 1 as alive').get();
    let appVersion = '1.0.0';
    try {
      appVersion = require(path.join(projectRoot, 'package.json')).version || require(path.join(__dirname, 'package.json')).version;
    } catch (_) {}

    res.status(200).json({
      status: 'healthy',
      database: dbTest && dbTest.alive === 1 ? 'connected' : 'degraded',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: appVersion
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 7. API Routes with Rate Limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// 8. Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

// 9. Start HTTP Server
const server = app.listen(config.port, () => {
  console.log(`
===========================================================
  🚀 TEJASHWINI PORTFOLIO BACKEND IS ONLINE
===========================================================
  * Server running at:     https://teju-test-with-backend-nodejs-front.vercel.app/:${config.port}
  * Public Portfolio:      https://teju-test-with-backend-nodejs-front.vercel.app/${config.port}/
  * Admin Portal:          https://teju-test-with-backend-nodejs.onrender.com${config.port}/admin
  * Health Endpoint:       https://teju-test-with-backend-nodejs-front.vercel.app/${config.port}/api/health
  * Inquiries API:         https://teju-test-with-backend-nodejs-front.vercel.app/${config.port}/api/inquiries
  * Database Status:       SQLite Connected (WAL Mode)
  * Environment:           ${config.nodeEnv}
===========================================================
  Default Admin Login:
  - Email:    ${config.admin.email}
  - Password: ${config.admin.password}
===========================================================
  `);
});

// 10. Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    try {
      db.close();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = { app, server };
