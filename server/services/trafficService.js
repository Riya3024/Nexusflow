function getTrafficCongestion(node) {

  let congestion = 35;

  const hour = new Date().getHours();

  // ⏱ Peak hours (global pattern)
  if (hour >= 7 && hour <= 10) congestion += 25;
  if (hour >= 17 && hour <= 20) congestion += 25;

  // 🌆 Major logistics hubs
  const busyPorts = [
    "Singapore",
    "Shanghai",
    "Mumbai",
    "New York",
    "Los Angeles",
    "Tokyo"
  ];

  if (busyPorts.includes(node.name)) {
    congestion += 20;
  }

  // 🌧 Weather impact
  if (node.riskFactors.weatherSeverity > 50) {
    congestion += 15;
  }

  // 🌍 Trade belt (heavy shipping zones)
  if (node.lat > -10 && node.lat < 40) {
    congestion += 10;
  }

  // 🔀 controlled variation
  congestion += Math.random() * 8 - 4;

  return Math.max(0, Math.min(100, congestion));
}

module.exports = { getTrafficCongestion };