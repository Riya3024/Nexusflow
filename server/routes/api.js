
const express = require("express");
const { addAudit, getAudit } = require("../data/auditStore");



// ✅ ALL IMPORTS AT THE TOP (moved here + added askGemini)
const { getBatchMLRisk } = require("../services/mlService");
const { getCascadeAnalysis, callGemini, safeJsonParse, askGemini } = require("../services/geminiService");
const { buildShipmentPlan } = require("../services/shipmentPlanner");
const { searchCities } = require("../services/locationService");



module.exports = function (appState) {
  const router = express.Router();



  // ================= NODES (🔥 ML INTEGRATED) =================
  router.get("/nodes", async (req, res) => {
    try {



      const nodes = appState.nodes;



      // 🔥 GET ML RISKS
      const risks = await getBatchMLRisk(nodes);



      const nodesWithRisk = nodes.map((node, i) => {
        const riskScore = risks[i] || 0;



        let riskLevel = "low";
        if (riskScore > 70) riskLevel = "high";
        else if (riskScore > 40) riskLevel = "medium";



        return {
          ...node,
          riskScore,
          riskLevel,
          history: node.history?.map(v => v ?? 0) || []
        };
      });



      res.json({
        success: true,
        data: nodesWithRisk
      });



    } catch (err) {
      console.error("ML NODE ERROR:", err);



      res.status(500).json({
        success: false,
        data: []
      });
    }
  });



  // ================= ROUTES =================
  router.get("/routes", (req, res) => {
    res.json({
      success: true,
      data: appState.routes
    });
  });



  // ================= ALERTS =================
  router.get("/alerts", (req, res) => {
    res.json({
      success: true,
      data: appState.alerts
    });
  });



  // ================= AUDIT =================
  router.get("/audit", (req, res) => {
    res.json({ data: getAudit() });
  });



  // ================= ACK ALERT =================
  router.post("/alerts/:id/ack", (req, res) => {
    const alert = appState.alerts.find(a => a.id === req.params.id);



    if (!alert) {
      return res.status(404).json({ error: "Not found" });
    }



    alert.status = "acknowledged";



    res.json({
      success: true,
      data: alert
    });
  });



  // ================= CASCADE =================
  router.post("/cascade", async (req, res) => {
    try {
      const { node } = req.body;
      const nodes = appState.nodes;



      const result = await getCascadeAnalysis(node, nodes);



      // 🔥 REPLACE OLD LOG WITH THIS
      addAudit({
        type: "CASCADE",
        node: node.name,
        result
      });



      res.json({ data: result });



    } catch (err) {
      console.error("CASCADE ERROR:", err);
      res.status(500).json({ error: "Cascade failed" });
    }
  });



  router.post("/analyze-doc", async (req, res) => {
    try {
      const { file } = req.body;



      const prompt = `
You are a logistics AI.



Analyze logistics document.



Return STRICT JSON:
{
  "risks": [],
  "delays": [],
  "recommendations": []
}
`;



      const result = await callGemini(prompt);



      res.json({ data: safeJsonParse(result) });



    } catch (err) {
      console.error("DOC ANALYSIS ERROR:", err);
      res.status(500).json({
        data: {
          risks: ["Failed"],
          delays: [],
          recommendations: []
        }
      });
    }
  });



  router.post("/route-action", (req, res) => {
    try {
      const { route, action } = req.body;



      addAudit({
        type: "ROUTE_ACTION",
        route,
        action
      });



      res.json({ success: true });



    } catch (err) {
      console.error("ROUTE ACTION ERROR:", err);
      res.status(500).json({ error: "Failed to log route action" });
    }
  });



  router.post(
    "/shipment-plan",
    async (req, res) => {



      try {



        const {
          origin,
          destination,
          weight,
          priority,
          budget
        } = req.body;



        const result =
          await buildShipmentPlan(
            origin,
            destination,
            weight,
            priority,
            budget
          );



        res.json({
          success: true,
          data: result
        });



      } catch (err) {



        console.error(err);



        res.status(500).json({
          error: err.message
        });
      }
    }
  );



  router.post("/query", async (req, res) => {
    const { question } = req.body;



    const result = await askGemini(question, appState);



    res.json({ data: result });
  });



  router.get("/shipment-test", (req, res) => {
    res.json({
      success: true,
      message: "working"
    });
  });



  // ================= CITIES =================
  router.get("/cities", async (req, res) => {
    try {
      const q = (req.query.q || "").trim();


      if (!q || q.length < 2) {
        return res.json([]);
      }


      const results = await searchCities(q);
      res.json(results);
    } catch (err) {
      console.error("CITY SEARCH ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  });



  return router;
};