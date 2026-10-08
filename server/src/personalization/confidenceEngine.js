// Deterministic Confidence Engine (Requirement 25, 26)
// baseConfidence + supportSignal + recencySignal - contradictionSignal, clamped 0-100

function calculateConfidence({
  source = 'interaction',
  supportingCount = 1,
  recencyDays = 0,
  contradictionCount = 0
}) {
  let baseConfidence = 50;

  if (source === 'user') {
    baseConfidence = 100;
  } else if (source === 'quiz') {
    baseConfidence = 75;
  } else if (source === 'feedback') {
    baseConfidence = 70;
  } else if (source === 'interaction') {
    baseConfidence = 45;
  } else if (source === 'ai') {
    baseConfidence = 40;
  }

  // Supporting signals (+5 per repeated observation, max +25)
  const supportSignal = Math.min(25, (supportingCount - 1) * 5);

  // Recency bonus: fresh within 7 days gives +10, within 30 days gives +5
  let recencySignal = 0;
  if (recencyDays <= 7) {
    recencySignal = 10;
  } else if (recencyDays <= 30) {
    recencySignal = 5;
  } else if (recencyDays > 90) {
    recencySignal = -10;
  }

  // Contradiction penalty (-15 each)
  const contradictionSignal = contradictionCount * 15;

  const total = baseConfidence + supportSignal + recencySignal - contradictionSignal;
  return Math.max(10, Math.min(100, Math.round(total)));
}

module.exports = {
  calculateConfidence
};
