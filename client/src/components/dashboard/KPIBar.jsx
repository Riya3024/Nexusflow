import { useEffect, useState } from "react";
import axios from "axios";

export default function KPIBar() {
  const [stats, setStats] = useState({
    shipments: 0,
    risky: 0,
    avgRisk: 0,
    aiAccept: 0
  });

  const [display, setDisplay] = useState(stats);

  const loadStats = async () => {
    try {
      const nodesRes = await axios.get("/api/nodes");
      const alertsRes = await axios.get("/api/alerts");
      const auditRes = await axios.get("/api/audit");

      const nodes = nodesRes.data.data || [];
      const alerts = alertsRes.data.data || [];
      const audit = auditRes.data.data || [];

      // 🔥 KPI CALCULATION
      const shipments = nodes.length;

      const risky = nodes.filter(n => n.riskScore > 60).length;

      const avgRisk =
        nodes.reduce((sum, n) => sum + (n.riskScore || 0), 0) /
        (nodes.length || 1);

      const accepts = audit.filter(a => a.action === "ACCEPT").length;
      const totalActions = audit.filter(a => a.type === "ROUTE_ACTION").length;

      const aiAccept =
        totalActions === 0
          ? 0
          : Math.round((accepts / totalActions) * 100);

      setStats({
        shipments,
        risky,
        avgRisk: Math.round(avgRisk),
        aiAccept
      });

    } catch (err) {
      console.error("KPI error:", err);
    }
  };

  // 🔄 AUTO REFRESH
  useEffect(() => {
    loadStats();
    const i = setInterval(loadStats, 5000);
    return () => clearInterval(i);
  }, []);

  // 🎬 COUNT-UP ANIMATION
  useEffect(() => {
    const duration = 500;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);

      setDisplay({
        shipments: Math.floor(progress * stats.shipments),
        risky: Math.floor(progress * stats.risky),
        avgRisk: Math.floor(progress * stats.avgRisk),
        aiAccept: Math.floor(progress * stats.aiAccept)
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [stats]);

  const boxStyle = {
    flex: 1,
    background: "#070B14",
    border: "1px solid #1E3056",
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    boxShadow: "0 0 10px rgba(56,189,248,0.2)"
  };

  const labelStyle = {
    fontSize: 12,
    color: "#94A3B8"
  };

  const valueStyle = {
    fontSize: 22,
    fontWeight: "bold",
    color: "#38BDF8"
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: 10,
        background: "#0D1526"
      }}
    >
      <div style={boxStyle}>
        <div style={labelStyle}>🚚 Shipments</div>
        <div style={valueStyle}>{display.shipments}</div>
      </div>

      <div style={boxStyle}>
        <div style={labelStyle}>⚠️ Risky Nodes</div>
        <div style={{ ...valueStyle, color: "#F87171" }}>
          {display.risky}
        </div>
      </div>

      <div style={boxStyle}>
        <div style={labelStyle}>📊 Avg Risk</div>
        <div style={{ ...valueStyle, color: "#FACC15" }}>
          {display.avgRisk}
        </div>
      </div>

      <div style={boxStyle}>
        <div style={labelStyle}>🤖 AI Accept %</div>
        <div style={{ ...valueStyle, color: "#22C55E" }}>
          {display.aiAccept}%
        </div>
      </div>
    </div>
  );
}