const createRisk = (c) => ({
  congestionIndex: c,
  weatherSeverity: Math.floor(Math.random() * 50),
  delayRate: Math.floor(Math.random() * 50),
  geopoliticalRisk: Math.floor(Math.random() * 50)
});

const MOCK_NODES = [
  { id: "singapore", name: "Singapore", lat: 1.35, lng: 103.82, riskFactors: createRisk(40) },
  { id: "shanghai", name: "Shanghai", lat: 31.23, lng: 121.47, riskFactors: createRisk(55) },
  { id: "mumbai", name: "Mumbai", lat: 19.07, lng: 72.87, riskFactors: createRisk(60) },
  { id: "dubai", name: "Dubai", lat: 25.27, lng: 55.29, riskFactors: createRisk(30) },
  { id: "rotterdam", name: "Rotterdam", lat: 51.92, lng: 4.47, riskFactors: createRisk(35) },
  { id: "hamburg", name: "Hamburg", lat: 53.55, lng: 9.99, riskFactors: createRisk(45) },
  { id: "los_angeles", name: "Los Angeles", lat: 34.05, lng: -118.24, riskFactors: createRisk(70) },
  { id: "new_york", name: "New York", lat: 40.71, lng: -74.00, riskFactors: createRisk(65) },
  { id: "tokyo", name: "Tokyo", lat: 35.67, lng: 139.65, riskFactors: createRisk(50) },
  { id: "sydney", name: "Sydney", lat: -33.86, lng: 151.20, riskFactors: createRisk(35) },
  { id: "durban", name: "Durban", lat: -29.88, lng: 31.05, riskFactors: createRisk(25) },
  { id: "santos", name: "Santos", lat: -23.96, lng: -46.33, riskFactors: createRisk(55) }
];

const MOCK_ROUTES = [
  { id: "r1", from: "singapore", to: "shanghai" },
  { id: "r2", from: "shanghai", to: "tokyo" },
  { id: "r3", from: "singapore", to: "mumbai" },
  { id: "r4", from: "mumbai", to: "dubai" },
  { id: "r5", from: "dubai", to: "rotterdam" },
  { id: "r6", from: "rotterdam", to: "hamburg" },
  { id: "r7", from: "tokyo", to: "los_angeles" },
  { id: "r8", from: "los_angeles", to: "new_york" },
  { id: "r9", from: "new_york", to: "rotterdam" },
  { id: "r10", from: "singapore", to: "sydney" },
  { id: "r11", from: "dubai", to: "durban" },
  { id: "r12", from: "durban", to: "santos" },
  { id: "r13", from: "santos", to: "new_york" }
];

const MOCK_ALERTS = [];

module.exports = {
  MOCK_NODES,
  MOCK_ROUTES,
  MOCK_ALERTS
};