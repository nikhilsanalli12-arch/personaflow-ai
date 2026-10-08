const test = require('node:test');
const assert = require('node:assert');
const { calculateFinalScore } = require('../src/recommendation/scoring');
const personaEngine = require('../src/personalization/personaEngine');
const recommendationEngine = require('../src/recommendation/recommendationEngine');
const { calculateConfidence } = require('../src/personalization/confidenceEngine');
const db = require('../src/db');

test('Backend Suite Initialization', async () => {
  await db.initDb();
  db.seedLocalData();
  assert.ok(true, 'Database initialized with demo data');
});

test('Requirement 111 & 15: Recommendation Scoring Formula Contract', () => {
  // Formula: (goalMatch * 0.25) + (skillMatch * 0.20) + (interestMatch * 0.15) + (contextMatch * 0.20) + (preferenceMatch * 0.10) + (feedbackSignal * 0.10)
  const score1 = calculateFinalScore({
    goalMatch: 100,
    skillMatch: 100,
    interestMatch: 100,
    contextMatch: 100,
    preferenceMatch: 100,
    feedbackSignal: 100
  });
  assert.strictEqual(score1, 100, 'All 100 matches should yield 100 final score');

  const score2 = calculateFinalScore({
    goalMatch: 0,
    skillMatch: 0,
    interestMatch: 0,
    contextMatch: 0,
    preferenceMatch: 0,
    feedbackSignal: 0
  });
  assert.strictEqual(score2, 0, 'All 0 matches should yield 0 final score');

  // Exact weights test
  // goal=100 (25) + context=100 (20) = 45
  const score3 = calculateFinalScore({
    goalMatch: 100,
    skillMatch: 0,
    interestMatch: 0,
    contextMatch: 100,
    preferenceMatch: 0,
    feedbackSignal: 0
  });
  assert.strictEqual(score3, 45, 'Goal (25) + Context (20) should yield exactly 45');

  // Determinism check: Same input yields identical score
  const scoreA = calculateFinalScore({ goalMatch: 75, skillMatch: 80, interestMatch: 60, contextMatch: 85, preferenceMatch: 70, feedbackSignal: 50 });
  const scoreB = calculateFinalScore({ goalMatch: 75, skillMatch: 80, interestMatch: 60, contextMatch: 85, preferenceMatch: 70, feedbackSignal: 50 });
  assert.strictEqual(scoreA, scoreB, 'Scoring must be 100% deterministic');
});

test('Requirement 25 & 26: Deterministic Confidence Calculation', () => {
  const explicitConf = calculateConfidence({ source: 'user' });
  assert.strictEqual(explicitConf, 100, 'Explicit user data must start at 100 confidence');

  const inferredConf = calculateConfidence({ source: 'interaction', supportingCount: 1, recencyDays: 2 });
  assert.ok(inferredConf >= 40 && inferredConf <= 70, 'Inferred confidence starts lower and is clamped');

  const repeatedConf = calculateConfidence({ source: 'interaction', supportingCount: 4, recencyDays: 2 });
  assert.ok(repeatedConf > inferredConf, 'Repeated supporting interactions must increase confidence');
});

test('Requirement 100: Demo User Alex Persona Verification', async () => {
  const alexId = '11111111-1111-1111-1111-111111111111';
  const persona = await personaEngine.getPersona(alexId);

  assert.ok(persona, 'Alex Demo persona should exist');
  assert.strictEqual(persona.skillLevel, 'intermediate', 'Demo persona evolved to intermediate');
  assert.strictEqual(persona.currentContext, 'Building Project', 'Demo persona currently in Building Project mode');
  assert.ok(persona.struggleAreas.length > 0, 'Alex has detected struggle areas');
  assert.ok(persona.recentInterests.includes('React'), 'Alex has React interest');
  assert.strictEqual(persona.provenance.goal.origin, 'USER_PROVIDED', 'Goal marked as user provided');
  assert.strictEqual(persona.provenance.struggleAreas.origin, 'INFERRED', 'Struggles marked as inferred');
});

test('Requirement 22 & Contract E: Deterministic Recommendation Generation and Reasons', async () => {
  const alexId = '11111111-1111-1111-1111-111111111111';
  const recs = await recommendationEngine.getRecommendations(alexId, 5);

  assert.ok(Array.isArray(recs), 'Should return recommendation array');
  assert.ok(recs.length > 0, 'Should return recommendations');
  assert.ok(recs[0].reasons.length > 0, 'Top recommendation must contain explainability reasons');
  assert.ok(recs[0].whyAmISeeingThis.breakdown.length === 6, 'Why am I seeing this contains 6 dimensional breakdown');

  // Verify descending sort by score
  for (let i = 0; i < recs.length - 1; i++) {
    assert.ok(recs[i].score >= recs[i + 1].score, 'Recommendations must be sorted deterministically in descending order');
  }
});
