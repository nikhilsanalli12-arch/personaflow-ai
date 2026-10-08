const { z } = require('zod');

const recommendationFeedbackSchema = z.object({
  feedback: z.enum([
    'useful',
    'not_useful',
    'too_easy',
    'too_difficult',
    'already_know_this',
    'too_long',
    'not_practical'
  ]),
  notes: z.string().optional()
});

const goalCreateSchema = z.object({
  title: z.string().min(3, 'Goal title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused']).default('in_progress'),
  priority: z.enum(['low', 'medium', 'high']).default('high'),
  progress: z.number().int().min(0).max(100).default(0),
  targetDate: z.string().optional()
});

const goalUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  targetDate: z.string().optional()
});

const assistantMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long')
});

const quizSubmitSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOption: z.number().int().min(0)
  }))
});

module.exports = {
  recommendationFeedbackSchema,
  goalCreateSchema,
  goalUpdateSchema,
  assistantMessageSchema,
  quizSubmitSchema
};
