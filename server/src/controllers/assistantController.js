const assistantService = require('../services/assistantService');
const { assistantMessageSchema } = require('../validators/miscValidators');

class AssistantController {
  async chat(req, res, next) {
    try {
      const { message } = assistantMessageSchema.parse(req.body);
      const result = await assistantService.handleUserChat(req.user.id, message);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssistantController();
