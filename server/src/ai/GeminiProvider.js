const axios = require('axios');
const { z } = require('zod');
const AIProvider = require('./AIProvider');
const FallbackProvider = require('./FallbackProvider');
const config = require('../config');

// Zod schema for structured output (Requirement 54, Contract L)
const aiResponseSchema = z.object({
  answer: z.string().min(1),
  suggestedActions: z.array(z.string()).default([]),
  personalizationUsed: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).default(85)
});

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.fallback = new FallbackProvider();
  }

  async generateChatResponse(message, context) {
    if (!config.geminiApiKey) {
      return this.fallback.generateChatResponse(message, context);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;

      const systemPrompt = `You are PersonaFlow AI, an intelligent adaptive learning and career co-pilot.
ADHERE STRICTLY TO THE USER PERSONALIZATION CONTEXT:
- Active Goal: ${context.goal || 'General development'}
- Skill Level: ${context.skillLevel || 'intermediate'}
- Current Context: ${context.currentContext || 'Learning'}
- Focus: ${context.currentFocus || 'Full-Stack Project'}
- Learning Style: ${context.learningStyle || 'hands-on'}
- Struggle Areas: ${(context.struggleAreas || []).join(', ') || 'None identified yet'}
- Recent Interests: ${(context.recentInterests || []).join(', ') || 'None'}
- Available Time: ${context.availableTime || 30} minutes

You must return valid JSON ONLY with this exact structure:
{
  "answer": "Clear, contextual, supportive answer formatted in markdown",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"],
  "personalizationUsed": ["What persona attribute influenced this response"],
  "confidence": 85
}`;

      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        },
        { timeout: 10000 }
      );

      const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(candidate);
      const validated = aiResponseSchema.parse(parsed);
      return validated;
    } catch (err) {
      console.warn('Gemini API call failed or timed out, utilizing deterministic fallback provider:', err.message);
      return this.fallback.generateChatResponse(message, context);
    }
  }

  async extractSignalsFromText(text, context) {
    if (!config.geminiApiKey) {
      return this.fallback.extractSignalsFromText(text, context);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
      const prompt = `Analyze this user statement for non-sensitive behavioral signals (interest, skill, struggle, preference).
Context: ${JSON.stringify(context)}
Statement: "${text}"

Return JSON matching:
{
  "signals": [
    { "type": "interest|skill|struggle|preference", "value": "string", "confidence": 0-100, "reason": "string" }
  ]
}`;

      const response = await axios.post(
        url,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        },
        { timeout: 8000 }
      );

      const parsed = JSON.parse(response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"signals":[]}');
      return parsed.signals || [];
    } catch (err) {
      return this.fallback.extractSignalsFromText(text, context);
    }
  }
}

module.exports = GeminiProvider;
