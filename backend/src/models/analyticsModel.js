const db = require('../config/database');

const AnalyticsModel = {
  logEvent(eventType, metadata = {}, ip = '', userAgent = '') {
    try {
      const metaStr = typeof metadata === 'object' ? JSON.stringify(metadata) : String(metadata);
      const stmt = db.prepare(`
        INSERT INTO analytics_events (event_type, metadata, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `);
      return stmt.run(eventType, metaStr, ip, userAgent);
    } catch (err) {
      console.error('[Analytics] Failed to log event:', err.message);
      return null;
    }
  },

  getSummary() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM analytics_events');
    const breakdownStmt = db.prepare(`
      SELECT event_type, COUNT(*) as count 
      FROM analytics_events 
      GROUP BY event_type 
      ORDER BY count DESC
    `);
    const recentStmt = db.prepare(`
      SELECT event_type, metadata, created_at 
      FROM analytics_events 
      ORDER BY created_at DESC 
      LIMIT 15
    `);

    return {
      totalEvents: totalStmt.get().count,
      breakdown: breakdownStmt.all(),
      recent: recentStmt.all()
    };
  }
};

module.exports = AnalyticsModel;
