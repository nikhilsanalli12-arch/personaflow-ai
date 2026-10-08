const recommendationEngine = require('../recommendation/recommendationEngine');
const { recommendationFeedbackSchema } = require('../validators/miscValidators');
const db = require('../db');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const recommendations = await recommendationEngine.getRecommendations(req.user.id, limit);

      res.json({
        success: true,
        data: { recommendations }
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshRecommendations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const recommendations = await recommendationEngine.getRecommendations(req.user.id, limit);

      res.json({
        success: true,
        data: {
          recommendations,
          message: 'Recommendations freshly recalculated and ranked with latest behavioral signals'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req, res, next) {
    try {
      const { id: contentId } = req.params;
      const { feedback, notes } = recommendationFeedbackSchema.parse(req.body);

      const result = await recommendationEngine.submitFeedback(req.user.id, contentId, feedback, notes);

      // Re-fetch updated recommendations
      const refreshed = await recommendationEngine.getRecommendations(req.user.id);

      res.json({
        success: true,
        data: {
          ...result,
          recommendations: refreshed
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async openRecommendation(req, res, next) {
    try {
      const { id: contentId } = req.params;
      await db.query(
        "UPDATE recommendations SET status = 'opened' WHERE user_id = $1 AND content_id = $2",
        [req.user.id, contentId]
      );

      // Record interaction
      await db.query(
        `INSERT INTO interactions (id, user_id, event_type, content_id, created_at)
         VALUES (gen_random_uuid(), $1, 'recommendation_click', $2, CURRENT_TIMESTAMP)`,
        [req.user.id, contentId]
      );

      res.json({
        success: true,
        data: { message: 'Recommendation marked as opened' }
      });
    } catch (err) {
      next(err);
    }
  }

  async dismissRecommendation(req, res, next) {
    try {
      const { id: contentId } = req.params;
      await db.query(
        "UPDATE recommendations SET status = 'dismissed' WHERE user_id = $1 AND content_id = $2",
        [req.user.id, contentId]
      );

      // Log interaction
      await db.query(
        `INSERT INTO interactions (id, user_id, event_type, content_id, created_at)
         VALUES (gen_random_uuid(), $1, 'recommendation_reject', $2, CURRENT_TIMESTAMP)`,
        [req.user.id, contentId]
      );

      res.json({
        success: true,
        data: { message: 'Recommendation dismissed' }
      });
    } catch (err) {
      next(err);
    }
  }

  // Requirement 36: Before/After Personalization comparison
  async getComparison(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 5;
      const [personalized, baseline] = await Promise.all([
        recommendationEngine.getRecommendations(req.user.id, limit),
        recommendationEngine.getGenericBaseline(req.user.id, limit)
      ]);

      res.json({
        success: true,
        data: {
          personalized,
          genericBaseline: baseline,
          explanation:
            'Generic recommendations only reflect static category baselines. PersonaFlow personalized recommendations dynamically adapt based on active goals, live context mode, assessed skill level, and detected struggle areas.'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecommendationController();
