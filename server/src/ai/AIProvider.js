// Abstract base AIProvider class (Requirement 52, Contract W)
class AIProvider {
  async generateChatResponse(message, context) {
    throw new Error('generateChatResponse must be implemented by subclass');
  }

  async extractSignalsFromText(text, context) {
    throw new Error('extractSignalsFromText must be implemented by subclass');
  }
}

module.exports = AIProvider;
