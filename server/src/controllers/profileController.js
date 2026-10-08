const db = require('../db');
const { profileUpdateSchema } = require('../validators/authValidator');
const { updatePersonaState } = require('../personalization/personaUpdater');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const resProfile = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
      if (!resProfile.rows || resProfile.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' }
        });
      }

      const row = resProfile.rows[0];
      const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));

      res.json({
        success: true,
        data: {
          id: row.id,
          userId: row.user_id,
          goal: row.goal,
          skillLevel: row.skill_level,
          learningStyle: row.learning_style,
          interests: parse(row.interests, []),
          availableTime: row.available_time,
          currentPriority: row.current_priority,
          preferences: parse(row.preferences, {}),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const validated = profileUpdateSchema.parse(req.body);
      const existing = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
      if (!existing.rows || existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' }
        });
      }

      const current = existing.rows[0];
      const goal = validated.goal !== undefined ? validated.goal : current.goal;
      const skillLevel = validated.skillLevel !== undefined ? validated.skillLevel : current.skill_level;
      const learningStyle = validated.learningStyle !== undefined ? validated.learningStyle : current.learning_style;
      const interests = validated.interests !== undefined ? validated.interests : current.interests;
      const availableTime = validated.availableTime !== undefined ? validated.availableTime : current.available_time;
      const currentPriority = validated.currentPriority !== undefined ? validated.currentPriority : current.current_priority;
      const preferences = validated.preferences !== undefined ? validated.preferences : current.preferences;

      const updated = await db.query(
        `UPDATE user_profiles
         SET goal = $1, skill_level = $2, learning_style = $3, interests = $4,
             available_time = $5, current_priority = $6, preferences = $7, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $8
         RETURNING *`,
        [
          goal,
          skillLevel,
          JSON.stringify(interests),
          learningStyle,
          availableTime,
          currentPriority,
          JSON.stringify(preferences),
          req.user.id
        ]
      );

      // Sync persona explicitly with onboarding/profile updates
      await updatePersonaState(
        req.user.id,
        {
          goal,
          skillLevel,
          learningStyle
        },
        'Explicit profile configuration update'
      );

      res.json({
        success: true,
        data: {
          profile: updated.rows[0],
          message: 'Profile updated and synchronized with active persona'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();
