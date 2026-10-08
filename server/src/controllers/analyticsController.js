const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getPersonalizationAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getPersonalizationAnalytics(req.user.id);
      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
