const quizService = require('../services/quizService');
const { quizSubmitSchema } = require('../validators/miscValidators');

class QuizController {
  async getQuizzes(req, res, next) {
    try {
      const quizzes = await quizService.getQuizzes();
      res.json({
        success: true,
        data: { quizzes }
      });
    } catch (err) {
      next(err);
    }
  }

  async getQuizById(req, res, next) {
    try {
      const quiz = await quizService.getQuizById(req.params.id);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Quiz not found' }
        });
      }
      res.json({
        success: true,
        data: { quiz }
      });
    } catch (err) {
      next(err);
    }
  }

  async submitAttempt(req, res, next) {
    try {
      const validated = quizSubmitSchema.parse(req.body);
      const result = await quizService.submitQuizAttempt(req.user.id, validated.quizId, validated.answers);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await quizService.getUserQuizHistory(req.user.id);
      res.json({
        success: true,
        data: { history }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuizController();
