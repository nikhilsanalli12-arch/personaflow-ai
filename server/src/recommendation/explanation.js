// Deterministic explanation generator adhering strictly to Contract H and Requirement 23, 24

function generateRecommendationReasons({
  content,
  persona,
  scores,
  feedbackHistory
}) {
  const reasons = [];
  const { goalMatch, skillMatch, interestMatch, contextMatch, preferenceMatch, feedbackSignal } = scores;

  // 1. Goal match
  if (goalMatch >= 75) {
    reasons.push(`Directly advances your goal: "${persona.goal || 'Full-Stack Development'}"`);
  } else if (goalMatch >= 50) {
    reasons.push(`Provides supporting foundational skills for your active learning path`);
  }

  // 2. Context match
  if (contextMatch >= 80) {
    reasons.push(`Tailored specifically for your active "${persona.currentContext}" mode`);
  }

  // 3. Struggle area check (High priority explanation)
  const isStruggleTopic = (persona.struggleAreas || []).some(sa =>
    (content.topic || '').toLowerCase().includes(sa.toLowerCase()) ||
    sa.toLowerCase().includes((content.topic || '').toLowerCase())
  );
  if (isStruggleTopic) {
    reasons.push(`Strengthens "${content.topic}", which PersonaFlow identified as a recent struggle area`);
  }

  // 4. Interest match
  if (interestMatch >= 60) {
    reasons.push(`Aligns with your recent activity in ${content.topic}`);
  }

  // 5. Skill match
  if (skillMatch >= 85) {
    reasons.push(`Calibrated to your assessed ${persona.skillLevel} proficiency level`);
  } else if (skillMatch >= 75) {
    reasons.push(`Provides a gentle step-up challenge from your current skill baseline`);
  }

  // 6. Learning style & preferences
  if (preferenceMatch >= 75 && persona.learningStyle === 'hands-on' && (content.content_type === 'interactive_project' || content.content_type === 'exercise')) {
    reasons.push(`Matches your preference for hands-on, practical building`);
  }

  // 7. Feedback influence
  if (feedbackSignal > 60) {
    reasons.push(`Boosted based on your previous positive feedback on related modules`);
  } else if (feedbackSignal < 40) {
    reasons.push(`Adjusted based on your prior feedback preferences`);
  }

  // Fallback reason if list is empty
  if (reasons.length === 0) {
    reasons.push(`High-value curriculum module for modern software engineers`);
  }

  return reasons;
}

function buildWhyAmISeeingThis({
  content,
  persona,
  scores
}) {
  const isStruggle = (persona.struggleAreas || []).some(sa =>
    (content.topic || '').toLowerCase().includes(sa.toLowerCase()) ||
    sa.toLowerCase().includes((content.topic || '').toLowerCase())
  );

  return {
    contentId: content.id,
    contentTitle: content.title,
    finalScore: scores.finalScore,
    breakdown: [
      {
        criterion: 'Goal Match (25%)',
        score: scores.goalMatch,
        label: `Active Goal: ${persona.goal || 'Full-Stack Developer'}`
      },
      {
        criterion: 'Context Fit (20%)',
        score: scores.contextMatch,
        label: `Current Mode: ${persona.currentContext}`
      },
      {
        criterion: 'Skill Calibration (20%)',
        score: scores.skillMatch,
        label: `Assessed Level: ${persona.skillLevel} vs Content: ${content.difficulty}`
      },
      {
        criterion: 'Interest Alignment (15%)',
        score: scores.interestMatch,
        label: `Recent Interests: ${(persona.recentInterests || []).slice(0, 3).join(', ') || 'General'}`
      },
      {
        criterion: 'Learning Preference (10%)',
        score: scores.preferenceMatch,
        label: `Style: ${persona.learningStyle || 'hands-on'} (${content.duration}m)`
      },
      {
        criterion: 'Feedback Signal (10%)',
        score: scores.feedbackSignal,
        label: scores.feedbackSignal >= 50 ? 'Positive / Neutral Signal' : 'Negative Adjustment'
      }
    ],
    confidence: persona.confidence || 80,
    struggleAreaAddressed: isStruggle ? content.topic : null,
    provenance: persona.provenance
  };
}

module.exports = {
  generateRecommendationReasons,
  buildWhyAmISeeingThis
};
