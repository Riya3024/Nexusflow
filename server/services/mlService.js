const axios = require("axios");

// 🔥 ML API
const mlClient = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000
});

// 🔥 cache
const cache = new Map();

function getCacheKey(n) {
  return `${Math.round(n.weather)}-${Math.round(n.traffic)}-${Math.round(n.ships)}-${Math.round(n.delay)}`;
}

// ==========================
// 🔥 MAIN FUNCTION
// ==========================
async function getBatchMLRisk(nodes) {
  try {
    const inputs = [];
    const results = [];

    nodes.forEach((node, index) => {
      const rf = node.riskFactors || {};

      const weather = rf.weatherSeverity || 0;
      const traffic = rf.traffic || 0;
      const ships = rf.shipDensity || 0;
      const delay = rf.delayRate || 0;

      const key = getCacheKey({ weather, traffic, ships, delay });

      if (cache.has(key)) {
        results[index] = cache.get(key);
      } else {
        inputs.push({ weather, traffic, ships, delay, index, key });
      }
    });

    // 🔥 CALL ML API
    if (inputs.length > 0) {
      const res = await mlClient.post("/predict-batch", {
        nodes: inputs.map(i => ({
          weather: i.weather,
          traffic: i.traffic,
          ships: i.ships,
          delay: i.delay
        }))
      });

      const preds = res.data.predictions;

      inputs.forEach((item, i) => {
        const value = Number(preds[i].toFixed(2));

        cache.set(item.key, value);
        results[item.index] = value;
      });
    }

    return results;

  } catch (err) {
    console.error("❌ ML ERROR:", err.message);

    return nodes.map(n => fallbackRisk(n));
  }
}

// ==========================
// 🔥 FALLBACK (IMPORTANT)
// ==========================
function fallbackRisk(node) {
  const rf = node.riskFactors || {};

  const weather = rf.weatherSeverity || 0;
  const traffic = rf.traffic || 0;
  const ships = rf.shipDensity || 0;
  const delay = rf.delayRate || 0;

  const risk =
    weather * 0.25 +
    traffic * 0.30 +
    ships * 0.25 +
    delay * 0.20;

  return Math.max(0, Math.min(100, Number(risk.toFixed(2))));
}

module.exports = { getBatchMLRisk };