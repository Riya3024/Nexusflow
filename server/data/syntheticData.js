const rand = (min, max) => Math.random() * (max - min) + min;

// 🌍 REAL GLOBAL PORT LIST
const PORTS = [
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "Shanghai", lat: 31.23, lng: 121.47 },
  { name: "Mumbai", lat: 19.07, lng: 72.87 },
  { name: "Dubai", lat: 25.27, lng: 55.29 },
  { name: "Rotterdam", lat: 51.92, lng: 4.47 },
  { name: "Hamburg", lat: 53.55, lng: 9.99 },
  { name: "Los Angeles", lat: 34.05, lng: -118.24 },
  { name: "New York", lat: 40.71, lng: -74.0 },
  { name: "Tokyo", lat: 35.67, lng: 139.65 },
  { name: "Sydney", lat: -33.86, lng: 151.2 },
  { name: "Durban", lat: -29.88, lng: 31.05 },
  { name: "Santos", lat: -23.96, lng: -46.33 },
  { name: "Busan", lat: 35.18, lng: 129.07 },
  { name: "Hong Kong", lat: 22.32, lng: 114.17 },
  { name: "Antwerp", lat: 51.22, lng: 4.4 },
  { name: "Jeddah", lat: 21.48, lng: 39.19 },
  { name: "Cape Town", lat: -33.92, lng: 18.42 },
  { name: "Melbourne", lat: -37.81, lng: 144.96 },
  { name: "Vancouver", lat: 49.28, lng: -123.12 },
  { name: "San Francisco", lat: 37.77, lng: -122.42 }
];

// 📦 GENERATE NODES
function generateNodes(count = 15) {
  const selected = [...PORTS]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  return selected.map(port => ({
    id: port.name.toLowerCase().replace(/\s/g, "_"),
    name: port.name,
    lat: port.lat,
    lng: port.lng,
    riskFactors: {
      congestionIndex: rand(20, 80),
      weatherSeverity: rand(10, 60),
      delayRate: rand(10, 70),
      geopoliticalRisk: rand(5, 50)
    },
    history: []
  }));
}

// 📏 DISTANCE
function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

// 🔗 GENERATE ROUTES
function generateRoutes(nodes) {
  const routes = [];

  nodes.forEach(node => {
    const connections = nodes
      .filter(n => n.id !== node.id)
      .sort((a, b) => distance(node, a) - distance(node, b))
      .slice(0, 3);

    connections.forEach(target => {
      routes.push({
        id: `r_${node.id}_${target.id}`,
        from: node.id,
        to: target.id
      });
    });
  });

  return routes;
}

module.exports = { generateNodes, generateRoutes };