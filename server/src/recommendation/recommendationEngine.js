const db = require('../db');
const personaEngine = require('../personalization/personaEngine');
const {
  calculateGoalMatch,
  calculateSkillMatch,
  calculateInterestMatch,
  calculateContextMatch,
  calculatePreferenceMatch,
  calculateFeedbackSignal,
  calculateFinalScore
} = require('./scoring');
const { generateRecommendationReasons, buildWhyAmISeeingThis } = require('./explanation');
const { v4: uuidv4 } = require('uuid');

class RecommendationEngine {
  async getRecommendations(userId, limit = 10) {
    // 1. Fetch persona
    const persona = await personaEngine.getPersona(userId);
    if (!persona) throw new Error('User persona not found');

    // 2. Fetch all content
    const contentRes = await db.query('SELECT * FROM content ORDER BY created_at ASC');
    const allContent = contentRes.rows || [];

    // 3. Fetch user interactions to exclude completed content if redundant (Contract F)
    const interactionRes = await db.query(
      "SELECT content_id, event_type, feedback, created_at FROM interactions WHERE user_id = $1",
      [userId]
    );
    const interactions = interactionRes.rows || [];
    const completedContentIds = new Set(
      interactions.filter(i => i.event_type === 'complete_content').map(i => i.content_id)
    );

    // 4. Fetch user profile for explicit interests
    const profileRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0] || {};
    const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
    const explicitInterests = parse(profile.interests, []);

    // 5. Compute scores for each content item
    const scoredList = allContent.map(content => {
      const parsedTags = parse(content.tags, []);
      const parsedMetadata = parse(content.metadata, {});
      const normalizedContent = { ...content, tags: parsedTags, metadata: parsedMetadata };

      const goalMatch = calculateGoalMatch(persona.goal, normalizedContent);
      const skillMatch = calculateSkillMatch(
        persona.skillLevel,
        normalizedContent.difficulty,
        persona.struggleAreas,
        normalizedContent.topic
      );
      const interestMatch = calculateInterestMatch(
        persona.recentInterests,
        explicitInterests,
        normalizedContent
      );
      const contextMatch = calculateContextMatch(persona.currentContext, normalizedContent);
      const preferenceMatch = calculatePreferenceMatch(
        persona.learningStyle,
        persona.preferredContentLength,
        profile.available_time || 30,
        normalizedContent
      );
      const feedbackSignal = calculateFeedbackSignal(interactions, normalizedContent.id);

      const finalScore = calculateFinalScore({
        goalMatch,
        skillMatch,
        interestMatch,
        contextMatch,
        preferenceMatch,
        feedbackSignal
      });

      const scores = {
        goalMatch,
        skillMatch,
        interestMatch,
        contextMatch,
        preferenceMatch,
        feedbackSignal,
        finalScore
      };

      const reasons = generateRecommendationReasons({
        content: normalizedContent,
        persona,
        scores,
        feedbackHistory: interactions
      });

      const whyAmISeeingThis = buildWhyAmISeeingThis({
        content: normalizedContent,
        persona,
        scores
      });

      return {
        id: normalizedContent.id,
        contentId: normalizedContent.id,
        title: normalizedContent.title,
        description: normalizedContent.description,
        category: normalizedContent.category,
        topic: normalizedContent.topic,
        difficulty: normalizedContent.difficulty,
        contentType: normalizedContent.content_type,
        duration: normalizedContent.duration,
        tags: normalizedContent.tags,
        context: persona.currentContext,
        score: finalScore,
        scores,
        reasons,
        whyAmISeeingThis,
        isCompleted: completedContentIds.has(normalizedContent.id)
      };
    });

    // 6. Deterministic Sort (Requirement 22)
    // 1. finalScore DESC
    // 2. contextMatch DESC
    // 3. goalMatch DESC
    // 4. feedbackSignal DESC
    // 5. stable content ID ASC
    scoredList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.scores.contextMatch !== a.scores.contextMatch) return b.scores.contextMatch - a.scores.contextMatch;
      if (b.scores.goalMatch !== a.scores.goalMatch) return b.scores.goalMatch - a.scores.goalMatch;
      if (b.scores.feedbackSignal !== a.scores.feedbackSignal) return b.scores.feedbackSignal - a.scores.feedbackSignal;
      return String(a.id).localeCompare(String(b.id));
    });

    // Assign rank and persist into recommendations table (Contract E)
    const topRecommendations = scoredList.slice(0, limit).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    // Async save to DB recommendations table
    for (const rec of topRecommendations) {
      await db.query(
        `INSERT INTO recommendations (id, user_id, content_id, context, score, rank, reasons, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET score = $5, rank = $6, reasons = $7`,
        [
          rec.id, // using content id or uuid
          userId,
          rec.contentId,
          persona.currentContext,
          rec.score,
          rec.rank,
          JSON.stringify(rec.reasons)
        ]
      );
    }

    return topRecommendations;
  }

  // Generic Baseline (Requirement 36 & 37)
  // Calculated without behavioral personalization (no inferred struggles, no recent activity, neutral context)
  async getGenericBaseline(userId, limit = 10) {
    const contentRes = await db.query('SELECT * FROM content ORDER BY created_at ASC');
    const allContent = contentRes.rows || [];
    const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));

    // Baseline uses standard popularity / beginner-to-intermediate general ranking
    const baseline = allContent.map((content, idx) => {
      const parsedTags = parse(content.tags, []);
      let genericScore = 50;
      if (content.difficulty === 'beginner') genericScore = 75;
      else if (content.difficulty === 'intermediate') genericScore = 65;
      else genericScore = 50;

      return {
        id: content.id,
        contentId: content.id,
        title: content.title,
        description: content.description,
        category: content.category,
        topic: content.topic,
        difficulty: content.difficulty,
        contentType: content.content_type,
        duration: content.duration,
        tags: parsedTags,
        score: genericScore,
        reasons: ['Standard catalog baseline ranking based on general popularity and foundational skill level'],
        isPersonalized: false
      };
    });

    baseline.sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
    return baseline.slice(0, limit);
  }

  // Handle recommendation feedback (Requirements 20, 21, 75, Contract J)
  async submitFeedback(userId, contentId, feedbackType, notes = '') {
    const feedbackId = uuidv4();
    await db.query(
      `INSERT INTO interactions (id, user_id, event_type, content_id, feedback, metadata, created_at)
       VALUES ($1, $2, 'recommendation_feedback', $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        feedbackId,
        userId,
        contentId,
        feedbackType,
        JSON.stringify({ notes })
      ]
    );

    // Update recommendation table row
    await db.query(
      `UPDATE recommendations SET feedback = $1 WHERE user_id = $2 AND content_id = $3`,
      [feedbackType, userId, contentId]
    );

    // Send signal to persona engine
    const contentRes = await db.query('SELECT * FROM content WHERE id = $1', [contentId]);
    const content = contentRes.rows[0];
    await personaEngine.processInteraction(
      userId,
      {
        id: feedbackId,
        eventType: 'recommendation_feedback',
        contentId,
        feedback: feedbackType,
        metadata: { notes }
      },
      content
    );

    return { success: true, message: 'Feedback recorded and incorporated into personalization model' };
  }
}

module.exports = new RecommendationEngine();
