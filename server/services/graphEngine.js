function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

function buildGraph(nodes, routes) {
  const graph = {};

  nodes.forEach(n => {
    graph[n.id] = [];
  });

  routes.forEach(r => {
    const from = nodes.find(n => n.id === r.from);
    const to = nodes.find(n => n.id === r.to);

    if (!from || !to) return;

    const dist = distance(from, to);
    const risk = ((from.riskScore || 0) + (to.riskScore || 0)) / 2;

    // 🔥 Combined score
    const weight = dist + risk * 0.1;

    graph[from.id].push({ node: to.id, weight });
    graph[to.id].push({ node: from.id, weight });
  });

  return graph;
}

// 🔥 DIJKSTRA
function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  Object.keys(graph).forEach(n => {
    dist[n] = Infinity;
  });

  dist[start] = 0;

  while (true) {
    let closest = null;

    for (let node in dist) {
      if (!visited.has(node)) {
        if (!closest || dist[node] < dist[closest]) {
          closest = node;
        }
      }
    }

    if (!closest || closest === end) break;

    visited.add(closest);

    graph[closest].forEach(nei => {
      const newDist = dist[closest] + nei.weight;

      if (newDist < dist[nei.node]) {
        dist[nei.node] = newDist;
        prev[nei.node] = closest;
      }
    });
  }

  const path = [];
  let curr = end;

  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }

  return path;
}

module.exports = { buildGraph, dijkstra };