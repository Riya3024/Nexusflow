function getShipDensity(node) {
  const majorPorts = [
    "Singapore",
    "Shanghai",
    "Rotterdam",
    "Los Angeles",
    "Hong Kong"
  ];

  let density = 30;

  if (majorPorts.includes(node.name)) {
    density = 80;
  }

  if (node.lat > 0 && node.lat < 40) {
    density += 10;
  }

  density += Math.random() * 10 - 5;

  return Math.max(0, Math.min(100, density));
}

module.exports = { getShipDensity };