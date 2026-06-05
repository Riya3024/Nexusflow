const { getCoordinates } = require("./locationService");
const { calculateDistance } = require("./distanceEngine");
const { getWeatherRisk } = require("./weatherService");
const { getClimateHazardRisk } = require("./hazardService");

function levelFromScore(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

async function buildShipmentPlan(origin, destination, weight, priority, budget) {
  const start = await getCoordinates(origin);
  const end = await getCoordinates(destination);

  const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);

  const [originWeather, destWeather, originHazard, destHazard] = await Promise.all([
    getWeatherRisk(start.lat, start.lng),
    getWeatherRisk(end.lat, end.lng),
    getClimateHazardRisk(start.lat, start.lng),
    getClimateHazardRisk(end.lat, end.lng)
  ]);

  console.log("ORIGIN COORDS:", start);
console.log("DEST COORDS:", end);

console.log(
  "ORIGIN HAZARD:",
  JSON.stringify(originHazard, null, 2)
);

console.log(
  "DEST HAZARD:",
  JSON.stringify(destHazard, null, 2)
);

  const originClimateRisk = Math.round((originWeather.score + originHazard.score) / 2);
  const destinationClimateRisk = Math.round((destWeather.score + destHazard.score) / 2);
  const climateRisk = Math.round((originClimateRisk + destinationClimateRisk) / 2);

  const buildWeatherBlock = (weather, hazard) => ({
  rain: {
    score: weather.raw?.rain ?? 0,
    level: (weather.raw?.rain ?? 0) > 0 ? "medium" : "low"
  },

  snow: {
    score: weather.raw?.snow ?? 0,
    level: (weather.raw?.snow ?? 0) > 0 ? "medium" : "low"
  },

  humidity: {
    score: weather.raw?.humidity ?? 0,
    level: (weather.raw?.humidity ?? 0) > 85 ? "high" : "low"
  },

  wind: {
    score: weather.raw?.windSpeed ?? 0,
    level: (weather.raw?.windSpeed ?? 0) > 10 ? "high" : "low"
  },

  clouds: {
    score: weather.raw?.clouds ?? 0,
    level: (weather.raw?.clouds ?? 0) > 75 ? "medium" : "low"
  },

  pressure: {
    score: weather.raw?.pressure ?? 1013,
    level: (weather.raw?.pressure ?? 1013) < 1000 ? "medium" : "low"
  },

  visibility: {
    score: weather.raw?.visibility ?? 10000,
    level: (weather.raw?.visibility ?? 10000) < 3000 ? "high" : "low"
  },

  temperature: {
    score: weather.raw?.temp ?? 0,
    level: "info"
  },

  feelsLike: {
    score: weather.raw?.feelsLike ?? 0,
    level: "info"
  },

  weatherMain: weather.raw?.weatherMain ?? "Clear",
  weatherDesc: weather.raw?.weatherDesc ?? "",

  flood: {
    score: hazard?.flood?.score ?? 0,
    level: hazard?.flood?.level ?? "low",
    discharge: hazard?.flood?.discharge ?? 0
  },

  earthquake: {
    score: hazard?.earthquake?.score ?? 0,
    level: hazard?.earthquake?.level ?? "low",
    count: hazard?.earthquake?.count ?? 0,
    strongest: hazard?.earthquake?.strongest ?? 0
  },

  hazard
});
    
    

  const originDetails = buildWeatherBlock(originWeather, originHazard);
  const destinationDetails = buildWeatherBlock(destWeather, destHazard);

  const baseRoadRisk = 30;
  const baseAirRisk = 8;
  const baseSeaRisk = 22;

  const roadWeatherImpact = Math.round(originWeather.score * 0.4 + destWeather.score * 0.4);
  const airWeatherImpact = Math.round((originWeather.score + destWeather.score) * 0.15);
  const seaWeatherImpact = Math.round((originWeather.score + destWeather.score) * 0.3);

  const roadHazardImpact = Math.round((originHazard.score + destHazard.score) * 0.5);
  const airHazardImpact = Math.round((originHazard.score + destHazard.score) * 0.2);
  const seaHazardImpact = Math.round((originHazard.score + destHazard.score) * 0.35);

  const roadRisk = Math.min(100, Math.round(baseRoadRisk + roadWeatherImpact + roadHazardImpact));
  const airRisk = Math.min(100, Math.round(baseAirRisk + airWeatherImpact + airHazardImpact));
  const seaRisk = Math.min(100, Math.round(baseSeaRisk + seaWeatherImpact + seaHazardImpact));

  const roadCost = Number((distance * 0.08).toFixed(2));
  const airCost = Number((distance * 0.25).toFixed(2));
  const seaCost = Number((distance * 0.04).toFixed(2));

  const roadTime = Number((distance / 60 + 2).toFixed(1));
  const airTime = Number((distance / 700 + 5).toFixed(1));
  const seaTime = Number((distance / 30 + 24).toFixed(1));

  const options = [
    {
      mode: "Road",
      cost: roadCost,
      time: roadTime,
      risk: roadRisk
    },
    {
      mode: "Air",
      cost: airCost,
      time: airTime,
      risk: airRisk
    },
    {
      mode: "Sea",
      cost: seaCost,
      time: seaTime,
      risk: seaRisk
    }
  ];

  const weights = {
    Critical: { risk: 0.5, time: 0.35, cost: 0.15 },
    High: { risk: 0.4, time: 0.4, cost: 0.2 },
    Medium: { risk: 0.35, time: 0.3, cost: 0.35 },
    Low: { risk: 0.25, time: 0.2, cost: 0.55 },
    Normal: { risk: 0.33, time: 0.33, cost: 0.34 }
  };

  const w = weights[priority] || weights.Normal;
  const scoreOption = (opt) => opt.risk * w.risk + opt.time * w.time + opt.cost * w.cost;
  const recommended = options.reduce((best, opt) => (scoreOption(opt) < scoreOption(best) ? opt : best), options[0]);


console.log(
  JSON.stringify(
    {
      start,
      end,
      originHazard,
      destHazard
    },
    null,
    2
  )
);


  return {
    distance: Number(distance.toFixed(2)),
    climateRisk,
    origin: {
      name: origin,
      coordinates: { lat: start.lat, lng: start.lng },
      weatherRisk: originWeather.score,
      climateRisk: {
        score: originClimateRisk,
        level: levelFromScore(originClimateRisk)
      }
    },
    destination: {
      name: destination,
      coordinates: { lat: end.lat, lng: end.lng },
      weatherRisk: destWeather.score,
      climateRisk: {
        score: destinationClimateRisk,
        level: levelFromScore(destinationClimateRisk)
      }
    },
    climateDetails: {
      origin: originDetails,
      destination: destinationDetails
    },
    options,
    recommendation: {
      mode: recommended.mode,
      reason: `Selected ${recommended.mode} using live weather, flood, earthquake, cost, and time data.`,
      safestOption: Math.min(roadRisk, airRisk, seaRisk),
      fastestOption: Math.min(roadTime, airTime, seaTime),
      cheapestOption: Math.min(roadCost, airCost, seaCost)
    }
  };
}

module.exports = { buildShipmentPlan };