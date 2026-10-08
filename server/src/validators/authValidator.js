const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'New password must be at least 8 characters')
});

const profileUpdateSchema = z.object({
  goal: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  learningStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  availableTime: z.number().int().positive().optional(),
  currentPriority: z.string().optional(),
  preferences: z.record(z.any()).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema
};
