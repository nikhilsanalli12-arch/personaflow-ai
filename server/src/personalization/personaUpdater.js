const db = require('../db');
const { recordPersonaEvent } = require('./personaEvents');

async function updatePersonaState(userId, stateUpdates, reason = 'Automated behavior adaptation') {
  // 1. Fetch current persona state
  const currentRes = await db.query('SELECT * FROM persona_states WHERE user_id = $1', [userId]);
  if (!currentRes.rows || currentRes.rows.length === 0) {
    throw new Error(`Persona state for user ${userId} not found`);
  }
  const current = currentRes.rows[0];

  // If behavioral personalization is disabled, reject inferred updates (Req 34)
  if (!current.behavioral_personalization_enabled && stateUpdates.inferred) {
    return current;
  }

  const newVersion = (current.version || 1) + 1;
  const eventsToRecord = [];

  // Parse existing JSON fields
  const parseJson = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
  const currentStruggles = parseJson(current.struggle_areas, []);
  const currentInterests = parseJson(current.recent_interests, []);
  const currentSignals = parseJson(current.signals, []);

  let updatedSkill = current.skill_level;
  let updatedFocus = current.current_focus;
  let updatedStruggles = [...currentStruggles];
  let updatedInterests = [...currentInterests];
  let updatedSignals = stateUpdates.signals ? stateUpdates.signals : currentSignals;
  let updatedConfidence = stateUpdates.confidence !== undefined ? stateUpdates.confidence : current.confidence;
  let updatedContext = stateUpdates.currentContext || current.current_context;
  let updatedEngagement = current.engagement_level;

  // Check for skill level transition
  if (stateUpdates.skillLevel && stateUpdates.skillLevel !== current.skill_level) {
    eventsToRecord.push({
      fieldName: 'skill_level',
      eventType: 'skill_level_upgraded',
      oldValue: current.skill_level,
      newValue: stateUpdates.skillLevel,
      reason: stateUpdates.skillReason || 'Demonstrated consistent performance and completion',
      confidence: 85
    });
    updatedSkill = stateUpdates.skillLevel;
  }

  // Check for struggle areas addition
  if (stateUpdates.newStruggleArea) {
    const area = stateUpdates.newStruggleArea;
    if (!updatedStruggles.includes(area)) {
      eventsToRecord.push({
        fieldName: 'struggle_areas',
        eventType: 'struggle_area_detected',
        oldValue: [...currentStruggles],
        newValue: [...currentStruggles, area],
        reason: stateUpdates.struggleReason || `Low assessment performance on ${area}`,
        confidence: 78
      });
      updatedStruggles.push(area);
    }
  }

  // Check for recent interest addition
  if (stateUpdates.newInterest) {
    const item = stateUpdates.newInterest;
    if (!updatedInterests.includes(item)) {
      updatedInterests.unshift(item);
      if (updatedInterests.length > 5) updatedInterests = updatedInterests.slice(0, 5);
      eventsToRecord.push({
        fieldName: 'recent_interests',
        eventType: 'interest_expanded',
        oldValue: [...currentInterests],
        newValue: [...updatedInterests],
        reason: `Engaged with multiple modules on ${item}`,
        confidence: 80
      });
    }
  }

  // Check for context switch
  if (stateUpdates.currentContext && stateUpdates.currentContext !== current.current_context) {
    eventsToRecord.push({
      fieldName: 'current_context',
      eventType: 'context_switched',
      oldValue: current.current_context,
      newValue: stateUpdates.currentContext,
      reason: stateUpdates.contextReason || 'User switched active mode',
      confidence: 95
    });
    updatedContext = stateUpdates.currentContext;
  }

  // Check for focus change
  if (stateUpdates.currentFocus && stateUpdates.currentFocus !== current.current_focus) {
    eventsToRecord.push({
      fieldName: 'current_focus',
      eventType: 'focus_changed',
      oldValue: current.current_focus,
      newValue: stateUpdates.currentFocus,
      reason: stateUpdates.focusReason || 'Updated priority topic alignment',
      confidence: 85
    });
    updatedFocus = stateUpdates.currentFocus;
  }

  // Update engagement level
  if (stateUpdates.engagementLevel && stateUpdates.engagementLevel !== current.engagement_level) {
    updatedEngagement = stateUpdates.engagementLevel;
  }

  // Perform atomic update
  const sql = `
    UPDATE persona_states
    SET skill_level = $1,
        current_focus = $2,
        struggle_areas = $3,
        recent_interests = $4,
        current_context = $5,
        confidence = $6,
        signals = $7,
        version = $8,
        engagement_level = $9,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $10
    RETURNING *
  `;
  const params = [
    updatedSkill,
    updatedFocus,
    JSON.stringify(updatedStruggles),
    JSON.stringify(updatedInterests),
    updatedContext,
    updatedConfidence,
    JSON.stringify(updatedSignals),
    newVersion,
    updatedEngagement,
    userId
  ];

  const updateRes = await db.query(sql, params);

  // Record audit events
  for (const ev of eventsToRecord) {
    await recordPersonaEvent({
      userId,
      eventType: ev.eventType,
      fieldName: ev.fieldName,
      oldValue: ev.oldValue,
      newValue: ev.newValue,
      reason: ev.reason,
      confidence: ev.confidence
    });
  }

  return updateRes.rows[0];
}

module.exports = {
  updatePersonaState
};
