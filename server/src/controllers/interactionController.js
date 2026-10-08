const db = require('../db');
const personaEngine = require('../personalization/personaEngine');
const { createInteractionSchema } = require('../validators/interactionValidator');
const { v4: uuidv4 } = require('uuid');

class InteractionController {
  async createInteraction(req, res, next) {
    try {
      const validated = createInteractionSchema.parse(req.body);
      const interactionId = uuidv4();

      let contentItem = null;
      if (validated.contentId) {
        const cRes = await db.query('SELECT * FROM content WHERE id = $1', [validated.contentId]);
        if (cRes.rows && cRes.rows.length > 0) contentItem = cRes.rows[0];
      }

      const resInsert = await db.query(
        `INSERT INTO interactions (id, user_id, event_type, content_id, context, metadata, feedback, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          interactionId,
          req.user.id,
          validated.eventType,
          validated.contentId || null,
          validated.context,
          JSON.stringify(validated.metadata),
          validated.feedback ? JSON.stringify(validated.feedback) : null
        ]
      );

      const created = resInsert.rows[0];

      // Process through persona engine
      const processResult = await personaEngine.processInteraction(req.user.id, created, contentItem);

      res.status(201).json({
        success: true,
        data: {
          interaction: created,
          personaUpdated: processResult ? processResult.updated : false
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getInteractions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const resList = await db.query(
        `SELECT id, user_id, event_type, content_id, context, metadata, feedback, created_at
         FROM interactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [req.user.id, limit]
      );

      const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
      const interactions = (resList.rows || []).map(r => ({
        ...r,
        metadata: parse(r.metadata, {}),
        feedback: parse(r.feedback, null)
      }));

      res.json({
        success: true,
        data: { interactions }
      });
    } catch (err) {
      next(err);
    }
  }

  // Requirement 35: Delete interaction history
  async deleteInteractions(req, res, next) {
    try {
      // 1. Delete owned interaction records
      await db.query('DELETE FROM interactions WHERE user_id = $1', [req.user.id]);

      // 2. Recalculate and reset inferred persona while preserving explicit profile data
      await personaEngine.resetPersona(req.user.id);

      res.json({
        success: true,
        data: {
          message: 'Interaction history successfully cleared and derived persona signals reset.'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InteractionController();
