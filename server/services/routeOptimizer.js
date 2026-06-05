function optimizeRoutes(routes = [], nodes = []) {

  return routes.map(route => {

    const from = nodes.find(n => n.id === route.from);
    const to = nodes.find(n => n.id === route.to);

    if (!from || !to) return null;

    const avgRisk = ((from.riskScore || 0) + (to.riskScore || 0)) / 2;

    return {
      ...route,
      avgRisk
    };

  }).filter(Boolean)
    .sort((a, b) => a.avgRisk - b.avgRisk);
}

module.exports = { optimizeRoutes };