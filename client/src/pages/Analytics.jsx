import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, LineChart, Line, BarChart, Bar
} from "recharts";

export default function Analytics() {

  const [nodes, setNodes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [audit, setAudit] = useState([]);

  // ================= LOAD DATA =================
  useEffect(() => {
    const load = async () => {
      try {
        const n = await axios.get("/api/nodes");
        const r = await axios.get("/api/routes");
        const a = await axios.get("/api/audit");

        setNodes(n.data.data || []);
        setRoutes(r.data.data || []);
        setAudit(a.data.data || []);
      } catch (err) {
        console.error("ANALYTICS ERROR:", err);
      }
    };

    load();
  }, []);

  // ================= CALCULATIONS =================

  // 🔹 Avg Risk
  const avgRisk =
    nodes.reduce((sum, n) => sum + (n.riskScore || 0), 0) /
    (nodes.length || 1);

  // 🔹 Avg Delay
  const avgDelay =
    routes.reduce((sum, r) => sum + (r.delay || 0), 0) /
    (routes.length || 1);

  // 🔹 Disruptions (from audit)
  const disruptions =
    audit.filter(a => a.type === "CASCADE").length;

  // 🔹 Route Risk (same logic as map)
  const getRouteRisk = (r) => {
    const from = nodes.find(n => n.id === r.from);
    const to = nodes.find(n => n.id === r.to);

    if (!from || !to) return 0;

    return ((from.riskScore || 0) + (to.riskScore || 0)) / 2;
  };

  // 🔹 Top Risk Routes
  const topRoutes = routes
    .map(r => ({
      name: r.id,
      risk: getRouteRisk(r)
    }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);

  // 🔹 Chart Data
  const summaryData = [
    { name: "Risk", value: Number(avgRisk.toFixed(2)) },
    { name: "Delay", value: Number(avgDelay.toFixed(2)) },
    { name: "Disruptions", value: disruptions }
  ];

  return (
    <div style={{
      padding: 20,
      background: "#070B14",
      minHeight: "100vh",
      color: "white"
    }}>

      <h2 style={{ color: "#38BDF8" }}>📊 Analytics</h2>

      {/* ================= KPI ================= */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div>⚠️ Avg Risk: {avgRisk.toFixed(2)}</div>
        <div>⏱ Avg Delay: {avgDelay.toFixed(2)}h</div>
        <div>💥 Disruptions: {disruptions}</div>
      </div>

      {/* ================= AREA ================= */}
      <AreaChart width={500} height={200} data={summaryData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area dataKey="value" stroke="#38BDF8" fill="#38BDF8" />
      </AreaChart>

      {/* ================= LINE ================= */}
      <LineChart width={500} height={200} data={summaryData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line dataKey="value" stroke="#22C55E" />
      </LineChart>

      {/* ================= TOP ROUTES ================= */}
      <h3 style={{ marginTop: 30 }}>🔥 Top Risk Routes</h3>

      <BarChart width={500} height={200} data={topRoutes}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="risk" fill="#EF4444" />
      </BarChart>

    </div>
  );
}