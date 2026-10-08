const db = require('../db');
const { updatePersonaState } = require('./personaUpdater');
const { v4: uuidv4 } = require('uuid');

const VALID_CONTEXTS = [
  'Learning',
  'Building Project',
  'Interview Preparation',
  'Exam Preparation',
  'Career Planning'
];

async function switchContext(userId, newContext, reason = 'Direct user context mode selection') {
  if (!VALID_CONTEXTS.includes(newContext)) {
    throw new Error(`Invalid context mode: ${newContext}`);
  }

  // 1. Log context_change interaction
  const interactionId = uuidv4();
  await db.query(
    `INSERT INTO interactions (id, user_id, event_type, context, metadata, created_at)
     VALUES ($1, $2, 'context_change', $3, $4, CURRENT_TIMESTAMP)`,
    [interactionId, userId, newContext, JSON.stringify({ reason })]
  );

  // 2. Update persona state and create persona event
  const updatedPersona = await updatePersonaState(
    userId,
    {
      currentContext: newContext,
      contextReason: reason
    },
    reason
  );

  return {
    success: true,
    previousContext: updatedPersona ? (updatedPersona.current_context || updatedPersona.currentContext || 'Learning') : 'Learning',
    currentContext: newContext,
    personaVersion: updatedPersona ? updatedPersona.version : 1
  };
}

module.exports = {
  VALID_CONTEXTS,
  switchContext
};
