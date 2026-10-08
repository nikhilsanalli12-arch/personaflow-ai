// Non-sensitive signal extraction from interaction events (Requirement 9, Contract B)

// Blocklist for sensitive categories (Requirement 9)
const SENSITIVE_KEYWORDS = [
  'race', 'religion', 'political', 'sexual', 'medical', 'health', 'ethnicity', 'caste'
];

function isSafeSignal(signal) {
  if (!signal || !signal.value) return false;
  const str = String(signal.value).toLowerCase();
  for (const blocked of SENSITIVE_KEYWORDS) {
    if (str.includes(blocked)) return false;
  }
  return true;
}

function extractSignalsFromInteraction(interaction, contentItem = null) {
  const signals = [];
  const { eventType, metadata = {}, feedback } = interaction;

  // 1. Quiz events (Contract C: Strong evidence)
  if (eventType === 'quiz_failure' || (eventType === 'quiz_attempt' && metadata.score < 50)) {
    const topic = metadata.topic || (contentItem && contentItem.topic) || 'Core Concepts';
    signals.push({
      type: 'struggle',
      value: topic,
      source: 'quiz',
      confidence: 75,
      reason: `Low quiz score (${metadata.score || 40}%) on topic ${topic}`,
      evidence: [interaction.id]
    });
  } else if (eventType === 'quiz_success' || (eventType === 'quiz_attempt' && metadata.score >= 85)) {
    const topic = metadata.topic || (contentItem && contentItem.topic) || 'Core Concepts';
    signals.push({
      type: 'skill',
      value: metadata.difficulty === 'intermediate' ? 'intermediate' : (metadata.difficulty === 'advanced' ? 'advanced' : 'beginner_mastery'),
      source: 'quiz',
      confidence: 85,
      reason: `Demonstrated mastery (${metadata.score || 90}%) on quiz for ${topic}`,
      evidence: [interaction.id]
    });
  }

  // 2. Feedback signals (Requirement 20)
  if (feedback) {
    if (feedback === 'too_difficult' || feedback.type === 'too_difficult') {
      const topic = (contentItem && contentItem.topic) || metadata.topic;
      if (topic) {
        signals.push({
          type: 'struggle',
          value: topic,
          source: 'feedback',
          confidence: 70,
          reason: `User reported content as too difficult for ${topic}`,
          evidence: [interaction.id]
        });
      }
    } else if (feedback === 'too_easy' || feedback.type === 'too_easy') {
      signals.push({
        type: 'difficulty',
        value: 'increase_difficulty',
        source: 'feedback',
        confidence: 75,
        reason: 'User marked content as too easy',
        evidence: [interaction.id]
      });
    } else if (feedback === 'useful' || feedback.type === 'useful') {
      if (contentItem && contentItem.topic) {
        signals.push({
          type: 'interest',
          value: contentItem.topic,
          source: 'feedback',
          confidence: 65,
          reason: `User found ${contentItem.topic} content useful`,
          evidence: [interaction.id]
        });
      }
    }
  }

  // 3. Content completion (Moderate evidence)
  if (eventType === 'complete_content' && contentItem) {
    signals.push({
      type: 'interest',
      value: contentItem.topic,
      source: 'interaction',
      confidence: 60,
      reason: `Completed comprehensive content in ${contentItem.topic}`,
      evidence: [interaction.id]
    });

    if (contentItem.difficulty === 'intermediate') {
      signals.push({
        type: 'skill',
        value: 'intermediate',
        source: 'interaction',
        confidence: 65,
        reason: `Successfully completed intermediate practical module in ${contentItem.title}`,
        evidence: [interaction.id]
      });
    }
  }

  // 4. Content views / bookmarks / clicks (Weak evidence: 40% confidence)
  if ((eventType === 'view_content' || eventType === 'bookmark' || eventType === 'recommendation_click') && contentItem) {
    signals.push({
      type: 'interest',
      value: contentItem.topic,
      source: 'interaction',
      confidence: 40,
      reason: `Engaged with ${contentItem.topic} resource`,
      evidence: [interaction.id]
    });
  }

  // 5. Context change event
  if (eventType === 'context_change') {
    const newContext = interaction.context || metadata.newContext;
    if (newContext) {
      signals.push({
        type: 'context',
        value: newContext,
        source: 'user',
        confidence: 100,
        reason: `Explicit context switch to ${newContext}`,
        evidence: [interaction.id]
      });
    }
  }

  return signals.filter(isSafeSignal);
}

module.exports = {
  extractSignalsFromInteraction,
  isSafeSignal
};
