const db = require('../db');

class ContentController {
  async getAllContent(req, res, next) {
    try {
      const { category, topic, difficulty, search } = req.query;
      let sql = 'SELECT * FROM content WHERE 1=1';
      const params = [];

      if (category) {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      if (topic) {
        params.push(topic);
        sql += ` AND topic = $${params.length}`;
      }
      if (difficulty) {
        params.push(difficulty);
        sql += ` AND difficulty = $${params.length}`;
      }
      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
      }

      sql += ' ORDER BY created_at ASC';

      const contentRes = await db.query(sql, params);
      const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));

      const items = (contentRes.rows || []).map(item => ({
        ...item,
        tags: parse(item.tags, []),
        metadata: parse(item.metadata, {})
      }));

      res.json({
        success: true,
        data: { content: items }
      });
    } catch (err) {
      next(err);
    }
  }

  async getContentById(req, res, next) {
    try {
      const { id } = req.params;
      const resItem = await db.query('SELECT * FROM content WHERE id = $1', [id]);
      if (!resItem.rows || resItem.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Content item not found' }
        });
      }

      const item = resItem.rows[0];
      const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));

      res.json({
        success: true,
        data: {
          content: {
            ...item,
            tags: parse(item.tags, []),
            metadata: parse(item.metadata, {})
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ContentController();
