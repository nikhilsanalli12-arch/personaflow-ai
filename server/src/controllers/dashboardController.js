const personaEngine = require('../personalization/personaEngine');
const recommendationEngine = require('../recommendation/recommendationEngine');
const goalService = require('../services/goalService');
const analyticsService = require('../services/analyticsService');
const { getPersonaEvents } = require('../personalization/personaEvents');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      // Parallel retrieval of real aggregated database records (Requirements 80, 96, 103)
      const [persona, recommendations, goals, analytics, events] = await Promise.all([
        personaEngine.getPersona(userId),
        recommendationEngine.getRecommendations(userId, 6),
        goalService.getGoals(userId),
        analyticsService.getPersonalizationAnalytics(userId),
        getPersonaEvents(userId, 5)
      ]);

      const primaryGoal = goals.length > 0 ? goals[0] : null;

      res.json({
        success: true,
        data: {
          user: req.user,
          persona,
          context: persona ? persona.currentContext : 'Learning',
          skillLevel: persona ? persona.skillLevel : 'beginner',
          currentFocus: persona ? persona.currentFocus : 'Full-Stack Development',
          primaryGoal,
          allGoals: goals,
          recommendations,
          confidence: persona ? persona.confidence : 75,
          struggleAreas: persona ? persona.struggleAreas : [],
          recentInterests: persona ? persona.recentInterests : [],
          recentPersonaChanges: events.map(e => ({
            id: e.id,
            eventType: e.event_type,
            field: e.field_name,
            reason: e.reason,
            confidence: e.confidence,
            timestamp: e.created_at
          })),
          analyticsSummary: {
            totalInteractions: analytics.totalInteractions,
            acceptanceRate: analytics.recommendationMetrics.acceptanceRate,
            averageGoalProgress: analytics.averageGoalProgress
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
