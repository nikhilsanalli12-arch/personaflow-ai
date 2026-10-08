const db = require('../db');
const { v4: uuidv4 } = require('uuid');

async function recordPersonaEvent({
  userId,
  eventType,
  fieldName,
  oldValue,
  newValue,
  reason,
  confidence = 80
}) {
  const eventId = uuidv4();
  const sql = `
    INSERT INTO persona_events (id, user_id, event_type, field_name, old_value, new_value, reason, confidence, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const params = [
    eventId,
    userId,
    eventType,
    fieldName,
    JSON.stringify(oldValue),
    JSON.stringify(newValue),
    reason,
    confidence
  ];

  const res = await db.query(sql, params);
  return res.rows[0];
}

async function getPersonaEvents(userId, limit = 50) {
  const sql = `
    SELECT id, user_id, event_type, field_name, old_value, new_value, reason, confidence, created_at
    FROM persona_events
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const res = await db.query(sql, [userId, limit]);
  const safeParse = (val) => {
    if (typeof val !== 'string') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  };

  return res.rows.map(row => ({
    ...row,
    oldValue: safeParse(row.old_value),
    newValue: safeParse(row.new_value)
  }));
}

module.exports = {
  recordPersonaEvent,
  getPersonaEvents
};
