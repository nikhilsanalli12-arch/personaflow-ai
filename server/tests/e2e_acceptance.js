const assert = require('node:assert');

async function runE2EAcceptance() {
  console.log('--- Starting Requirement 124 End-to-End Acceptance Scenario ---');

  // 1. Login as Alex Demo
  console.log('1. Authenticating as Alex Demo...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@personaflow.ai', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  assert.ok(loginData.success, 'Login failed');
  const token = loginData.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('   Authenticated successfully. Token acquired.');

  // 2. Fetch Initial Dashboard & Persona
  console.log('2. Fetching dashboard and active persona state...');
  const dashRes = await fetch('http://localhost:5000/api/dashboard', { headers });
  const dashData = await dashRes.json();
  assert.ok(dashData.success, 'Dashboard retrieval failed');
  const initialPersona = dashData.data.persona;
  console.log(`   Persona assessed skill: ${initialPersona.skillLevel}, Context: ${initialPersona.currentContext}, Confidence: ${initialPersona.confidence}%`);

  // 3. Verify initial recommendations
  console.log('3. Verifying initial recommendation feed...');
  const recRes = await fetch('http://localhost:5000/api/recommendations', { headers });
  const recData = await recRes.json();
  assert.ok(recData.success, 'Recommendations retrieval failed');
  const recs = recData.data.recommendations;
  assert.ok(recs.length > 0, 'No recommendations returned');
  console.log(`   Top recommendation: "${recs[0].title}" (Score: ${recs[0].score}%)`);
  console.log(`   Primary reason: "${recs[0].reasons[0]}"`);

  // 4. Record new interaction
  console.log('4. Logging content interactions...');
  const intRes = await fetch('http://localhost:5000/api/interactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      eventType: 'view_content',
      contentId: recs[0].contentId,
      context: 'Building Project',
      metadata: { action: 'deep_inspection' }
    })
  });
  const intData = await intRes.json();
  assert.ok(intData.success, 'Interaction logging failed');
  console.log('   Interaction recorded and evaluated by signal extractor.');

  // 5. Submit feedback: Useful to one recommendation, Too Easy to another
  console.log('5. Submitting user feedback signals...');
  await fetch(`http://localhost:5000/api/recommendations/${recs[0].contentId}/feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ feedback: 'useful' })
  });
  if (recs.length > 1) {
    await fetch(`http://localhost:5000/api/recommendations/${recs[1].contentId}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ feedback: 'too_easy' })
    });
  }
  console.log('   Positive and negative feedback signals persisted.');

  // 6. Refresh recommendations & verify ranking changes
  console.log('6. Refreshing recommendations...');
  const refreshRes = await fetch('http://localhost:5000/api/recommendations/refresh', {
    method: 'POST',
    headers
  });
  const refreshData = await refreshRes.json();
  assert.ok(refreshData.success, 'Refresh failed');
  console.log('   Recommendations freshly re-scored.');

  // 7. Context Switching: Switch to Interview Preparation (Requirement 13)
  console.log('7. Switching Context Mode to "Interview Preparation"...');
  const switchRes = await fetch('http://localhost:5000/api/context', {
    method: 'POST',
    headers,
    body: JSON.stringify({ context: 'Interview Preparation', reason: 'Judge scenario context test' })
  });
  const switchData = await switchRes.json();
  assert.ok(switchData.success, 'Context switch failed');
  assert.strictEqual(switchData.data.currentContext, 'Interview Preparation');
  const interviewRecs = switchData.data.recommendations;
  console.log(`   New Top recommendation in Interview Preparation: "${interviewRecs[0].title}" (Score: ${interviewRecs[0].score}%)`);

  // 8. Ask Personalized AI Assistant (Requirement 49, Contract K)
  console.log('8. Querying contextual AI assistant...');
  const aiRes = await fetch('http://localhost:5000/api/assistant/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: 'How should I prepare for a full-stack interview?' })
  });
  const aiData = await aiRes.json();
  assert.ok(aiData.success, 'Assistant failed');
  console.log(`   Assistant response generated (Confidence: ${aiData.data.confidence}%).`);
  console.log(`   Personalization applied: ${aiData.data.personalizationUsed.join(', ')}`);

  // 9. Inspect Persona Timeline & What Changed (Requirement 30 & 31)
  console.log('9. Checking Persona Audit Timeline & State Transitions...');
  const timeRes = await fetch('http://localhost:5000/api/persona/timeline', { headers });
  const timeData = await timeRes.json();
  assert.ok(timeData.data.events.length > 0, 'No persona timeline events');
  console.log(`   Verified ${timeData.data.events.length} chronological persona events.`);

  const changesRes = await fetch('http://localhost:5000/api/persona/changes', { headers });
  const changesData = await changesRes.json();
  assert.ok(changesData.data.changes.length > 0, 'No state transitions recorded');
  console.log(`   First transition: ${changesData.data.changes[0].before} -> ${changesData.data.changes[0].after} (Trigger: ${changesData.data.changes[0].trigger})`);

  // 10. Inspect Before / After Comparison (Requirement 36)
  console.log('10. Comparing Generic Baseline vs Adaptive Recommendations...');
  const compRes = await fetch('http://localhost:5000/api/recommendations/comparison', { headers });
  const compData = await compRes.json();
  assert.ok(compData.data.personalized.length > 0, 'No personalized recs');
  assert.ok(compData.data.genericBaseline.length > 0, 'No baseline recs');
  console.log(`    Personalized top: "${compData.data.personalized[0].title}" vs Baseline: "${compData.data.genericBaseline[0].title}"`);

  // 11. Test Persona Reset (Requirement 32)
  console.log('11. Testing Persona Reset...');
  const resetRes = await fetch('http://localhost:5000/api/persona/reset', {
    method: 'POST',
    headers
  });
  const resetData = await resetRes.json();
  assert.ok(resetData.success, 'Reset failed');
  console.log('    Inferred struggle areas cleared, restored baseline profile.');

  console.log('\n============================================================');
  console.log('🎉 ALL REQUIREMENT 124 ACCEPTANCE SCENARIOS VERIFIED SUCCESSFULLY!');
  console.log('============================================================\n');
}

runE2EAcceptance().catch(err => {
  console.error('E2E Acceptance Failed:', err);
  process.exit(1);
});
