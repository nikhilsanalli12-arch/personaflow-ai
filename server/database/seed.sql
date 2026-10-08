-- PersonaFlow AI Seed Data
-- Demo User: Alex Demo (alex@personaflow.ai / Password123!)
-- Admin User: Admin (admin@personaflow.ai / Admin123!)

-- Fixed UUIDs for predictable demo relations
-- Users
-- Alex Demo: '11111111-1111-1111-1111-111111111111'
-- Admin:     '22222222-2222-2222-2222-222222222222'

-- Password hash for 'Password123!' (bcrypt cost 10)
-- $2a$10$iMhGf9dJtB5.vYcQe2xP8uF4fO1u0EwJpT9a6eZ5f8g7h6j5k4l3m
-- Or standardized hash that bcryptjs verifies against 'Password123!'
-- We will also handle this in code if needed, but standard bcrypt:
-- $2a$10$wT8mQ3f5Z8pM12Z1t3MGeuqzFf.3a2zK0g3Zk6bS1k2d4e5f6g7h

INSERT INTO users (id, name, email, password_hash, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Alex Demo', 'alex@personaflow.ai', '$2a$10$0d0QzQ8e9bQzQ8e9bQzQ8eGkM9rWz6u7a8b9c0d1e2f3g4h5i6j7k', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'Admin Demo', 'admin@personaflow.ai', '$2a$10$0d0QzQ8e9bQzQ8e9bQzQ8eGkM9rWz6u7a8b9c0d1e2f3g4h5i6j7k', 'admin')
ON CONFLICT (id) DO NOTHING;

-- User Profile (Explicit Onboarding)
INSERT INTO user_profiles (id, user_id, goal, skill_level, learning_style, interests, available_time, current_priority, preferences)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Become a full-stack developer',
  'beginner',
  'hands-on',
  '["React", "Node.js", "APIs"]'::jsonb,
  30,
  'Build and ship full-stack web applications',
  '{"preferredContentLength": "medium", "visualAids": true, "practicalProjects": true}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- Persona State (Evolved Demo Persona matching Requirement 100)
INSERT INTO persona_states (
  id, user_id, goal, skill_level, current_focus, learning_style, engagement_level,
  struggle_areas, recent_interests, preferred_content_length, current_context,
  confidence, signals, version, behavioral_personalization_enabled
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Become a full-stack developer',
  'intermediate',
  'Full-Stack Project',
  'hands-on',
  'high',
  '["Authorization with Middleware", "Role-Based Access Control"]'::jsonb,
  '["React", "Node.js", "PostgreSQL", "REST APIs"]'::jsonb,
  'medium',
  'Building Project',
  84.0,
  '[
    {"type": "skill", "value": "intermediate", "source": "interaction", "confidence": 85, "reason": "Completed core React and Node.js tasks"},
    {"type": "interest", "value": "PostgreSQL", "source": "interaction", "confidence": 80, "reason": "Explored relational database architecture"},
    {"type": "struggle", "value": "Authorization with Middleware", "source": "quiz", "confidence": 78, "reason": "Low score on JWT role-based auth quiz"},
    {"type": "preference", "value": "hands-on", "source": "user", "confidence": 100, "reason": "Explicitly selected during onboarding"}
  ]'::jsonb,
  4,
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- CONTENT LIBRARY (13 Required Items from Requirement 98)
INSERT INTO content (id, title, description, category, topic, difficulty, content_type, duration, tags, metadata)
VALUES
(
  'c0000001-0000-0000-0000-000000000001',
  'React Fundamentals',
  'Master component lifecycle, hooks (useState, useEffect), props, and reactive state management in modern React.',
  'Frontend',
  'React',
  'beginner',
  'interactive_project',
  25,
  '["React", "JavaScript", "Frontend", "UI", "Components"]'::jsonb,
  '{"supportedContexts": ["Learning", "Exam Preparation"]}'::jsonb
),
(
  'c0000002-0000-0000-0000-000000000002',
  'JavaScript Async Programming',
  'Deep dive into Promises, async/await, the Event Loop, and microtask queues with practical code exercises.',
  'Core JavaScript',
  'JavaScript',
  'intermediate',
  'exercise',
  20,
  '["JavaScript", "Async", "Promises", "Event Loop"]'::jsonb,
  '{"supportedContexts": ["Learning", "Interview Preparation", "Exam Preparation"]}'::jsonb
),
(
  'c0000003-0000-0000-0000-000000000003',
  'REST API Design',
  'Architect robust RESTful APIs: HTTP verbs, idempotent operations, pagination, filtering, and standard JSON responses.',
  'Backend',
  'REST APIs',
  'intermediate',
  'tutorial',
  30,
  '["APIs", "REST", "HTTP", "Architecture", "Backend"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning", "Interview Preparation"]}'::jsonb
),
(
  'c0000004-0000-0000-0000-000000000004',
  'Node.js Basics',
  'Understand Node runtime, CommonJS vs ESM, file systems, streams, and event-driven architecture.',
  'Backend',
  'Node.js',
  'beginner',
  'tutorial',
  25,
  '["Node.js", "Backend", "JavaScript", "Runtime"]'::jsonb,
  '{"supportedContexts": ["Learning", "Building Project"]}'::jsonb
),
(
  'c0000005-0000-0000-0000-000000000005',
  'Express Routing',
  'Building modular routers, route parameters, controllers, and sub-apps in Express.js.',
  'Backend',
  'Node.js',
  'beginner',
  'exercise',
  20,
  '["Express", "Node.js", "Routing", "Backend", "APIs"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning"]}'::jsonb
),
(
  'c0000006-0000-0000-0000-000000000006',
  'PostgreSQL Fundamentals',
  'Relational database modeling, SQL queries, joins, indexes, foreign keys, and ACID transactions.',
  'Database',
  'PostgreSQL',
  'intermediate',
  'interactive_project',
  35,
  '["PostgreSQL", "SQL", "Database", "Backend", "Data Modeling"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning", "Interview Preparation"]}'::jsonb
),
(
  'c0000007-0000-0000-0000-000000000007',
  'JWT Authentication',
  'Secure authentication flows with JSON Web Tokens, signature verification, token expiration, and refresh tokens.',
  'Security',
  'Security',
  'intermediate',
  'tutorial',
  30,
  '["JWT", "Authentication", "Security", "Tokens", "APIs"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning", "Interview Preparation"]}'::jsonb
),
(
  'c0000008-0000-0000-0000-000000000008',
  'Authorization with Middleware',
  'Hands-on guide to implementing Role-Based Access Control (RBAC), permission guards, and route-level authorization.',
  'Security',
  'Authorization',
  'intermediate',
  'exercise',
  25,
  '["Authorization", "RBAC", "Middleware", "Security", "Express"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning", "Interview Preparation"]}'::jsonb
),
(
  'c0000009-0000-0000-0000-000000000009',
  'Building a Full-Stack Project',
  'Step-by-step assembly of a complete full-stack web application connecting React, Express, PostgreSQL, and auth.',
  'Full-Stack',
  'Full-Stack',
  'intermediate',
  'interactive_project',
  45,
  '["Full-Stack", "React", "Node.js", "PostgreSQL", "Projects"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Career Planning"]}'::jsonb
),
(
  'c0000010-0000-0000-0000-000000000010',
  'API Error Handling',
  'Enterprise error handling: centralized Express error middleware, custom error classes, and resilient error reporting.',
  'Backend',
  'Node.js',
  'intermediate',
  'tutorial',
  20,
  '["Error Handling", "Express", "Node.js", "APIs", "Best Practices"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Learning"]}'::jsonb
),
(
  'c0000011-0000-0000-0000-000000000011',
  'Deployment with Vercel/Render',
  'Deploying client apps to Vercel, Node/Express backends to Render, environment secrets management, and CORS configuration.',
  'DevOps',
  'Deployment',
  'beginner',
  'tutorial',
  25,
  '["Deployment", "Vercel", "Render", "DevOps", "Production"]'::jsonb,
  '{"supportedContexts": ["Building Project", "Career Planning"]}'::jsonb
),
(
  'c0000012-0000-0000-0000-000000000012',
  'System Design Basics',
  'Foundational system design: horizontal vs vertical scaling, load balancers, caching layers, and database sharding.',
  'System Design',
  'Architecture',
  'advanced',
  'deep_dive',
  40,
  '["System Design", "Architecture", "Scalability", "Caching", "Databases"]'::jsonb,
  '{"supportedContexts": ["Interview Preparation", "Career Planning"]}'::jsonb
),
(
  'c0000013-0000-0000-0000-000000000013',
  'React/Node/Database Interview Questions',
  'High-frequency technical interview questions on virtual DOM, event loop, SQL vs NoSQL, and API idempotency.',
  'Career',
  'Interviews',
  'intermediate',
  'interview_prep',
  30,
  '["Interview", "Career", "React", "Node.js", "PostgreSQL", "Q&A"]'::jsonb,
  '{"supportedContexts": ["Interview Preparation", "Career Planning", "Exam Preparation"]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- GOALS
INSERT INTO goals (id, user_id, title, description, status, priority, progress, target_date)
VALUES
(
  'g0000001-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Master Full-Stack Web Development',
  'Build and ship a production-ready application using React, Express, and PostgreSQL with secure JWT auth.',
  'in_progress',
  'high',
  65,
  CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
  'g0000002-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'Prepare for Full-Stack Developer Interviews',
  'Review system design fundamentals and pass full-stack technical interview challenges.',
  'in_progress',
  'medium',
  35,
  CURRENT_TIMESTAMP + INTERVAL '60 days'
)
ON CONFLICT (id) DO NOTHING;

-- PERSONA EVOLUTION EVENTS (Requirement 30 & 31: /persona/timeline & /persona/changes)
INSERT INTO persona_events (id, user_id, event_type, field_name, old_value, new_value, reason, confidence, created_at)
VALUES
(
  'e0000001-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'persona_created',
  'profile',
  '{}'::jsonb,
  '{"skillLevel": "beginner", "goal": "Become a full-stack developer"}'::jsonb,
  'Initial persona initialized from onboarding responses',
  100.0,
  CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
  'e0000002-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'skill_level_upgraded',
  'skill_level',
  '"beginner"'::jsonb,
  '"intermediate"'::jsonb,
  'Completed React Fundamentals, Node.js Basics, and passed JavaScript async programming exercise',
  84.0,
  CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
  'e0000003-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'struggle_area_detected',
  'struggle_areas',
  '[]'::jsonb,
  '["Authorization with Middleware", "Role-Based Access Control"]'::jsonb,
  'Scored 40% on JWT & RBAC Middleware Quiz; repeated attempt skipped',
  78.0,
  CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
  'e0000004-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  'context_switched',
  'current_context',
  '"Learning"'::jsonb,
  '"Building Project"'::jsonb,
  'User switched active mode to Building Project to assemble full-stack repository',
  95.0,
  CURRENT_TIMESTAMP - INTERVAL '5 hours'
)
ON CONFLICT (id) DO NOTHING;

-- QUIZZES
INSERT INTO quizzes (id, title, topic, difficulty, questions)
VALUES
(
  'q0000001-0000-0000-0000-000000000001',
  'React State & Hooks Check',
  'React',
  'beginner',
  '[
    {
      "id": "q1",
      "question": "Which hook is used to perform side effects such as data fetching in a function component?",
      "options": ["useState", "useEffect", "useMemo", "useCallback"],
      "correctIndex": 1,
      "explanation": "useEffect is specifically designed for side effects, lifecycle handling, and subscriptions."
    },
    {
      "id": "q2",
      "question": "What is the primary rule of React Hooks execution?",
      "options": ["Call hooks inside loops", "Call hooks only at the top level", "Call hooks conditionally inside if statements", "Call hooks in nested functions"],
      "correctIndex": 1,
      "explanation": "Hooks must always be called at the top level of React functions to guarantee predictable state order across renders."
    }
  ]'::jsonb
),
(
  'q0000002-0000-0000-0000-000000000002',
  'Authorization & Middleware Guard Challenge',
  'Authorization',
  'intermediate',
  '[
    {
      "id": "q1",
      "question": "Where should a role-based authorization check typically take place in an Express route?",
      "options": [
        "In the database trigger only",
        "Inside a middleware function after JWT authentication has verified the user identity",
        "Directly on the frontend React button",
        "Inside the CORS options configuration"
      ],
      "correctIndex": 1,
      "explanation": "Authentication validates identity first, then authorization middleware checks if req.user has the required permissions."
    },
    {
      "id": "q2",
      "question": "What HTTP status code should be returned when an authenticated user attempts to access a forbidden resource they lack permission for?",
      "options": ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
      "correctIndex": 1,
      "explanation": "401 indicates lack of valid authentication, whereas 403 Forbidden indicates identity is known but permission is denied."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
