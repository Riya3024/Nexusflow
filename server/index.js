const path = require("path");
require("dotenv").config();
console.log("1. index.js loaded");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const ENABLE_DATA_COLLECTION = process.env.DATA_COLLECTION === "true";
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

const { generateNodes, generateRoutes } = require("./data/syntheticData");
const { computeNodeRisk } = require("./services/riskEngine");
const { optimizeRoutes } = require("./services/routeOptimizer");
const { getWeatherRisk } = require("./services/weatherService");
const { getBatchMLRisk } = require("./services/mlService");
const { getShipDensity } = require("./services/shipService");
const { getTrafficCongestion } = require("./services/trafficService");
const { getDelayIndex } = require("./services/delayService");
const { callGemini, getRouteAlternatives, getCascadeAnalysis, askGemini } = require("./services/geminiService");
const { detectAnomaly } = require("./services/anomalyEngine");
const { buildGraph, dijkstra } = require("./services/graphEngine");
const { startShipmentAutoUpdate } = require("./services/shipmentAutoUpdate");

console.log("2. imports completed");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const shipmentRoutes = require("./routes/shipment");


startShipmentAutoUpdate();
const apiRoutes = require("./routes/api");

app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);

// ================= INITIAL DATA =================

let nodes = generateNodes(15);
const routes = generateRoutes(nodes);

nodes = nodes.map((n) => computeNodeRisk(n));

let alerts = [];
app.use("/api", apiRoutes({ nodes, routes, alerts }));

// ================= 📊 DATA COLLECTION =================

function collectData(node) {
  const record = {
    timestamp: Date.now(),
    nodeId: node.id,
    weather: node.riskFactors.weatherSeverity || 0,
    traffic: node.riskFactors.traffic || 0,
    ships: node.riskFactors.shipDensity || 0,
    delay: node.riskFactors.delayRate || 0,
    actualDelay: (node.riskFactors.delayRate || 0) + (Math.random() * 10 - 5)
  };

  fs.appendFileSync("./dataset.json", JSON.stringify(record) + "\n");
}

// ================= API =================

