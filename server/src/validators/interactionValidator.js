const { z } = require('zod');

const contextEnum = z.enum([
  'Learning',
  'Building Project',
  'Interview Preparation',
  'Exam Preparation',
  'Career Planning'
]);

const eventTypeEnum = z.enum([
  'search',
  'view_content',
  'complete_content',
  'skip_content',
  'bookmark',
  'ask_question',
  'recommendation_click',
  'recommendation_reject',
  'feedback_positive',
  'feedback_negative',
  'quiz_attempt',
  'quiz_success',
  'quiz_failure',
  'goal_change',
  'context_change',
  'content_share',
  'content_save'
]);

const createInteractionSchema = z.object({
  eventType: eventTypeEnum,
  contentId: z.string().uuid().optional().nullable(),
  context: contextEnum.optional().default('Learning'),
  metadata: z.record(z.any()).optional().default({}),
  feedback: z.any().optional().nullable()
});

const contextSwitchSchema = z.object({
  context: contextEnum
});

module.exports = {
  contextEnum,
  eventTypeEnum,
  createInteractionSchema,
  contextSwitchSchema
};
