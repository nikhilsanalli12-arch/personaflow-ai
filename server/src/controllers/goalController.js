const goalService = require('../services/goalService');
const { goalCreateSchema, goalUpdateSchema } = require('../validators/miscValidators');

class GoalController {
  async getGoals(req, res, next) {
    try {
      const goals = await goalService.getGoals(req.user.id);
      res.json({
        success: true,
        data: { goals }
      });
    } catch (err) {
      next(err);
    }
  }

  async createGoal(req, res, next) {
    try {
      const validated = goalCreateSchema.parse(req.body);
      const goal = await goalService.createGoal(req.user.id, validated);
      res.status(201).json({
        success: true,
        data: { goal, message: 'Goal established and persona aligned' }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateGoal(req, res, next) {
    try {
      const { id } = req.params;
      const validated = goalUpdateSchema.parse(req.body);
      const goal = await goalService.updateGoal(req.user.id, id, validated);
      res.json({
        success: true,
        data: { goal, message: 'Goal updated and learning path refreshed' }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      const { id } = req.params;
      await goalService.deleteGoal(req.user.id, id);
      res.json({
        success: true,
        data: { message: 'Goal removed successfully' }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new GoalController();
