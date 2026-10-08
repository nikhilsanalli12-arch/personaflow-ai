const db = require('../db');
const { updatePersonaState } = require('../personalization/personaUpdater');
const { v4: uuidv4 } = require('uuid');

class GoalService {
  async getGoals(userId) {
    const res = await db.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY priority DESC, created_at DESC',
      [userId]
    );
    return res.rows || [];
  }

  async createGoal(userId, goalData) {
    const goalId = uuidv4();
    const { title, description = '', priority = 'high', targetDate = null } = goalData;

    const res = await db.query(
      `INSERT INTO goals (id, user_id, title, description, status, priority, progress, target_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'in_progress', $5, 0, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [goalId, userId, title, description, priority, targetDate]
    );

    // Goal change interaction (Requirement 47)
    await this._triggerGoalChangeEffects(userId, title, 'Created new active goal');

    return res.rows[0];
  }

  async updateGoal(userId, goalId, updates) {
    const existingRes = await db.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
    if (!existingRes.rows || existingRes.rows.length === 0) {
      throw new Error('Goal not found or unauthorized');
    }

    const current = existingRes.rows[0];
    const title = updates.title !== undefined ? updates.title : current.title;
    const description = updates.description !== undefined ? updates.description : current.description;
    const status = updates.status !== undefined ? updates.status : current.status;
    const priority = updates.priority !== undefined ? updates.priority : current.priority;
    const progress = updates.progress !== undefined ? updates.progress : current.progress;
    const targetDate = updates.targetDate !== undefined ? updates.targetDate : current.target_date;

    const res = await db.query(
      `UPDATE goals
       SET title = $1, description = $2, status = $3, priority = $4, progress = $5, target_date = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, status, priority, progress, targetDate, goalId, userId]
    );

    if (updates.title && updates.title !== current.title) {
      await this._triggerGoalChangeEffects(userId, updates.title, 'Updated goal title');
    }

    return res.rows[0];
  }

  async deleteGoal(userId, goalId) {
    const res = await db.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
    return res.rowCount > 0;
  }

  async _triggerGoalChangeEffects(userId, newGoalTitle, reason) {
    // 1. Interaction
    const interactionId = uuidv4();
    await db.query(
      `INSERT INTO interactions (id, user_id, event_type, metadata, created_at)
       VALUES ($1, $2, 'goal_change', $3, CURRENT_TIMESTAMP)`,
      [interactionId, userId, JSON.stringify({ goal: newGoalTitle, reason })]
    );

    // 2. Update persona
    await updatePersonaState(
      userId,
      {
        goal: newGoalTitle,
        currentFocus: newGoalTitle
      },
      reason
    );
  }
}

module.exports = new GoalService();
