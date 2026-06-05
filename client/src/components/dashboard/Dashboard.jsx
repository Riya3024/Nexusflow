import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "../map/MapView";
import AskAI from "../ai/AskAI";
import AuditStream from "./AuditStream";
import KPIBar from "./KPIBar";

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [start, setStart] = useState("");
const [end, setEnd] = useState("");
const [routeData, setRouteData] = useState(null);
const [aiRoutes, setAiRoutes] = useState([]);
const [selectedRoute, setSelectedRoute] = useState(null);
const [finalRoute, setFinalRoute] = useState(null);

  const [cascadeData, setCascadeData] = useState(null);
  const [loadingCascade, setLoadingCascade] = useState(false);

  // 🔥 ADDED (REQUIRED — fixes error)
  const [weatherOn, setWeatherOn] = useState(false);

  const load = async () => {
    try {
      const n = await axios.get("/api/nodes");
      const r = await axios.get("/api/routes");
      const a = await axios.get("/api/alerts");

      setNodes(n.data.data);
      setRoutes(r.data.data);
      setAlerts(a.data.data);
    } catch (err) {
      console.error(err);
    }
  };

const loadAudit = async () => {
  try {
    const res = await axios.get("/api/audit");

    console.log("📜 AUDIT:", res.data);

    setAudit(Array.isArray(res.data.data) ? res.data.data : []);
  } catch (err) {
    console.error("Audit fetch error:", err);
  }
};

