# PersonaFlow AI

> **"Understand the User. Adapt the Experience. Evolve With Them."**
>
> *AI that continuously adapts to what users need right now.*
>
> *"PersonaFlow doesn't just personalize for who you are. It adapts to what you need right now."*

PersonaFlow AI is a dynamic user modeling, context-aware personalization, and explainable AI platform designed to transform digital learning and career development.

---

## 🌟 The Five Signature Differentiators

1. **Adaptive Personalization Loop**: Continuous signal extraction from quiz performance, content skips, clicks, and completions that triggers real-time persona state adaptations.
2. **"Why Am I Seeing This?" (Explainability)**: Every recommendation provides a deterministic 6-criterion breakdown (Goal 25%, Context 20%, Skill 20%, Interest 15%, Preference 10%, Feedback 10%) with confidence meters and provenance tracking.
3. **Before / After Personalization**: Tangible side-by-side comparison illustrating the difference between static catalog ranking and adaptive contextual personalization.
4. **Context Switching**: Instant mode transition across 5 operational modes (*Learning*, *Building Project*, *Interview Preparation*, *Exam Preparation*, *Career Planning*) that immediately recalibrates recommendation rankings and AI assistance.
5. **Persona Evolution & Audit Timeline**: Full transparency through `/persona/timeline` and `/persona/changes` showing exact Before &rarr; Trigger &rarr; After state transitions.

---

## 🏗️ Architecture & Technology Stack

```
                  ┌───────────────────────┐
                  │   React 18 + Vite     │
                  │   Tailwind CSS        │
                  │   Lucide + Recharts   │
                  └───────────┬───────────┘
                              │ Axios + Bearer JWT
                              ▼
                  ┌───────────────────────┐
                  │   Express.js (Node)   │
                  │   Helmet + CORS       │
                  │   Zod Validators      │
                  │   Rate Limiters       │
                  └───────┬───────┬───────┘
                          │       │
              ┌───────────┘       └───────────┐
              ▼                               ▼
    ┌───────────────────┐           ┌───────────────────┐
    │  Persona Engine   │           │   AI Providers    │
    │  Recommendation   │           │   Gemini 1.5      │
    │  Scoring Engine   │           │   Deterministic   │
    └─────────┬─────────┘           │   Fallback Engine │
              │                     └───────────────────┘
              ▼
    ┌─────────────────────────────────────────┐
    │   Supabase PostgreSQL / Relational DB  │
    │   (Instant Zero-Config Demo Persistence)│
    └─────────────────────────────────────────┘
```

### Frontend
- **React.js 18** with **Vite**
- **React Router v6**
- **Tailwind CSS** with dark mode aesthetics
- **Lucide React** icons
- **Recharts** for real event-driven analytics
- **Axios** with automatic JWT interceptors

### Backend
- **Node.js** & **Express.js**
- **JWT** (`jsonwebtoken`) authentication
- **bcryptjs** password hashing
- **Zod** strict runtime schema validation
- **Helmet** security headers
- **CORS** configured origins
- **express-rate-limit** DDoS & brute-force defense

### Database
- **Supabase PostgreSQL** via `pg` connection pool
- Fully relational schema with foreign keys, constraints, and audit logs
- **Zero-Config Instant Demo Mode**: Built-in fallback database layer allowing judges and reviewers to run the full application locally with 100% functionality without requiring external credentials.

### Artificial Intelligence
- **Google Gemini API** (`gemini-1.5-flash`) with strict Zod structured output validation
- **AIProvider Abstraction**: Decoupled interface with automated deterministic fallback ensuring 100% operational uptime if Gemini is offline or rate-limited.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
Install dependencies for both backend and frontend:

```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Environment Configuration
Backend `.env` file (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=personaflow_super_secure_jwt_secret_key_2026_hackathon
JWT_EXPIRES_IN=7d
DATABASE_URL=
GEMINI_API_KEY=
```
*(Leave `DATABASE_URL` and `GEMINI_API_KEY` blank for instant zero-config demo operation, or provide your Supabase/PostgreSQL connection string and Gemini API key for live external service integration).*

### 4. Running the Application

In terminal 1 (Backend):
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

In terminal 2 (Frontend):
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Automated Test Suite

Run the test suite verifying scoring algorithms, confidence calculations, persona evolution, and deterministic recommendation contracts:

```bash
cd server
npm test
```

---

## 🏆 Judge Demonstration Workflow (Alex Demo)

To experience the complete PersonaFlow AI story in under 3 minutes:

1. **Launch App**: Open `http://localhost:5173`.
2. **1-Click Judge Access**: Click **"Try Demo (Alex)"** or navigate to `/login` and press **"Launch Alex Demo"**.
3. **Inspect Initial State**:
   - Assessed Skill: `Intermediate`
   - Active Mode: `Building Project`
   - Struggle Areas: `Authorization with Middleware`
   - Confidence: `84%`
4. **Switch Context Mode**: In the top navbar, switch context from **"Building Project"** to **"Interview Preparation"**.
   - Notice recommendations immediately change to emphasize system design and interview Q&A.
5. **Inspect "Why Am I Seeing This?"**: Click the button on any recommendation card to inspect the 6-dimension mathematical breakdown and data provenance (*You told us* vs *PersonaFlow inferred*).
6. **Trigger Feedback**: Mark a recommendation as **"Useful"** and another as **"Not Useful &rarr; Too Easy"**. Click **"Recalculate Ranking"** to see ranking adapt dynamically.
7. **Assess Skill via Quiz**: Navigate to `/quiz`, select the *Authorization Challenge*, and submit answers to observe direct persona updates.
8. **Consult AI Assistant**: Open `/assistant` and ask: *"How should I prepare for a full-stack interview?"* Notice that the response integrates your goal, assessed intermediate level, struggle area, and current mode.
9. **Examine Audit Trail**: Navigate to `/persona/timeline` and `/persona/changes` to view the Before &rarr; Trigger &rarr; After event log.
10. **Review Before / After**: Navigate to `/personalization` to see the side-by-side contrast between static catalog baselines and PersonaFlow's adaptive intelligence.
11. **Test Privacy & Reset**: Navigate to `/settings`, inspect data controls, or click **"Reset Inferred Signals"** to demonstrate clean user data sovereignty.

---

## 📐 Scoring Formula Specification

$$ \text{Final Score} = (\text{Goal} \times 0.25) + (\text{Skill} \times 0.20) + (\text{Context} \times 0.20) + (\text{Interest} \times 0.15) + (\text{Preference} \times 0.10) + (\text{Feedback} \times 0.10) $$

- **Goal Match (25%)**: Evaluates topic alignment with active target milestone.
- **Skill Match (20%)**: Distance matrix comparing user proficiency to difficulty ($0 = 100, \pm 1 = 80-85, \ge 2 \le 50$).
- **Context Match (20%)**: Re-weights content relevance according to active operational mode.
- **Interest Match (15%)**: Overlap ratio of active behavioral interest tags.
- **Preference Match (10%)**: Learning style and duration vs available time block.
- **Feedback Signal (10%)**: Historical reaction weighted by recency decay ($0-7\text{d}: 1.0, 8-30\text{d}: 0.75, 31-90\text{d}: 0.50, 91+\text{d}: 0.25$).

---

## 📄 License

MIT &copy; 2026 PersonaFlow AI Team.
