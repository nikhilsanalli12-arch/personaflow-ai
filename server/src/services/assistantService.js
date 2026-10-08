const db = require('../db');
const personaEngine = require('../personalization/personaEngine');
const GeminiProvider = require('../ai/GeminiProvider');
const { v4: uuidv4 } = require('uuid');

class AssistantService {
  constructor() {
    this.provider = new GeminiProvider();
  }

  async handleUserChat(userId, message) {
    // 1. Load active persona (Requirement 50)
    const persona = await personaEngine.getPersona(userId);
    if (!persona) throw new Error('User persona not found');

    // 2. Load explicit user profile
    const profRes = await db.query('SELECT available_time, preferences FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = profRes.rows[0] || {};

    // 3. Load recent interactions (last 5 non-sensitive events)
    const intRes = await db.query(
      'SELECT event_type, context, metadata, created_at FROM interactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );
    const recentActivity = (intRes.rows || []).map(r => ({
      type: r.event_type,
      context: r.context,
      summary: r.metadata ? JSON.stringify(r.metadata) : ''
    }));

    // 4. Construct safe personalization context (Requirement 50, Contract K)
    const personalizationContext = {
      goal: persona.goal,
      skillLevel: persona.skillLevel,
      currentFocus: persona.currentFocus,
      currentContext: persona.currentContext,
      learningStyle: persona.learningStyle,
      recentInterests: persona.recentInterests,
      struggleAreas: persona.struggleAreas,
      preferredContentLength: persona.preferredContentLength,
      availableTime: profile.available_time || 30,
      relevantRecentActivity: recentActivity
    };

    // 5. Generate AI response via Gemini Provider
    const aiResponse = await this.provider.generateChatResponse(message, personalizationContext);

    // 6. Record interaction event
    const interactionId = uuidv4();
    await db.query(
      `INSERT INTO interactions (id, user_id, event_type, context, metadata, created_at)
       VALUES ($1, $2, 'ask_question', $3, $4, CURRENT_TIMESTAMP)`,
      [
        interactionId,
        userId,
        persona.currentContext,
        JSON.stringify({
          questionLength: message.length,
          confidence: aiResponse.confidence,
          personalizationApplied: aiResponse.personalizationUsed
        })
      ]
    );

    return {
      success: true,
      data: {
        message: aiResponse.answer,
        suggestedActions: aiResponse.suggestedActions,
        personalizationUsed: aiResponse.personalizationUsed,
        confidence: aiResponse.confidence,
        contextMode: persona.currentContext,
        skillLevel: persona.skillLevel
      }
    };
  }
}

module.exports = new AssistantService();
