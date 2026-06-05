function findRoutes(graph, start, end, visited = [], path = []) {
  visited.push(start);
  path.push(start);

  if (start === end) return [path];

  let paths = [];

  graph
    .filter(r => r.from === start)
    .forEach(r => {
      if (!visited.includes(r.to)) {
        const newPaths = findRoutes(graph, r.to, end, [...visited], [...path]);
        paths.push(...newPaths);
      }
    });

  return paths;
}

// 🔥 NEW — RISK-BASED BEST ROUTE
function getBestRoute(paths, nodes) {

  const scored = paths.map(path => {

    const risks = path.map(id => {
      const node = nodes.find(n => n.id === id);
      return node?.riskScore || 0;
    });

    const totalRisk = risks.reduce((a, b) => a + b, 0);
    const avgRisk = totalRisk / path.length;

    return {
      path,
      totalRisk,
      avgRisk
    };
  });

  // 🔥 Sort by lowest risk
  scored.sort((a, b) => a.avgRisk - b.avgRisk);

  return scored[0];
}

module.exports = { findRoutes, getBestRoute };