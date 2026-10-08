# PersonaFlow AI — API Documentation

This document outlines all REST endpoints available on the PersonaFlow AI backend.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user, default user profile, and initializes baseline persona state.
- **Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "data": { "user": { ... }, "token": "..." } }`

### `POST /api/auth/login`
Authenticates credentials via bcrypt comparison and issues a JWT token.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "data": { "user": { ... }, "token": "..." } }`

### `POST /api/auth/forgot-password`
Initiates self-service password recovery.
- **Body**: `{ "email": "..." }`
- **Response**: `{ "success": true, "data": { "message": "..." } }`

### `POST /api/auth/reset-password`
Resets password with verified reset token.
- **Body**: `{ "token": "...", "password": "..." }`

### `GET /api/auth/me`
Returns currently authenticated user profile from verified JWT.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "data": { "user": { ... } } }`

---

## 2. User Profile (`/api/profile`)

### `GET /api/profile`
Retrieves explicit onboarding preferences ("You told us").
- **Headers**: `Authorization: Bearer <token>`

### `PUT /api/profile`
Updates explicit preferences and synchronizes active persona.
- **Body**:
  ```json
  {
    "goal": "Become a full-stack developer",
    "skillLevel": "intermediate",
    "learningStyle": "hands-on",
    "interests": ["React", "Node.js", "APIs"],
    "availableTime": 30,
    "currentPriority": "Build full-stack apps"
  }
  ```

---

## 3. Dynamic Persona (`/api/persona`)

### `GET /api/persona`
Retrieves dynamic adaptive persona with provenance tags (`USER_PROVIDED` vs `INFERRED`).

### `POST /api/persona/update`
Manually fine-tunes persona fields. Creates a `persona_event` audit entry and increments persona version.

### `POST /api/persona/reset`
Resets inferred struggle areas and recent interests to explicit baseline onboarding state.

### `GET /api/persona/timeline`
Returns chronological audit timeline of all state adaptations with before/after diffs and confidence scores.

### `GET /api/persona/changes`
Returns structured state transitions: `Before` → `Trigger` → `After`.

### `POST /api/persona/toggle-behavioral`
Enables or disables behavioral inference (Requirement 34).
- **Body**: `{ "enabled": boolean }`

---

## 4. Context Mode Engine (`/api/context`)

### `GET /api/context`
Returns active context mode and available modes (`Learning`, `Building Project`, `Interview Preparation`, `Exam Preparation`, `Career Planning`).

### `POST /api/context`
Switches active context mode, logs `context_change` interaction, recalculates 20% context match weight, updates persona `currentContext`, and refreshes recommendations.
- **Body**: `{ "context": "Building Project" }`

---

## 5. Recommendations (`/api/recommendations`)

### `GET /api/recommendations`
Returns deterministically ranked recommendations calculated with 6 weights:
- Goal Match (25%)
- Context Match (20%)
- Skill Match (20%)
- Interest Match (15%)
- Learning Preference (10%)
- Feedback Signal (10%)

### `POST /api/recommendations/refresh`
Forces an immediate recalculation of recommendation rankings based on latest behavioral signals.

### `GET /api/recommendations/comparison`
Returns side-by-side comparison of Generic Catalog Baseline vs PersonaFlow Adaptive Experience (Requirement 36 & 37).

### `POST /api/recommendations/:id/feedback`
Records structured feedback (`useful`, `not_useful`, `too_easy`, `too_difficult`, `already_know_this`, `too_long`, `not_practical`) with recency decay.

### `POST /api/recommendations/:id/open`
Marks recommendation as opened and logs `recommendation_click` interaction.

### `POST /api/recommendations/:id/dismiss`
Dismisses recommendation and logs `recommendation_reject`.

---

## 6. Curriculum Library (`/api/content`)

### `GET /api/content`
Lists curriculum items. Supports filters: `?category=`, `?topic=`, `?difficulty=`, `?search=`.

### `GET /api/content/:id`
Retrieves single module details.

---

## 7. Goals (`/api/goals`)

### `GET /api/goals`
Lists user goals with priority and milestone progress.

### `POST /api/goals`
Creates a goal, logs `goal_change` event, and aligns active persona focus.

### `PUT /api/goals/:id`
Updates progress (0-100), status, or target date.

### `DELETE /api/goals/:id`
Removes goal.

---

## 8. Assessments & Quizzes (`/api/quiz`)

### `GET /api/quiz`
Returns available technical quizzes and questions.

### `GET /api/quiz/:id`
Returns single quiz by UUID.

### `POST /api/quiz/attempt`
Submits answers, scores attempt, logs `quiz_success` or `quiz_failure` interaction, and triggers persona struggle area or skill mastery adaptation.

### `GET /api/quiz/history`
Returns user attempt history.

---

## 9. Adaptive Learning Path (`/api/learning/path`)

### `GET /api/learning/path`
Returns sequential curriculum milestones ordered by prerequisites, prioritizing detected struggle areas, filtering completed material, and estimating remaining hours.

---

## 10. AI Assistant (`/api/assistant/chat`)

### `POST /api/assistant/chat`
Constructs a sanitized personalization context (goal, skill, currentFocus, currentContext, learningStyle, struggleAreas, availableTime, recentActivity) and calls Google Gemini (or Fallback Provider).
- **Body**: `{ "message": "How should I prepare for a full-stack interview?" }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "...",
      "suggestedActions": ["..."],
      "personalizationUsed": ["Active Goal: ...", "Current Context: ..."],
      "confidence": 90
    }
  }
  ```

---

## 11. Dashboard & Analytics

### `GET /api/dashboard`
Aggregates persona, top recommendations, primary goal, recent audit events, and real KPI metrics in a single round-trip.

### `GET /api/analytics/personalization`
Returns metrics derived purely from persisted interactions and persona events (total interactions, acceptance rate, context usage distribution, and weekly activity trend).

---

## 12. Administration (`/api/admin`)

*Requires role = admin*

### `GET /api/admin/users`
Lists registered users and join dates.

### `GET /api/admin/content`
Lists full content catalog.

### `POST /api/admin/content`
Publishes new curriculum module.

### `GET /api/admin/analytics`
System-wide metrics across users, content, interactions, and persona adaptations.