app.get("/api/nodes", async (req, res) => {
  try {
    const predictions = await getBatchMLRisk(nodes);

    nodes.forEach((n, i) => {
      n.riskScore = predictions[i];
    });

    res.json({ success: true, data: nodes });
  } catch (err) {
    console.error("NODE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/routes", (req, res) => {
  res.json({ success: true, data: routes });
});

app.get("/api/alerts", (req, res) => {
  res.json({ success: true, data: alerts });
});

app.post("/api/optimize", async (req, res) => {
  try {
    const { routeId } = req.body;
    const route = routes.find((r) => r.id === routeId);
    const result = await getRouteAlternatives(route, nodes);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulate", async (req, res) => {
  try {
    const { nodeId } = req.body;
    const node = nodes.find((n) => n.id === nodeId);

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    const prompt = `
A port named ${node.name} is disrupted.

Predict:
1. Which connected ports will be affected
2. Why (traffic, congestion, routes)

Keep answer short.
`;

    const result = await callGemini(prompt);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("SIMULATION ERROR:", err);
    res.json({
      success: false,
      data: "Simulation failed"
    });
  }
});

app.post("/api/cascade", async (req, res) => {
  try {
    const { node } = req.body;
    const result = await getCascadeAnalysis(node, nodes);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("CASCADE ERROR:", err);
    res.status(500).json({ error: "Cascade failed" });
  }
});

app.post("/api/query", async (req, res) => {
  try {
    const { question } = req.body;

    const systemState = {
      totalNodes: nodes.length,
      riskyNodes: nodes.filter((n) => n.riskScore > 60).length
    };

    const answer = await askGemini(question, systemState);

    res.json({ success: true, data: answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const riskyNodes = nodes
      .filter((n) => n.riskScore > 60)
      .map((n) => n.id);

    const optimized = optimizeRoutes(routes, nodes);
    const bestRoute = optimized[0];

    const predictions = await getBatchMLRisk(nodes);

    const predictionData = nodes.map((n, i) => ({
      id: n.id,
      predictedRisk: predictions[i]
    }));

    nodes.forEach((n, i) => {
      n.riskScore = predictions[i];
    });

    res.json({
      success: true,
      data: {
        riskyNodes,
        bestRouteId: bestRoute?.id,
        predictions: predictionData
      }
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/decision", (req, res) => {
  try {
    const { selectedRoute, aiRoute, accepted } = req.body;
    const { addAudit } = require("./data/auditStore");

    addAudit({
      type: "ROUTE_DECISION",
      selectedRoute,
      aiRoute,
      accepted,
      time: Date.now()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/metrics/ai-accept", (req, res) => {
  const { getAudit } = require("./data/auditStore");
  const logs = getAudit();
  const decisions = logs.filter((l) => l.type === "ROUTE_DECISION");
  const accepted = decisions.filter((d) => d.accepted).length;

  const percent = decisions.length === 0 ? 0 : (accepted / decisions.length) * 100;

  res.json({
    success: true,
    data: Number(percent.toFixed(1))
  });
});

app.post("/api/route/find", async (req, res) => {
  try {
    const { start, end } = req.body;
    const graph = buildGraph(nodes, routes);

    const pathResult = dijkstra(graph, start, end);

    const totalRisk = pathResult.reduce((sum, id) => {
      const node = nodes.find((n) => n.id === id);
      return sum + (node?.riskScore || 0);
    }, 0);

    const avgRisk = pathResult.length ? totalRisk / pathResult.length : 0;

    const bestRoute = {
      path: pathResult,
      avgRisk,
      totalRisk
    };

    const aiRoutesRaw = await getRouteAlternatives(bestRoute, nodes);
    const aiRoutes = Array.isArray(aiRoutesRaw) ? aiRoutesRaw : [];

    res.json({
      success: true,
      data: {
        dijkstra: {
          label: "Safest Route (System)",
          path: pathResult,
          avgRisk: Number(avgRisk.toFixed(2)),
          totalRisk: Number(totalRisk.toFixed(2))
        },
        aiAlternatives: aiRoutes.map((r, i) => ({
          rank: r.rank || i + 1,
          path: r.path || [],
          risk: r.newRiskScore || 0,
          reason: r.reason || "AI recommendation"
        }))
      }
    });
  } catch (err) {
    console.error("ROUTE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= SIMULATION LOOP =================

setInterval(async () => {
  try {
    for (let n of nodes) {
      const weatherRisk = await getWeatherRisk(n.lat, n.lng);
      n.riskFactors.weatherSeverity = weatherRisk;
      n.riskFactors.shipDensity = getShipDensity(n);
      n.riskFactors.traffic = getTrafficCongestion(n);
      n.riskFactors.delayRate = getDelayIndex(n);

      const updated = computeNodeRisk(n);

      updated.history = updated.history || [];
      updated.history.push(updated.riskScore);

      if (updated.history.length > 5) {
        updated.history.shift();
      }

      Object.assign(n, updated);

      const anomaly = detectAnomaly(n);

      if (anomaly) {
        const alert = {
          id: Date.now() + Math.random(),
          ...anomaly,
          node: n.name,
          time: Date.now()
        };

        alerts.push(alert);

        if (alerts.length > 10) {
          alerts.shift();
        }

        console.log("🚨 ALERT:", alert);

        const { addAudit } = require("./data/auditStore");
        addAudit({
          type: "ANOMALY",
          node: n.name,
          description: anomaly.description
        });
      }

      if (ENABLE_DATA_COLLECTION) {
        collectData(n);
      }
    }
  } catch (err) {
    console.error("INTERVAL ERROR:", err);
  }
}, 30000);

// ================= REACT BUILD =================

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Start shipment auto-update at the end


console.log("3. before app.listen");

// ================= START =================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});