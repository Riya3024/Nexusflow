// ======================================================
// 📊 PHASE 3 — ADVANCED RISK PREDICTION ENGINE
// ======================================================

// 🧹 Utility: Clean numeric array (remove null/NaN)
function cleanHistory(history = []) {
  return history.filter(v => typeof v === "number" && !isNaN(v));
}

// 📈 Core Prediction Logic
function predictRisk(node) {

  const historyRaw = node.history || [];
  const history = cleanHistory(historyRaw);

  const currentRisk = Number(node.riskScore) || 0;

  // ❌ Not enough data
  if (history.length < 3) {
    return {
      id: node.id,
      name: node.name,
      willBeRisky: false,
      trend: "insufficient_data",
      confidence: 0,
      predictedRisk: currentRisk,
      growth: 0
    };
  }

  // 🔢 Last values
  const last3 = history.slice(-3);
  const [a, b, c] = last3;

  // 📈 Trend detection
  const isIncreasing = a < b && b < c;
  const isDecreasing = a > b && b > c;

  let trend = "stable";
  if (isIncreasing) trend = "increasing";
  else if (isDecreasing) trend = "decreasing";

  // 📊 Growth calculation
  const growth = c - a;

  // 🔮 Predict next value (momentum-based)
  let predictedRisk = c + (growth / 2);

  // 🧯 Clamp values (safe bounds)
  predictedRisk = Math.max(0, Math.min(100, predictedRisk));

  // 🎯 Confidence score
  let confidence = 0;

  if (isIncreasing) confidence = 0.85;
  else if (trend === "stable") confidence = 0.6;
  else if (isDecreasing) confidence = 0.4;

  // 🚨 Risk condition
  const willBeRisky = predictedRisk > 60;

  return {
    id: node.id,
    name: node.name,
    current: Number(currentRisk.toFixed(2)),
    predictedRisk: Number(predictedRisk.toFixed(2)),
    growth: Number(growth.toFixed(2)),
    trend,
    confidence: Number((confidence * 100).toFixed(0)),
    willBeRisky
  };
}

// ======================================================
// 🔥 BULK PREDICTIONS (FOR ALL NODES)
// ======================================================

function getPredictions(nodes = []) {

  if (!Array.isArray(nodes)) return [];

  return nodes
    .map(node => predictRisk(node))
    .filter(p => p.willBeRisky); // only risky predictions
}

// ======================================================
// 📤 EXPORT
// ======================================================

module.exports = {
  predictRisk,
  getPredictions
};