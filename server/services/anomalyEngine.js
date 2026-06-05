function detectAnomaly(node) {
  const history = node.history || [];

  if (history.length < 3) return null;

  const latest = history[history.length - 1];
  const prev = history[history.length - 2];

  const spike = latest - prev;

  // 🚨 1. Sudden spike
  if (spike > 25) {
    return {
      type: "RISK_SPIKE",
      severity: "HIGH",
      title: "⚠️ Sudden Risk Spike",
      description: `${node.name} risk jumped ${prev} → ${latest}`
    };
  }

  // 🚨 2. Critical threshold
  if (latest > 80) {
    return {
      type: "CRITICAL",
      severity: "CRITICAL",
      title: "🚨 Critical Risk",
      description: `${node.name} reached ${latest}`
    };
  }

  // 📈 3. Trend detection
  if (
    history.length >= 4 &&
    history.slice(-4).every((v, i, arr) => i === 0 || v > arr[i - 1])
  ) {
    return {
      type: "TREND",
      severity: "MEDIUM",
      title: "📈 Increasing Trend",
      description: `${node.name} risk continuously rising`
    };
  }

  // 🧠 4. ML deviation (ADVANCED)
  const avg =
    history.reduce((a, b) => a + b, 0) / history.length;

  if (Math.abs(latest - avg) > 30) {
    return {
      type: "ANOMALY",
      severity: "MEDIUM",
      title: "🧠 Risk Deviation",
      description: `${node.name} deviates from normal pattern`
    };
  }

  return null;
}

module.exports = { detectAnomaly };