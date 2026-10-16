const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Protected admin KPI statistics
router.get('/dashboard', authenticate, StatsController.getDashboardStats);

// Public client telemetry / engagement tracking
router.post('/telemetry', StatsController.logTelemetryEvent);

module.exports = router;
