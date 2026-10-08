-- PersonaFlow AI Database Schema
-- Compatible with Supabase PostgreSQL and standard PostgreSQL

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. USER PROFILES TABLE (Explicit Onboarding & Settings)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    goal VARCHAR(255),
    skill_level VARCHAR(50),
    learning_style VARCHAR(50),
    interests JSONB DEFAULT '[]'::jsonb,
    available_time INTEGER DEFAULT 30, -- minutes
    current_priority VARCHAR(255),
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 3. PERSONA STATES TABLE (Dynamic Adaptive Persona)
CREATE TABLE IF NOT EXISTS persona_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    goal VARCHAR(255),
    skill_level VARCHAR(50) DEFAULT 'beginner',
    current_focus VARCHAR(255) DEFAULT 'Full-Stack Development',
    learning_style VARCHAR(50) DEFAULT 'hands-on',
    engagement_level VARCHAR(50) DEFAULT 'moderate',
    struggle_areas JSONB DEFAULT '[]'::jsonb,
    recent_interests JSONB DEFAULT '[]'::jsonb,
    preferred_content_length VARCHAR(50) DEFAULT 'medium',
    current_context VARCHAR(100) DEFAULT 'Learning',
    confidence NUMERIC DEFAULT 60.0,
    signals JSONB DEFAULT '[]'::jsonb,
    version INTEGER DEFAULT 1,
    behavioral_personalization_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_persona_states_user_id ON persona_states(user_id);

-- 4. INTERACTIONS TABLE (Behavioral Signals & Event Log)
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    content_id UUID,
    context VARCHAR(100) DEFAULT 'Learning',
    metadata JSONB DEFAULT '{}'::jsonb,
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_event_type ON interactions(event_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- 5. CONTENT TABLE (Educational & Career Development Resources)
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
    content_type VARCHAR(100) NOT NULL, -- 'interactive_project', 'tutorial', 'deep_dive', 'exercise', 'interview_prep'
    duration INTEGER NOT NULL, -- minutes
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_topic ON content(topic);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);

-- 6. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    context VARCHAR(100) NOT NULL,
    score NUMERIC NOT NULL,
    rank INTEGER NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'opened', 'dismissed', 'completed'
    feedback VARCHAR(100), -- 'useful', 'not_useful', 'too_easy', 'too_difficult', 'already_know_this', 'too_long', 'not_practical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_content_id ON recommendations(content_id);

-- 7. GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'completed', 'paused'
    priority VARCHAR(50) DEFAULT 'high', -- 'low', 'medium', 'high'
    progress INTEGER DEFAULT 0, -- 0 to 100
    target_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- 8. PERSONA EVENTS TABLE (Audit Trail & Timeline)
CREATE TABLE IF NOT EXISTS persona_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    field_name VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    reason TEXT NOT NULL,
    confidence NUMERIC DEFAULT 75.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_persona_events_user_id ON persona_events(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_events_created_at ON persona_events(created_at);

-- 9. QUIZZES & QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    score NUMERIC NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts(topic);
