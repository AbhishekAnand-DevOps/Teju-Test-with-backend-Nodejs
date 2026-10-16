const db = require('../config/database');

const InquiryModel = {
  create({ client_name, client_email, project_type, budget = 0, timeline = '', project_brief, ip_address = '' }) {
    const stmt = db.prepare(`
      INSERT INTO inquiries (client_name, client_email, project_type, budget, timeline, project_brief, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      client_name.trim(),
      client_email.trim().toLowerCase(),
      project_type,
      parseInt(budget, 10) || 0,
      timeline,
      project_brief.trim(),
      ip_address
    );
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM inquiries WHERE id = ?');
    return stmt.get(id);
  },

  findAll({ status = null, project_type = null, search = '', limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (project_type && project_type !== 'all') {
      sql += ' AND project_type = ?';
      params.push(project_type);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (client_name LIKE ? OR client_email LIKE ? OR project_brief LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  countAll({ status = null, project_type = null, search = '' } = {}) {
    let sql = 'SELECT COUNT(*) as total FROM inquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (project_type && project_type !== 'all') {
      sql += ' AND project_type = ?';
      params.push(project_type);
    }

    if (search && search.trim() !== '') {
      sql += ' AND (client_name LIKE ? OR client_email LIKE ? OR project_brief LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const stmt = db.prepare(sql);
    const res = stmt.get(...params);
    return res ? res.total : 0;
  },

  updateStatus(id, status, notes = null) {
    let sql = 'UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (notes !== null) {
      sql += ', notes = ?';
      params.push(notes);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },

  delete(id) {
    const stmt = db.prepare('DELETE FROM inquiries WHERE id = ?');
    return stmt.run(id);
  },

  getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM inquiries');
    const newStmt = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'");
    const activeStmt = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status IN ('new', 'in_discussion', 'proposal_sent')");
    const wonStmt = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status IN ('accepted', 'completed')");
    const pipelineStmt = db.prepare("SELECT COALESCE(SUM(budget), 0) as totalValue, COALESCE(AVG(budget), 0) as avgBudget FROM inquiries WHERE status != 'archived'");

    const total = totalStmt.get().count;
    const newCount = newStmt.get().count;
    const activeCount = activeStmt.get().count;
    const wonCount = wonStmt.get().count;
    const pipeline = pipelineStmt.get();

    // Category breakdown
    const categoryBreakdownStmt = db.prepare(`
      SELECT project_type, COUNT(*) as count, COALESCE(SUM(budget), 0) as totalBudget
      FROM inquiries
      GROUP BY project_type
      ORDER BY count DESC
    `);
    const categoryBreakdown = categoryBreakdownStmt.all();

    return {
      totalInquiries: total,
      newInquiries: newCount,
      activeInquiries: activeCount,
      wonInquiries: wonCount,
      totalPipelineValue: pipeline.totalValue,
      averageBudget: Math.round(pipeline.avgBudget),
      categoryBreakdown
    };
  },

  getAllForExport() {
    const stmt = db.prepare(`
      SELECT 
        id, 
        client_name, 
        client_email, 
        project_type, 
        budget, 
        timeline, 
        project_brief, 
        status, 
        notes, 
        created_at 
      FROM inquiries 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  }
};

module.exports = InquiryModel;
