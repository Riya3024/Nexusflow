function getDelayIndex(node) {

  const traffic = node.riskFactors.traffic || 0;
  const ships = node.riskFactors.shipDensity || 0;
  const weather = node.riskFactors.weatherSeverity || 0;

  const delay =
    traffic * 0.4 +
    ships * 0.4 +
    weather * 0.2;

  return Math.max(0, Math.min(100, delay));
}function getDelayIndex(node) {

  const traffic = node.riskFactors.traffic || 0;
  const ships = node.riskFactors.shipDensity || 0;
  const weather = node.riskFactors.weatherSeverity || 0;

  let delay = 0;

  // 🚦 Traffic impact
  delay += traffic * 0.5;

  // 🚢 Port congestion impact
  delay += ships * 0.3;

  // 🌧 Weather impact
  delay += weather * 0.2;

  // 🔁 normalize
  delay = Math.max(0, Math.min(100, delay));

  return delay;
}

module.exports = { getDelayIndex };

module.exports = { getDelayIndex };