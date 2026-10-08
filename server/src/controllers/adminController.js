const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class AdminController {
  async listUsers(req, res, next) {
    try {
      const usersRes = await db.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      res.json({
        success: true,
        data: { users: usersRes.rows || [] }
      });
    } catch (err) {
      next(err);
    }
  }

  async listContent(req, res, next) {
    try {
      const contentRes = await db.query('SELECT * FROM content ORDER BY created_at DESC');
      const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
      const items = (contentRes.rows || []).map(c => ({
        ...c,
        tags: parse(c.tags, []),
        metadata: parse(c.metadata, {})
      }));

      res.json({
        success: true,
        data: { content: items }
      });
    } catch (err) {
      next(err);
    }
  }

  async createContent(req, res, next) {
    try {
      const { title, description, category, topic, difficulty, contentType, duration, tags = [] } = req.body;
      const contentId = uuidv4();

      const resInsert = await db.query(
        `INSERT INTO content (id, title, description, category, topic, difficulty, content_type, duration, tags, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [contentId, title, description, category, topic, difficulty, contentType, duration, JSON.stringify(tags)]
      );

      res.status(201).json({
        success: true,
        data: { content: resInsert.rows[0], message: 'Content item created' }
      });
    } catch (err) {
      next(err);
    }
  }

  async getSystemAnalytics(req, res, next) {
    try {
      const [uCount, cCount, iCount, peCount] = await Promise.all([
        db.query('SELECT COUNT(*) FROM users'),
        db.query('SELECT COUNT(*) FROM content'),
        db.query('SELECT COUNT(*) FROM interactions'),
        db.query('SELECT COUNT(*) FROM persona_events')
      ]);

      res.json({
        success: true,
        data: {
          totalUsers: parseInt(uCount.rows[0]?.count || 0, 10),
          totalContentItems: parseInt(cCount.rows[0]?.count || 0, 10),
          totalInteractionsRecorded: parseInt(iCount.rows[0]?.count || 0, 10),
          totalPersonaAdaptations: parseInt(peCount.rows[0]?.count || 0, 10)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
