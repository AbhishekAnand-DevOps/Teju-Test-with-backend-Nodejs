const os = require('os');
const InquiryModel = require('../models/inquiryModel');
const ProjectModel = require('../models/projectModel');
const AnalyticsModel = require('../models/analyticsModel');
const { successResponse, errorResponse } = require('../utils/helpers');

const StatsController = {
  /**
   * Get overall admin dashboard KPIs and system health metrics (Protected)
   */
  async getDashboardStats(req, res) {
    try {
      const inquiryStats = InquiryModel.getStats();
      const projectCount = ProjectModel.count();
      const analyticsSummary = AnalyticsModel.getSummary();

      const memoryUsage = process.memoryUsage();
      const systemStats = {
        nodeVersion: process.version,
        platform: `${os.type()} ${os.release()} (${os.arch()})`,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        },
        serverTime: new Date().toISOString()
      };

      return successResponse(res, {
        inquiries: inquiryStats,
        totalProjects: projectCount,
        analytics: analyticsSummary,
        system: systemStats
      }, 'Dashboard statistics loaded');
    } catch (err) {
      console.error('[StatsController.getDashboardStats]', err);
      return errorResponse(res, 'Failed to fetch dashboard stats.', 500);
    }
  },

  /**
   * Public endpoint to log telemetry events (e.g. showreel plays, button clicks)
   */
  async logTelemetryEvent(req, res) {
    try {
      const { eventType, metadata } = req.body;
      if (!eventType) {
        return errorResponse(res, 'eventType is required.', 400);
      }

      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      AnalyticsModel.logEvent(eventType, metadata || {}, ip, userAgent);
      return successResponse(res, null, 'Event logged');
    } catch (err) {
      console.error('[StatsController.logTelemetryEvent]', err);
      return errorResponse(res, 'Failed to log event.', 500);
    }
  }
};

module.exports = StatsController;
