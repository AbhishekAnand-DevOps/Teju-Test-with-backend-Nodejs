const db = require('../config/database');

const UserModel = {
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
    return stmt.get(email.trim().toLowerCase());
  },

  findById(id) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updatePassword(id, passwordHash) {
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(passwordHash, id);
  },

  updateProfile(id, name, email) {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(name, email.trim().toLowerCase(), id);
  },

  getAll() {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    return stmt.all();
  }
};

module.exports = UserModel;
