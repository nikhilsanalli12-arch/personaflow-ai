const db = require('../db');
const { extractSignalsFromInteraction } = require('./signalExtractor');
const { aggregateSignals } = require('./signalAggregator');
const { updatePersonaState } = require('./personaUpdater');
const { recordPersonaEvent } = require('./personaEvents');

class PersonaEngine {
  async getPersona(userId) {
    const res = await db.query('SELECT * FROM persona_states WHERE user_id = $1', [userId]);
    if (!res.rows || res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    const safeParse = (val, def) => {
      if (typeof val !== 'string') return val || def;
      try {
        return JSON.parse(val);
      } catch (e) {
        return def;
      }
    };

    // Fetch user profile for explicit attributes (Requirement 7: Explicit vs Inferred)
    const profRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = profRes.rows[0] || {};

    const struggleAreas = safeParse(row.struggle_areas, []);
    const recentInterests = safeParse(row.recent_interests, []);
    const signals = safeParse(row.signals, []);

    return {
      id: row.id,
      userId: row.user_id,
      goal: row.goal,
      skillLevel: row.skill_level,
      currentFocus: row.current_focus,
      learningStyle: row.learning_style,
      engagementLevel: row.engagement_level,
      struggleAreas,
      recentInterests,
      preferredContentLength: row.preferred_content_length,
      currentContext: row.current_context,
      confidence: parseFloat(row.confidence || 75),
      signals,
      version: row.version,
      behavioralPersonalizationEnabled: row.behavioral_personalization_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Field provenance mapping (Requirement 7)
      provenance: {
        goal: { value: row.goal, origin: 'USER_PROVIDED', label: 'You told us' },
        learningStyle: { value: row.learning_style, origin: 'USER_PROVIDED', label: 'You told us' },
        skillLevel: {
          value: row.skill_level,
          origin: profile.skill_level === row.skill_level ? 'USER_PROVIDED' : 'INFERRED',
          label: profile.skill_level === row.skill_level ? 'You told us' : 'PersonaFlow inferred'
        },
        currentContext: { value: row.current_context, origin: 'USER_PROVIDED', label: 'Active Mode' },
        struggleAreas: {
          value: struggleAreas,
          origin: 'INFERRED',
          label: 'PersonaFlow inferred from assessments and behavior'
        },
        recentInterests: {
          value: recentInterests,
          origin: 'INFERRED',
          label: 'PersonaFlow inferred from module activity'
        }
      }
    };
  }

  async processInteraction(userId, interaction, contentItem = null) {
    const persona = await this.getPersona(userId);
    if (!persona) return null;

    if (!persona.behavioralPersonalizationEnabled) {
      return { persona, updated: false, reason: 'Behavioral personalization disabled' };
    }

    // 1. Signal extraction
    const extracted = extractSignalsFromInteraction(interaction, contentItem);
    if (extracted.length === 0) {
      return { persona, updated: false };
    }

    // 2. Aggregate signals
    const aggregated = aggregateSignals(persona.signals, extracted);

    // 3. Evaluate threshold (Requirement 27: require repeated signal or strong quiz)
    const updates = { signals: aggregated, inferred: true };
    let hasMeaningfulChange = false;

    // Check for struggle area
    const struggleSignals = aggregated.filter(s => s.type === 'struggle');
    for (const ss of struggleSignals) {
      if (ss.count >= 1 && ss.confidence >= 70 && !persona.struggleAreas.includes(ss.value)) {
        updates.newStruggleArea = ss.value;
        updates.struggleReason = ss.reason;
        hasMeaningfulChange = true;
      }
    }

    // Check for interest progression
    const interestSignals = aggregated.filter(s => s.type === 'interest');
    for (const is of interestSignals) {
      if (is.count >= 2 && !persona.recentInterests.includes(is.value)) {
        updates.newInterest = is.value;
        hasMeaningfulChange = true;
      }
    }

    // Check for skill upgrade
    const skillSignals = aggregated.filter(s => s.type === 'skill');
    if (skillSignals.some(s => s.value === 'intermediate' && s.confidence >= 80) && persona.skillLevel === 'beginner') {
      updates.skillLevel = 'intermediate';
      updates.skillReason = 'Consistently completed intermediate coursework and projects';
      hasMeaningfulChange = true;
    }

    if (hasMeaningfulChange) {
      const updated = await updatePersonaState(userId, updates, 'Dynamic behavioral evolution');
      const refreshed = await this.getPersona(userId);
      return { persona: refreshed, updated: true };
    }

    return { persona, updated: false };
  }

  async resetPersona(userId) {
    // Reset inferred signals while preserving explicit profile data (Requirement 32)
    const profileRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0] || {};
    const safeParse = (val, def) => {
      if (typeof val !== 'string') return val || def;
      try {
        return JSON.parse(val);
      } catch (e) {
        return def;
      }
    };
    const explicitInterests = safeParse(profile.interests, ['React', 'Node.js']);

    const currentPersona = await this.getPersona(userId);

    const sql = `
      UPDATE persona_states
      SET skill_level = $1,
          current_focus = $2,
          struggle_areas = $3,
          recent_interests = $4,
          current_context = 'Learning',
          confidence = 60.0,
          signals = $5,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING *
    `;

    const res = await db.query(sql, [
      profile.skill_level || 'beginner',
      profile.goal || 'Full-Stack Development',
      JSON.stringify([]),
      JSON.stringify(explicitInterests),
      JSON.stringify([]),
      userId
    ]);

    await recordPersonaEvent({
      userId,
      eventType: 'persona_reset',
      fieldName: 'all_inferred',
      oldValue: {
        struggles: currentPersona ? currentPersona.struggleAreas : [],
        skill: currentPersona ? currentPersona.skillLevel : 'unknown'
      },
      newValue: {
        struggles: [],
        skill: profile.skill_level || 'beginner'
      },
      reason: 'User executed explicit persona reset; restored to baseline onboarding state',
      confidence: 100
    });

    return res.rows[0];
  }

  async setBehavioralPersonalization(userId, enabled) {
    const res = await db.query(
      `UPDATE persona_states
       SET behavioral_personalization_enabled = $1,
           version = version + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [enabled, userId]
    );

    await recordPersonaEvent({
      userId,
      eventType: 'privacy_setting_changed',
      fieldName: 'behavioral_personalization_enabled',
      oldValue: !enabled,
      newValue: enabled,
      reason: enabled ? 'Behavioral personalization enabled' : 'Behavioral personalization disabled by user',
      confidence: 100
    });

    return res.rows[0];
  }
}

module.exports = new PersonaEngine();
