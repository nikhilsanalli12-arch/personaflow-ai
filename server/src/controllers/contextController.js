const { VALID_CONTEXTS, switchContext } = require('../personalization/contextEngine');
const personaEngine = require('../personalization/personaEngine');
const recommendationEngine = require('../recommendation/recommendationEngine');
const { contextSwitchSchema } = require('../validators/interactionValidator');

class ContextController {
  async getContext(req, res, next) {
    try {
      const persona = await personaEngine.getPersona(req.user.id);
      res.json({
        success: true,
        data: {
          currentContext: persona ? persona.currentContext : 'Learning',
          availableContexts: VALID_CONTEXTS
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Requirement 13: Context Switching
  async switchContext(req, res, next) {
    try {
      const { context: newContext } = contextSwitchSchema.parse(req.body);
      const reason = req.body.reason || `Switched context mode to ${newContext}`;

      // 1. Switch context and log events
      const switchResult = await switchContext(req.user.id, newContext, reason);

      // 2. Immediately recalculate recommendations with new context weights (Requirement 13)
      const recommendations = await recommendationEngine.getRecommendations(req.user.id);

      // 3. Load refreshed persona
      const persona = await personaEngine.getPersona(req.user.id);

      res.json({
        success: true,
        data: {
          currentContext: newContext,
          previousContext: switchResult.previousContext,
          persona,
          recommendations,
          message: `Active context shifted to ${newContext}. Recommendations dynamically recalibrated.`
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ContextController();