useEffect(() => {
  loadAudit();

  const interval = setInterval(loadAudit, 5000);

  return () => clearInterval(interval);
}, []);

  const findRoute = async () => {
  try {
    const res = await axios.post("/api/route/find", {
      start,
      end
    });
console.log("🚀 ROUTE RESPONSE:", res.data);
    const data = res.data.data;

    setRouteData(data);

// 🔥 FIX: correct key name
setAiRoutes(data.aiAlternatives || []);

// 🔥 DEFAULT ROUTE = DIJKSTRA
setFinalRoute(data.dijkstra?.path || []); // Gemini

  } catch (err) {
    console.error("Route error", err);
  }
};

  useEffect(() => {
  load();

  const interval = setInterval(() => {
    load();
  }, 15000);

  return () => clearInterval(interval);
}, []);

  // =========================
  // 🔥 CASCADE HANDLER
  // =========================
  const handleCascade = (data) => {
    console.log("🔥 CASCADE RECEIVED:", data);

    if (typeof data === "string") {
      setCascadeData({
        affectedPorts: ["Unknown"],
        reason: [data]
      });
    } else {
      setCascadeData(data);
    }

    setLoadingCascade(false);
  };

  // =========================
  // 🔥 ACCEPT / REJECT HANDLERS
  // =========================
  const acceptRoute = async (alert) => {
  try {
    await axios.post("/api/route-action", {
      route: alert.id,
      action: "ACCEPT"
    });

    setSelectedRoute(alert.id);

// 🔥 SWITCH TO AI ROUTE
if (routeData?.aiAlternatives?.length > 0) {
  setFinalRoute(routeData.aiAlternatives[0].path);
}   // ✅ highlight
    loadAudit();
  } catch (err) {
    console.error(err);
  }
};

  const rejectRoute = async (alert) => {
  try {
    await axios.post("/api/route-action", {
      route: alert.id,
      action: "REJECT"
    });

    setSelectedRoute(null);

// 🔥 SWITCH BACK TO SAFE ROUTE
if (routeData?.dijkstra?.path) {
  setFinalRoute(routeData.dijkstra.path);
}   // reset
    loadAudit();
  } catch (err) {
    console.error(err);
  }
};

  // =========================
  // 🔥 FORMAT CASCADE
  // =========================
  function formatCascade(data) {
    if (!data) return null;

    return (
      <div>
        <h4 style={{ color: "#F87171" }}>Affected Ports</h4>
        <ul>
          {data.affectedPorts?.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <h4 style={{ color: "#FACC15" }}>Impact Reason</h4>
        <ul>
          {data.reason?.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "#070B14"
}}>


  <button
  onClick={() => window.location.href = "/audit"}
  style={{
    marginLeft: 10,
    background: "#38BDF8",
    color: "#000",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  }}
>
  📜 Audit Logs
</button>

      {/* ================= TOP BAR ================= */}

      <div style={{
  padding: 10,
  background: "#111827",
  display: "flex",
  gap: 10
}}>

  {/* START */}
  <select onChange={(e) => setStart(e.target.value)}>
    <option>Select Start</option>
    {nodes.map(n => (
      <option key={n.id} value={n.id}>
        {n.name}
      </option>
    ))}
  </select>

  {/* END */}
  <select onChange={(e) => setEnd(e.target.value)}>
    <option>Select Destination</option>
    {nodes.map(n => (
      <option key={n.id} value={n.id}>
        {n.name}
      </option>
    ))}
  </select>

  {/* BUTTON */}
  <button onClick={findRoute}>
    Find Route
  </button>

</div>
      <div style={{
        height: 60,
        background: "#0D1526",
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        color: "#38BDF8"
      }}>
        <h2>NexusFlow Dashboard</h2>
      </div>
      <KPIBar
  nodes={nodes}
  routes={routes}
  alerts={alerts}
  audit={audit}
/>
   <div style={{
  flex: 1,
  display: "flex",     // 🔥 makes map + panel side-by-side
  height: "100%"
}}>
      {/* ================= MAP ================= */}
      <div style={{
    flex: 1,
    height: "100%"     // 🔥 REQUIRED for Leaflet
  }}>
        <MapView
          nodes={nodes}
          routes={routes}
          simulationData={cascadeData}
          weatherOn={weatherOn}
          routeData={routeData} 
          aiRoutes={aiRoutes}
          selectedRoute={selectedRoute}
          finalRoute={finalRoute}  // 🔥 ADDED (required)
          onNodeClick={(data) => {
            setLoadingCascade(true);
            handleCascade(data);
          }}
        />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div style={{
  width: 320,
  background: "#0D1526",
  overflowY: "auto",
  padding: 12
}}>

        {/* 🔥 AI ASSISTANT */}
        <AskAI />

        <hr style={{ margin: "20px 0", borderColor: "#1E3056" }} />

        {/* 🚨 ALERTS */}
        <h3 style={{ color: "#38BDF8" }}>Alerts</h3>

        {alerts.length === 0 && (
          <p style={{ color: "#94A3B8" }}>No alerts</p>
        )}

        {alerts.map(a => (
          <div key={a.id} style={{
            border: "1px solid #1E3056",
            marginBottom: 10,
            padding: 10,
            background: "#070B14"
          }}>
            <strong style={{ color: "#F87171" }}>{a.title}</strong>

            <p style={{ color: "#CBD5F5", fontSize: 13 }}>
              {a.description}
            </p>

            <hr style={{ margin: "20px 0", borderColor: "#1E3056" }} />

<h3 style={{ color: "#38BDF8" }}>🧭 Route Result</h3>

{routeData ? (
  <div style={{ color: "#22C55E" }}>
    {routeData?.dijkstra && (
  <div style={{ marginBottom: 10 }}>
    <h4 style={{ color: "#22C55E" }}>🟢 Safest Route</h4>
    <div>Path: {routeData.dijkstra.path.join(" → ")}</div>
    <div>Avg Risk: {routeData.dijkstra.avgRisk}</div>
    <div>Total Risk: {routeData.dijkstra.totalRisk}</div>
  </div>
)}

{routeData?.aiAlternatives?.length > 0 && (
  <div>
    <h4 style={{ color: "#FACC15" }}>🤖 AI Alternatives</h4>

    {routeData.aiAlternatives.map((r, i) => (
      <div key={i} style={{ marginBottom: 8 }}>
        <div>#{r.rank} → {r.path.join(" → ")}</div>
        <div>Risk: {r.risk}</div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>
          {r.reason}
        </div>
      </div>
    ))}
  </div>
)}
  </div>
) : (
  <p style={{ color: "#64748B" }}>No route selected</p>
)}
{selectedRoute === a.id && (
  <div style={{ color: "#22C55E", fontSize: 12 }}>
    ✅ Route Accepted
  </div>
)}

            {/* 🔥 YOUR ORIGINAL BUTTON (NO CHANGE) */}
            <button onClick={() => setWeatherOn(prev => !prev)}>
              🌦 Toggle Weather
            </button>

            <button onClick={() => acceptRoute(a)}>✅ Accept</button>
            <button onClick={() => rejectRoute(a)}>❌ Reject</button>
          </div>
        ))}

        {/* ================= CASCADE ================= */}
        <hr style={{ margin: "20px 0", borderColor: "#1E3056" }} />

        <h3 style={{ color: "#38BDF8" }}>🌐 Cascade Analysis</h3>

        {!cascadeData && !loadingCascade && (
          <p style={{ color: "#94A3B8" }}>
            Click a node to simulate cascade impact
          </p>
        )}

        {loadingCascade && (
          <p style={{ color: "#38BDF8" }}>
            Analyzing cascade...
          </p>
        )}

        {cascadeData && (
          <div style={{
            background: "#070B14",
            border: "1px solid #1E3056",
            marginTop: 10,
            padding: 12,
            borderRadius: 8,
            color: "#CBD5F5",
            fontSize: 13,
            lineHeight: 1.6,
            boxShadow: "0 0 10px rgba(56,189,248,0.2)"
          }}>
            {formatCascade(cascadeData)}
          </div>
        )}

        {/* ================= AUDIT ================= */}
       <h3 style={{ color: "#38BDF8", marginBottom: 10 }}>
  📜 Activity Stream
</h3>

<div
  style={{
    maxHeight: 220,
    overflowY: "auto",
    paddingRight: 5
  }}
>
  {/* SAFE EMPTY CHECK */}
  {!audit || audit.length === 0 ? (
    <p style={{ color: "#64748B" }}>No activity yet</p>
  ) : (
    audit.slice().reverse().map((a, i) => {
      const type = a?.type || "INFO";

      const color =
        type === "CASCADE"
          ? "#F87171"
          : type === "ROUTE_ACTION"
          ? "#FACC15"
          : "#38BDF8";

      return (
        <div
          key={i}
          style={{
            borderBottom: "1px solid #1E3056",
            padding: "8px 6px",
            marginBottom: 6,
            background: "rgba(255,255,255,0.02)",
            borderRadius: 6,
            boxShadow: "0 0 6px rgba(56,189,248,0.15)"
          }}
        >
          {/* TYPE */}
          <div
            style={{
              color,
              fontWeight: "bold",
              fontSize: 12,
              marginBottom: 2
            }}
          >
            {type}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ color: "#E2E8F0", fontSize: 13 }}>
            {a?.node || a?.route || "System Event"}
          </div>

          {/* ACTION */}
          {a?.action && (
            <div style={{ color: "#38BDF8", fontSize: 12 }}>
              Action: {a.action}
            </div>
          )}

          {/* TIME */}
          <div
            style={{
              color: "#64748B",
              fontSize: 11,
              marginTop: 3
            }}
          >
            {a?.time
              ? new Date(a.time).toLocaleTimeString()
              : "Just now"}
          </div>
        </div>
        
      );
    })
  )}
</div>
</div>
</div>
</div>
  );
}
