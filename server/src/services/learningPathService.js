const db = require('../db');
const personaEngine = require('../personalization/personaEngine');

class LearningPathService {
  async getAdaptiveLearningPath(userId) {
    const persona = await personaEngine.getPersona(userId);
    if (!persona) throw new Error('User persona not found');

    // 1. Fetch all curriculum content
    const contentRes = await db.query('SELECT * FROM content ORDER BY created_at ASC');
    const allContent = contentRes.rows || [];
    const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));

    // 2. Fetch completed content interactions and quiz attempts (Requirement 42)
    const intRes = await db.query(
      "SELECT content_id, event_type, metadata FROM interactions WHERE user_id = $1",
      [userId]
    );
    const interactions = intRes.rows || [];
    const completedSet = new Set(
      interactions.filter(i => i.event_type === 'complete_content').map(i => i.content_id)
    );

    const quizRes = await db.query("SELECT * FROM quiz_attempts WHERE user_id = $1 AND passed = true", [userId]);
    const passedTopics = new Set((quizRes.rows || []).map(q => q.topic.toLowerCase()));

    const struggleAreas = (persona.struggleAreas || []).map(s => s.toLowerCase());

    // 3. Score and order steps
    // Prerequisites / Core Foundations -> Practice / Struggles -> Advanced / Projects
    const pathSteps = allContent.map(item => {
      const parsedTags = parse(item.tags, []);
      const parsedMeta = parse(item.metadata, {});
      const topicLower = (item.topic || '').toLowerCase();
      const isCompleted = completedSet.has(item.id) || (passedTopics.has(topicLower) && item.difficulty === 'beginner');
      const isStruggleArea = struggleAreas.some(sa => sa.includes(topicLower) || topicLower.includes(sa));

      let stepPriority = 3; // normal
      let status = isCompleted ? 'completed' : 'upcoming';

      if (isStruggleArea) {
        stepPriority = 1; // highest priority intervention
      } else if (item.difficulty === persona.skillLevel) {
        stepPriority = 2; // current skill level
      } else if (item.difficulty === 'beginner' && persona.skillLevel !== 'beginner') {
        stepPriority = 4; // foundational / can skip
      }

      // Check current context fit
      const supportedContexts = parsedMeta.supportedContexts || [];
      const matchesContext = supportedContexts.includes(persona.currentContext);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        topic: item.topic,
        difficulty: item.difficulty,
        duration: item.duration,
        tags: parsedTags,
        contentType: item.content_type,
        status,
        isCompleted,
        isStruggleArea,
        matchesContext,
        stepPriority,
        reasons: isStruggleArea
          ? [`Critical Reinforcement: Identified struggle area (${item.topic})`]
          : matchesContext
          ? [`Directly aligns with your current "${persona.currentContext}" objective`]
          : [`Foundational curriculum milestone for ${persona.goal}`]
      };
    });

    // 4. Sort steps deterministically:
    // Status (in-progress/upcoming before completed)
    // Struggle areas first among incomplete
    // Step priority
    // Stable ID
    pathSteps.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (a.stepPriority !== b.stepPriority) return a.stepPriority - b.stepPriority;
      return String(a.id).localeCompare(String(b.id));
    });

    // Mark current active step
    const firstIncompleteIdx = pathSteps.findIndex(s => !s.isCompleted);
    if (firstIncompleteIdx >= 0) {
      pathSteps[firstIncompleteIdx].status = 'in_progress';
    }

    const completedCount = pathSteps.filter(s => s.isCompleted).length;
    const progressPercent = Math.round((completedCount / Math.max(1, pathSteps.length)) * 100);

    return {
      goal: persona.goal,
      currentSkillLevel: persona.skillLevel,
      currentContext: persona.currentContext,
      progress: progressPercent,
      totalModules: pathSteps.length,
      completedModules: completedCount,
      estimatedHoursRemaining: Math.round(
        pathSteps.filter(s => !s.isCompleted).reduce((sum, s) => sum + s.duration, 0) / 60 * 10
      ) / 10,
      steps: pathSteps
    };
  }
}

module.exports = new LearningPathService();
