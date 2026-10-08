const learningPathService = require('../services/learningPathService');

class LearningPathController {
  async getLearningPath(req, res, next) {
    try {
      const pathData = await learningPathService.getAdaptiveLearningPath(req.user.id);
      res.json({
        success: true,
        data: pathData
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LearningPathController();
