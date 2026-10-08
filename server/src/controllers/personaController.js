const personaEngine = require('../personalization/personaEngine');
const { getPersonaEvents } = require('../personalization/personaEvents');
const { updatePersonaState } = require('../personalization/personaUpdater');

class PersonaController {
  async getPersona(req, res, next) {
    try {
      const persona = await personaEngine.getPersona(req.user.id);
      if (!persona) {
        return res.status(404).json({
          success: false,
          error: { code: 'PERSONA_NOT_FOUND', message: 'Persona not found for user' }
        });
      }

      res.json({
        success: true,
        data: { persona }
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePersona(req, res, next) {
    try {
      const updates = req.body;
      const updated = await updatePersonaState(
        req.user.id,
        updates,
        req.body.reason || 'User manual persona fine-tuning'
      );

      const refreshed = await personaEngine.getPersona(req.user.id);
      res.json({
        success: true,
        data: { persona: refreshed, message: 'Persona state successfully adjusted' }
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPersona(req, res, next) {
    try {
      await personaEngine.resetPersona(req.user.id);
      const refreshed = await personaEngine.getPersona(req.user.id);
      res.json({
        success: true,
        data: {
          persona: refreshed,
          message: 'Inferred behavioral signals reset to baseline onboarding state'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const events = await getPersonaEvents(req.user.id);
      res.json({
        success: true,
        data: { events }
      });
    } catch (err) {
      next(err);
    }
  }

  // Requirement 31: What Changed (Before -> Trigger -> After)
  async getChanges(req, res, next) {
    try {
      const rawEvents = await getPersonaEvents(req.user.id);
      const changes = rawEvents.map(e => ({
        id: e.id,
        eventType: e.event_type,
        fieldName: e.field_name,
        before: e.oldValue,
        trigger: e.reason,
        after: e.newValue,
        confidence: e.confidence,
        timestamp: e.created_at
      }));

      res.json({
        success: true,
        data: { changes }
      });
    } catch (err) {
      next(err);
    }
  }

  // Requirement 34: Privacy controls - Disable behavioral personalization
  async toggleBehavioral(req, res, next) {
    try {
      const { enabled } = req.body;
      const updated = await personaEngine.setBehavioralPersonalization(req.user.id, Boolean(enabled));
      res.json({
        success: true,
        data: {
          behavioralPersonalizationEnabled: updated.behavioral_personalization_enabled,
          message: enabled ? 'Behavioral personalization enabled' : 'Behavioral personalization disabled'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PersonaController();
