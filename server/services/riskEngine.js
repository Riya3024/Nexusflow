function computeNodeRisk(node) {

  const rf = node.riskFactors || {};

  const congestion = Number(rf.congestionIndex) || 0;
  const weather = Number(rf.weatherSeverity) || 0;
  const delay = Number(rf.delayRate) || 0;
  const geo = Number(rf.geopoliticalRisk) || 0;

  const riskScore =
    congestion * 0.4 +
    weather * 0.2 +
    delay * 0.2 +
    geo * 0.2;

  let riskLevel = "low";

  if (riskScore > 70) riskLevel = "high";
  else if (riskScore > 40) riskLevel = "medium";

  return {
    ...node,
    riskScore: Number(riskScore.toFixed(2)),
    riskLevel
  };
}

module.exports = { computeNodeRisk };