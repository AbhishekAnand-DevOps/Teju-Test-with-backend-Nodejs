const db = require('../config/database');

const ProjectModel = {
  findAll({ category = null, featuredOnly = false } = {}) {
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (featuredOnly) {
      sql += ' AND featured = 1';
    }

    if (category && category !== 'all') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  },

  create(data) {
    const id = data.id || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `proj-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, title, category, client, timeline, tools, deliverables, image, challenge, solution, featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title.trim(),
      data.category.trim(),
      data.client.trim(),
      data.timeline.trim(),
      data.tools.trim(),
      data.deliverables.trim(),
      data.image.trim(),
      data.challenge.trim(),
      data.solution.trim(),
      data.featured ? 1 : 0,
      parseInt(data.sort_order, 10) || 0
    );

    return this.findById(id);
  },

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = {
      title: data.title !== undefined ? data.title.trim() : existing.title,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      client: data.client !== undefined ? data.client.trim() : existing.client,
      timeline: data.timeline !== undefined ? data.timeline.trim() : existing.timeline,
      tools: data.tools !== undefined ? data.tools.trim() : existing.tools,
      deliverables: data.deliverables !== undefined ? data.deliverables.trim() : existing.deliverables,
      image: data.image !== undefined ? data.image.trim() : existing.image,
      challenge: data.challenge !== undefined ? data.challenge.trim() : existing.challenge,
      solution: data.solution !== undefined ? data.solution.trim() : existing.solution,
      featured: data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
      sort_order: data.sort_order !== undefined ? parseInt(data.sort_order, 10) : existing.sort_order
    };

    const stmt = db.prepare(`
      UPDATE projects SET
        title = ?,
        category = ?,
        client = ?,
        timeline = ?,
        tools = ?,
        deliverables = ?,
        image = ?,
        challenge = ?,
        solution = ?,
        featured = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.category,
      updated.client,
      updated.timeline,
      updated.tools,
      updated.deliverables,
      updated.image,
      updated.challenge,
      updated.solution,
      updated.featured,
      updated.sort_order,
      id
    );

    return this.findById(id);
  },

  delete(id) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  },

  count() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM projects');
    return stmt.get().count;
  }
};

module.exports = ProjectModel;
