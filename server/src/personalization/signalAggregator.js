// Signal aggregation & threshold verification (Requirement 27, Contract D)
const { calculateConfidence } = require('./confidenceEngine');

function aggregateSignals(existingSignals = [], newSignals = []) {
  const signalMap = new Map();

  // Combine existing and new signals
  const all = [...existingSignals, ...newSignals];

  for (const s of all) {
    const key = `${s.type}:${String(s.value).toLowerCase()}`;
    if (!signalMap.has(key)) {
      signalMap.set(key, {
        type: s.type,
        value: s.value,
        source: s.source,
        count: 1,
        reasons: [s.reason],
        evidences: s.evidence || [],
        latestTime: new Date(s.createdAt || Date.now())
      });
    } else {
      const entry = signalMap.get(key);
      entry.count += 1;
      if (s.reason && !entry.reasons.includes(s.reason)) entry.reasons.push(s.reason);
      if (s.evidence) entry.evidences.push(...s.evidence);
      if (s.source === 'user') entry.source = 'user'; // user always highest authority
      const t = new Date(s.createdAt || Date.now());
      if (t > entry.latestTime) entry.latestTime = t;
    }
  }

  // Filter and compute unified confidence
  const aggregated = [];
  for (const [, item] of signalMap.entries()) {
    const recencyDays = Math.max(0, (Date.now() - item.latestTime.getTime()) / (1000 * 3600 * 24));
    const confidence = calculateConfidence({
      source: item.source,
      supportingCount: item.count,
      recencyDays
    });

    aggregated.push({
      type: item.type,
      value: item.value,
      source: item.source,
      confidence,
      reason: item.reasons[item.reasons.length - 1],
      count: item.count,
      evidence: item.evidences
    });
  }

  return aggregated;
}

module.exports = {
  aggregateSignals
};
