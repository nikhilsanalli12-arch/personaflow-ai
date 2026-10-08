const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const config = require('../config');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidator');

class AuthController {
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const { name, email, password } = validated;

      // Check existing email
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows && existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' }
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user
      const userRes = await db.query(
        `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role, created_at`,
        [userId, name, email.toLowerCase(), passwordHash]
      );
      const user = userRes.rows[0];

      // Initialize default user_profile
      const profileId = uuidv4();
      await db.query(
        `INSERT INTO user_profiles (id, user_id, goal, skill_level, learning_style, interests, available_time, preferences, created_at)
         VALUES ($1, $2, 'Become a full-stack developer', 'beginner', 'hands-on', '["React", "Node.js"]'::jsonb, 30, '{}'::jsonb, CURRENT_TIMESTAMP)`,
        [profileId, userId]
      );

      // Initialize default persona_state
      const personaId = uuidv4();
      await db.query(
        `INSERT INTO persona_states (id, user_id, goal, skill_level, current_focus, learning_style, current_context, confidence, version, created_at)
         VALUES ($1, $2, 'Become a full-stack developer', 'beginner', 'Full-Stack Foundations', 'hands-on', 'Learning', 60.0, 1, CURRENT_TIMESTAMP)`,
        [personaId, userId]
      );

      // Generate JWT
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const { email, password } = validated;

      const userRes = await db.query(
        'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (!userRes.rows || userRes.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      const user = userRes.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      const { password_hash, ...safeUser } = user;

      res.json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      // In a production setup, an email token is generated and emailed.
      // We return safe acknowledgement per security standards.
      res.json({
        success: true,
        data: {
          message: `If an account with ${email} exists, password reset instructions have been dispatched.`
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_RESET_TOKEN', message: 'Password reset link is invalid or expired' }
        });
      }

      const newHash = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        newHash,
        decoded.userId
      ]);

      res.json({
        success: true,
        data: { message: 'Password successfully updated. You may now sign in.' }
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const userRes = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [
        req.user.id
      ]);
      if (!userRes.rows || userRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { user: userRes.rows[0] }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
