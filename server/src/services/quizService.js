const db = require('../db');
const personaEngine = require('../personalization/personaEngine');
const { v4: uuidv4 } = require('uuid');

class QuizService {
  async getQuizzes() {
    const res = await db.query('SELECT * FROM quizzes ORDER BY created_at ASC');
    const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
    return (res.rows || []).map(q => ({
      ...q,
      questions: parse(q.questions, [])
    }));
  }

  async getQuizById(id) {
    const res = await db.query('SELECT * FROM quizzes WHERE id = $1', [id]);
    if (!res.rows || res.rows.length === 0) return null;
    const row = res.rows[0];
    const parse = (val, def) => (typeof val === 'string' ? JSON.parse(val) : (val || def));
    return {
      ...row,
      questions: parse(row.questions, [])
    };
  }

  async submitQuizAttempt(userId, quizId, userAnswers) {
    const quiz = await this.getQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    const questions = quiz.questions || [];
    let correctCount = 0;

    const answerMap = new Map();
    userAnswers.forEach(a => answerMap.set(a.questionId, a.selectedOption));

    const evaluatedQuestions = questions.map(q => {
      const selected = answerMap.get(q.id);
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedOption: selected,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = Math.round((correctCount / Math.max(1, questions.length)) * 100);
    const passed = score >= 70;
    const attemptId = uuidv4();

    // 1. Record attempt in quiz_attempts table
    await db.query(
      `INSERT INTO quiz_attempts (id, user_id, quiz_id, topic, difficulty, score, passed, answers, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        attemptId,
        userId,
        quizId,
        quiz.topic,
        quiz.difficulty,
        score,
        passed,
        JSON.stringify(evaluatedQuestions)
      ]
    );

    // 2. Record interaction event (Requirements 10 & 44)
    const eventType = score < 50 ? 'quiz_failure' : (score >= 85 ? 'quiz_success' : 'quiz_attempt');
    const interactionId = uuidv4();
    const interaction = {
      id: interactionId,
      userId,
      eventType,
      metadata: {
        quizId,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        score,
        passed
      }
    };

    await db.query(
      `INSERT INTO interactions (id, user_id, event_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [interactionId, userId, eventType, JSON.stringify(interaction.metadata)]
    );

    // 3. Process signal into persona engine (Requirement 45)
    const personaResult = await personaEngine.processInteraction(userId, interaction);

    return {
      attemptId,
      score,
      passed,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      evaluatedQuestions,
      personaImpact: {
        updated: personaResult ? personaResult.updated : false,
        newSkillLevel: personaResult?.persona?.skillLevel,
        struggleAreas: personaResult?.persona?.struggleAreas
      }
    };
  }

  async getUserQuizHistory(userId) {
    const res = await db.query(
      'SELECT * FROM quiz_attempts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows || [];
  }
}

module.exports = new QuizService();
