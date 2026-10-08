const AIProvider = require('./AIProvider');

class FallbackProvider extends AIProvider {
  async generateChatResponse(message, context) {
    const {
      goal = 'Become a full-stack developer',
      skillLevel = 'intermediate',
      currentFocus = 'Full-Stack Project',
      currentContext = 'Building Project',
      learningStyle = 'hands-on',
      struggleAreas = [],
      recentInterests = [],
      availableTime = 30
    } = context || {};

    const lower = message.toLowerCase();
    let answer = '';
    const suggestedActions = [];
    const personalizationUsed = [];

    personalizationUsed.push(`Active Goal: ${goal}`);
    personalizationUsed.push(`Current Context: ${currentContext}`);
    personalizationUsed.push(`Assessed Skill: ${skillLevel}`);

    if (struggleAreas && struggleAreas.length > 0) {
      personalizationUsed.push(`Targeted Struggle Area: ${struggleAreas[0]}`);
    }

    if (lower.includes('interview') || currentContext === 'Interview Preparation') {
      answer = `Preparing for your full-stack journey requires targeting the exact intersections of your current focus: **${currentFocus}** and your recent work with **${recentInterests.join(', ') || 'React and Node.js'}**.\n\n` +
        `Given your **${skillLevel}** level, interviewers will evaluate both architectural tradeoffs and implementation depth. ` +
        (struggleAreas.length > 0
          ? `Because **${struggleAreas.join(' and ')}** has been a recent challenge, prioritize reviewing JWT claim validation and Express middleware ordering before diving into broad system design questions.\n\n`
          : `Focus on explaining data flow across the client, API layer, and database with clear idempotency and error handling principles.\n\n`) +
        `**Recommended 3-step action for your ${availableTime}-minute focus block:**\n` +
        `1. Drill core REST design patterns and HTTP status codes (200, 201, 401 vs 403).\n` +
        `2. Write a minimal Express middleware that extracts and verifies Bearer tokens.\n` +
        `3. Explain your database schema decisions and indexing strategies out loud.`;

      suggestedActions.push('Review React/Node/Database Interview Questions');
      suggestedActions.push('Practice Authorization with Middleware');
      suggestedActions.push('Conduct mock system design walkthrough');
    } else if (lower.includes('auth') || lower.includes('security') || (struggleAreas.length > 0 && lower.includes('struggle'))) {
      answer = `Let's break down **${struggleAreas[0] || 'Authorization & Middleware'}** using your preferred **${learningStyle}** learning approach.\n\n` +
        `The most critical distinction to keep clear is:\n` +
        `- **Authentication (401)**: "Who are you?" (Validated once by verifying the signed JWT signature).\n` +
        `- **Authorization (403)**: "Are you permitted to execute this action?" (Evaluated per route using user roles or permission claims attached to req.user).\n\n` +
        `In an Express app, make sure your auth middleware runs immediately before your controller, like: \`app.post('/admin', authenticateToken, requireAdmin, controller)\`.\n` +
        `This ensures unauthenticated requests never reach controller business logic.`;

      suggestedActions.push('Open Authorization with Middleware practice lab');
      suggestedActions.push('Retake JWT & Middleware Check quiz');
      suggestedActions.push('Inspect Express route ordering code');
    } else {
      answer = `Considering your active goal to **${goal}** in the **${currentContext}** mode:\n\n` +
        `You are currently working at an **${skillLevel}** level with an emphasis on **${currentFocus}**. ` +
        (learningStyle === 'hands-on' ? `Since you prefer **hands-on** learning, ` : `According to your learning profile, `) +
        `the most effective approach right now is to build end-to-end features rather than reading abstract theory.\n\n` +
        `With **${availableTime} minutes** available, focusing on your recent interests (${recentInterests.slice(0, 3).join(', ')}) will give you direct progress towards your goals.`;

      suggestedActions.push('Continue Building a Full-Stack Project');
      suggestedActions.push('Review REST API Design conventions');
      suggestedActions.push('Test your knowledge with a Quick Quiz');
    }

    return {
      answer,
      suggestedActions,
      personalizationUsed,
      confidence: 90
    };
  }

  async extractSignalsFromText(text, context) {
    const lower = text.toLowerCase();
    const signals = [];

    if (lower.includes('react')) signals.push({ type: 'interest', value: 'React', confidence: 85, reason: 'Mentioned React directly' });
    if (lower.includes('node') || lower.includes('express')) signals.push({ type: 'interest', value: 'Node.js', confidence: 85, reason: 'Mentioned backend Node.js' });
    if (lower.includes('sql') || lower.includes('postgres')) signals.push({ type: 'interest', value: 'PostgreSQL', confidence: 80, reason: 'Referenced relational databases' });
    if (lower.includes('auth') || lower.includes('jwt') || lower.includes('security')) signals.push({ type: 'interest', value: 'Authentication', confidence: 85, reason: 'Discussed security/auth concepts' });
    if (lower.includes('confused') || lower.includes('stuck') || lower.includes('hard') || lower.includes('error')) {
      signals.push({ type: 'struggle', value: 'API Authentication Flow', confidence: 75, reason: 'Indicated difficulty with concept' });
    }

    return signals;
  }
}

module.exports = FallbackProvider;
