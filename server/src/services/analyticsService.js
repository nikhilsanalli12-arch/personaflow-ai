const db = require('../db');

class AnalyticsService {
  async getPersonalizationAnalytics(userId) {
    // 1. Fetch interaction events for user
    const intRes = await db.query(
      'SELECT id, event_type, context, feedback, created_at FROM interactions WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    const interactions = intRes.rows || [];

    // 2. Fetch persona events (timeline of changes)
    const peRes = await db.query(
      'SELECT id, event_type, field_name, confidence, created_at FROM persona_events WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    const personaEvents = peRes.rows || [];

    // 3. Fetch goals
    const goalRes = await db.query('SELECT * FROM goals WHERE user_id = $1', [userId]);
    const goals = goalRes.rows || [];

    // 4. Fetch recommendations feedback history
    const recRes = await db.query('SELECT status, feedback FROM recommendations WHERE user_id = $1', [userId]);
    const recs = recRes.rows || [];

    // --- Metric calculations derived directly from persisted data (Requirement 103) ---

    // A. Interaction event count by type
    const eventCounts = {};
    interactions.forEach(i => {
      eventCounts[i.event_type] = (eventCounts[i.event_type] || 0) + 1;
    });

    // B. Context usage frequency
    const contextUsage = {};
    interactions.forEach(i => {
      const c = i.context || 'Learning';
      contextUsage[c] = (contextUsage[c] || 0) + 1;
    });

    // C. Recommendation acceptance vs rejection
    let acceptedCount = 0;
    let rejectedCount = 0;
    let neutralFeedbackCount = 0;

    interactions.forEach(i => {
      if (i.feedback === 'useful' || i.event_type === 'feedback_positive') acceptedCount++;
      else if (i.feedback === 'not_useful' || i.feedback === 'too_easy' || i.feedback === 'too_difficult' || i.event_type === 'feedback_negative') rejectedCount++;
      else if (i.feedback) neutralFeedbackCount++;
    });

    // D. Persona adaptations over time
    const adaptationsTimeline = personaEvents.map(pe => ({
      date: new Date(pe.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      confidence: parseFloat(pe.confidence || 75),
      eventType: pe.event_type,
      fieldName: pe.field_name
    }));

    // E. Average goal completion
    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
      : 0;

    // F. Weekly interaction activity (group by last 7 days)
    const daysMap = {};
    for (let d = 6; d >= 0; d--) {
      const dateKey = new Date(Date.now() - d * 86400000).toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[dateKey] = 0;
    }
    interactions.forEach(i => {
      const dKey = new Date(i.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (daysMap[dKey] !== undefined) {
        daysMap[dKey] += 1;
      }
    });
    const activityTrend = Object.keys(daysMap).map(day => ({
      day,
      interactions: daysMap[day]
    }));

    return {
      totalInteractions: interactions.length,
      personaEvolutionEventsCount: personaEvents.length,
      goalsTracked: goals.length,
      averageGoalProgress: avgGoalProgress,
      recommendationMetrics: {
        totalFeedbackLogged: acceptedCount + rejectedCount + neutralFeedbackCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        acceptanceRate: (acceptedCount + rejectedCount) > 0
          ? Math.round((acceptedCount / (acceptedCount + rejectedCount)) * 100)
          : 100
      },
      contextUsageDistribution: Object.keys(contextUsage).map(name => ({
        name,
        value: contextUsage[name]
      })),
      activityTrend,
      adaptationsTimeline
    };
  }
}

module.exports = new AnalyticsService();
