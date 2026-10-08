// Recommendation scoring algorithms adhering strictly to Requirements 15, 16, 17, 18, 19, 20, 21

const DIFFICULTY_MAP = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

// 1. Goal Match (Requirement 16)
function calculateGoalMatch(goal, content) {
  if (!goal) return 50;
  const goalLower = goal.toLowerCase();
  const titleLower = (content.title || '').toLowerCase();
  const descLower = (content.description || '').toLowerCase();
  const topicLower = (content.topic || '').toLowerCase();
  const tags = (content.tags || []).map(t => String(t).toLowerCase());

  // Direct keywords: "full-stack", "developer", "backend", "frontend", etc.
  const keywords = goalLower.split(/\s+/).filter(w => w.length > 3);
  let keywordHits = 0;
  for (const kw of keywords) {
    if (titleLower.includes(kw) || descLower.includes(kw) || topicLower.includes(kw) || tags.includes(kw)) {
      keywordHits++;
    }
  }

  // 100: directly supports active goal
  if (keywordHits >= 2 || (goalLower.includes('full-stack') && (tags.includes('full-stack') || tags.includes('react') || tags.includes('node.js')))) {
    return 100;
  }
  // 75: strongly supports a sub-skill of the goal
  if (keywordHits >= 1 || tags.includes('apis') || tags.includes('postgresql') || tags.includes('javascript')) {
    return 75;
  }
  // 50: indirectly useful
  if (content.category === 'Core JavaScript' || content.category === 'DevOps') {
    return 50;
  }
  // 25: weak relationship
  if (content.category === 'System Design' && goalLower.includes('beginner')) {
    return 25;
  }
  return 30;
}

// 2. Skill Match (Requirement 17)
function calculateSkillMatch(userSkillLevel, contentDifficulty, struggleAreas = [], topic = '') {
  const uLevel = DIFFICULTY_MAP[userSkillLevel] || 1;
  const cLevel = DIFFICULTY_MAP[contentDifficulty] || 1;
  const diff = Math.abs(uLevel - cLevel);

  let score = 50;
  if (diff === 0) {
    score = 100; // same level
  } else if (uLevel > cLevel && diff === 1) {
    score = 85; // one level easier
  } else if (cLevel > uLevel && diff === 1) {
    score = 80; // one level harder
  } else {
    score = Math.max(30, 50 - (diff - 2) * 20); // 2 or more levels away
  }

  // If topic is in struggle areas, slightly increase appropriate practice content (Req 17)
  const isStruggle = struggleAreas.some(sa => sa.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(sa.toLowerCase()));
  if (isStruggle) {
    score = Math.min(100, score + 15);
  }

  return score;
}

// 3. Interest Match (Requirement 18)
function calculateInterestMatch(recentInterests = [], explicitInterests = [], content) {
  const allUserInterests = Array.from(new Set([
    ...(recentInterests || []),
    ...(explicitInterests || [])
  ])).map(i => i.toLowerCase());

  if (allUserInterests.length === 0) return 50;

  const contentTags = (content.tags || []).map(t => String(t).toLowerCase());
  const topic = (content.topic || '').toLowerCase();
  const category = (content.category || '').toLowerCase();

  let overlapCount = 0;
  for (const interest of allUserInterests) {
    if (contentTags.includes(interest) || topic.includes(interest) || category.includes(interest)) {
      overlapCount++;
    }
  }

  const ratio = Math.min(1.0, overlapCount / Math.max(1, Math.min(3, allUserInterests.length)));
  return Math.round(ratio * 100);
}

// 4. Context Match (Requirement 14: Context weight 20%)
function calculateContextMatch(currentContext, content) {
  if (!currentContext) return 50;
  const meta = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : (content.metadata || {});
  const supportedContexts = meta.supportedContexts || [];

  if (supportedContexts.includes(currentContext)) {
    return 100;
  }

  // Context heuristic matches
  if (currentContext === 'Building Project') {
    if (content.content_type === 'interactive_project' || content.category === 'Full-Stack' || content.category === 'Backend') return 90;
    if (content.content_type === 'exercise') return 75;
    return 35;
  }

  if (currentContext === 'Interview Preparation') {
    if (content.content_type === 'interview_prep' || content.category === 'System Design' || content.category === 'Core JavaScript') return 95;
    if (content.difficulty === 'intermediate' || content.difficulty === 'advanced') return 70;
    return 30;
  }

  if (currentContext === 'Exam Preparation') {
    if (content.category === 'Core JavaScript' || content.content_type === 'exercise') return 90;
    return 50;
  }

  if (currentContext === 'Career Planning') {
    if (content.category === 'Career' || content.category === 'DevOps') return 90;
    return 45;
  }

  // Default 'Learning' context
  return 80;
}

// 5. Preference Match (Requirement 19)
function calculatePreferenceMatch(learningStyle, preferredLength, availableTime, content) {
  let score = 70;

  // Learning style
  if (learningStyle === 'hands-on') {
    if (content.content_type === 'interactive_project' || content.content_type === 'exercise') score += 20;
    else if (content.content_type === 'deep_dive') score -= 10;
  } else if (learningStyle === 'visual') {
    score += 15;
  }

  // Duration match with available time
  const dur = content.duration || 30;
  if (availableTime) {
    if (dur <= availableTime) {
      score += 10;
    } else if (dur > availableTime * 1.5) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// 6. Feedback Signal & Recency Decay (Requirements 20 & 21)
function calculateFeedbackSignal(feedbackRecords = [], contentId) {
  // If no feedback recorded for this content, neutral baseline is 50
  const relevant = feedbackRecords.filter(f => f.content_id === contentId);
  if (relevant.length === 0) return 50;

  let totalSignal = 50;

  for (const item of relevant) {
    const ageDays = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 3600 * 24);
    // Recency multiplier (Requirement 21)
    let decay = 0.25;
    if (ageDays <= 7) decay = 1.0;
    else if (ageDays <= 30) decay = 0.75;
    else if (ageDays <= 90) decay = 0.50;

    let delta = 0;
    const fb = item.feedback;
    if (fb === 'useful') delta = 50;
    else if (fb === 'not_useful') delta = -50;
    else if (fb === 'too_easy') delta = -20;
    else if (fb === 'too_difficult') delta = -20;
    else if (fb === 'already_know_this') delta = -30;
    else if (fb === 'too_long') delta = -25;
    else if (fb === 'not_practical') delta = -30;

    totalSignal += delta * decay;
  }

  return Math.max(0, Math.min(100, Math.round(totalSignal)));
}

// Final formula (Requirement 15)
function calculateFinalScore({
  goalMatch,
  skillMatch,
  interestMatch,
  contextMatch,
  preferenceMatch,
  feedbackSignal
}) {
  const finalScore =
    (goalMatch * 0.25) +
    (skillMatch * 0.20) +
    (interestMatch * 0.15) +
    (contextMatch * 0.20) +
    (preferenceMatch * 0.10) +
    (feedbackSignal * 0.10);

  return Math.round(Math.max(0, Math.min(100, finalScore)));
}

module.exports = {
  calculateGoalMatch,
  calculateSkillMatch,
  calculateInterestMatch,
  calculateContextMatch,
  calculatePreferenceMatch,
  calculateFeedbackSignal,
  calculateFinalScore
};
