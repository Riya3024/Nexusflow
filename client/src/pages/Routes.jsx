import { useEffect, useState } from "react";
import axios from "axios";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [alternatives, setAlternatives] = useState({});
  const [loadingAlt, setLoadingAlt] = useState(false);
  const [filter, setFilter] = useState("all");
  const [nodes, setNodes] = useState([]);

  // =========================
  // LOAD ROUTES
  // =========================
  const loadRoutes = async () => {
  try {
    const r = await axios.get("/api/routes");
    const n = await axios.get("/api/nodes");

    setRoutes(r.data.data || []);
    setNodes(n.data.data || []);

  } catch (err) {
    console.error("ROUTES LOAD ERROR:", err);
  }
};

  useEffect(() => {
    loadRoutes();
  }, []);

  // =========================
  // FILTER LOGIC
  // =========================
  const getAvgRisk = (route) => {
  const from = nodes.find(n => n.id === route.from);
  const to = nodes.find(n => n.id === route.to);

  if (!from || !to) return 0;

  return ((from.riskScore || 0) + (to.riskScore || 0)) / 2;
};

const filteredRoutes = routes.filter((r) => {
  const risk = getAvgRisk(r);

  if (filter === "risky") return risk > 40;
  if (filter === "delayed") return (r.delay || 0) > 0;

  return true;
});

  // =========================
  // GET GEMINI ALTERNATIVES
  // =========================
  const getAlternatives = async (route) => {
    try {
      setLoadingAlt(true);

      const res = await axios.post("/api/ai/analyze", {
        routes: [route],
      });

      setAlternatives((prev) => ({
        ...prev,
        [route.id]: res.data.data,
      }));

    } catch (err) {
      console.error("ALT ERROR:", err);
    } finally {
      setLoadingAlt(false);
    }
  };

  // =========================
  // ACCEPT / REJECT
  // =========================
  const handleAction = async (route, action) => {
    try {
      await axios.post("/api/route-action", {
        route: route.id,
        action,
      });
    } catch (err) {
      console.error("ACTION ERROR:", err);
    }
  };

  return (
    <div style={{ padding: 20, background: "#070B14", minHeight: "100vh" }}>

      {/* HEADER */}
      <h2 style={{ color: "#38BDF8", marginBottom: 20 }}>
        🚚 Route Intelligence Center
      </h2>

      {/* FILTERS */}
      <div style={{ marginBottom: 15 }}>
        {["all", "risky", "delayed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              marginRight: 10,
              padding: "6px 10px",
              background: filter === f ? "#38BDF8" : "#0D1526",
              color: "white",
              border: "1px solid #1E3056",
              cursor: "pointer"
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#0D1526", color: "#38BDF8" }}>
            <th>ID</th>
            <th>Route</th>
            <th>Mode</th>
            <th>Risk</th>
            <th>Delay</th>
            <th>Status</th>
          </tr>
        </thead>

        
        <tbody>
  {filteredRoutes.map((r) => {

    const from = nodes.find(n => n.id === r.from);
    const to = nodes.find(n => n.id === r.to);

    const avgRisk = getAvgRisk(r);

    let status = "NORMAL";
    let color = "#22C55E";

    if (avgRisk > 70) {
      status = "CRITICAL";
      color = "#EF4444";
    } else if (avgRisk > 40) {
      status = "RISKY";
      color = "#FACC15";
    }

    return (
      <>
        {/* MAIN ROW */}
        <tr
          key={r.id}
          onClick={() =>
            setExpanded(expanded === r.id ? null : r.id)
          }
          style={{
            borderBottom: "1px solid #1E3056",
            cursor: "pointer",
            color: "#E2E8F0"
          }}
        >
          <td>{r.id}</td>
          <td>
            {from?.name || r.from} → {to?.name || r.to}
          </td>
          <td>{r.mode}</td>

          <td style={{ color }}>
            {avgRisk.toFixed(1)}
          </td>

          <td>{r.delay || 0}h</td>

          <td style={{ color }}>
            {status}
          </td>
        </tr>

        {/* EXPANDED ROW */}
        {expanded === r.id && (
          <tr>
            <td colSpan="6">
              <div style={{
                padding: 10,
                background: "#0D1526"
              }}>

                <button
                  onClick={() => getAlternatives(r)}
                  style={{
                    marginRight: 10,
                    background: "#38BDF8",
                    border: "none",
                    padding: 6,
                    cursor: "pointer"
                  }}
                >
                  🤖 Get Gemini Alternatives
                </button>

                <button onClick={() => handleAction(r, "ACCEPT")}>
                  ✅ Accept
                </button>

                <button onClick={() => handleAction(r, "REJECT")}>
                  ❌ Reject
                </button>

                {loadingAlt && (
                  <p style={{ color: "#38BDF8" }}>
                    Generating alternatives...
                  </p>
                )}

                {alternatives[r.id] && (
                  <pre style={{
                    color: "#CBD5F5",
                    marginTop: 10,
                    whiteSpace: "pre-wrap"
                  }}>
                    {JSON.stringify(alternatives[r.id], null, 2)}
                  </pre>
                )}

              </div>
            </td>
          </tr>
        )}
      </>
    );
  })}
</tbody>
           
  
                         
                     
      </table>

      {/* EMPTY */}
      {filteredRoutes.length === 0 && (
        <p style={{ color: "#64748B", marginTop: 20 }}>
          No routes available
        </p>
      )}
    </div>
  );
}