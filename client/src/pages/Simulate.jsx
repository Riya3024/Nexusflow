import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "../components/map/MapView";

export default function Simulate() {
  const [nodes, setNodes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedNode, setSelectedNode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    try {
      const n = await axios.get("/api/nodes");
      const r = await axios.get("/api/routes");

      setNodes(n.data.data || []);
      setRoutes(r.data.data || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // SIMULATE CASCADE
  // =========================
  const simulate = async () => {
    if (!selectedNode) return;

    try {
      setLoading(true);

      const nodeObj = nodes.find(n => n.id === selectedNode);

      const res = await axios.post("/api/cascade", {
        node: nodeObj
      });

      setResult(res.data.data);

    } catch (err) {
      console.error("SIMULATION ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET
  // =========================
  const reset = () => {
    setResult(null);
    setSelectedNode("");
  };

  return (
    <div style={{
      height: "100vh",
      background: "#070B14",
      display: "flex"
    }}>

      {/* LEFT PANEL */}
      <div style={{
        width: 300,
        background: "#0D1526",
        padding: 15,
        borderRight: "1px solid #1E3056"
      }}>
        <h3 style={{ color: "#38BDF8" }}>
          ⚠️ Cascade Simulator
        </h3>

        {/* SELECT NODE */}
        <select
          value={selectedNode}
          onChange={(e) => setSelectedNode(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 10,
            background: "#070B14",
            color: "white",
            border: "1px solid #1E3056"
          }}
        >
          <option value="">Select Node</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>

        {/* BUTTONS */}
        <button
          onClick={simulate}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 8,
            background: "#F87171",
            border: "none",
            cursor: "pointer"
          }}
        >
          🚨 Simulate Failure
        </button>

        <button
          onClick={reset}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 8,
            background: "#1E3056",
            border: "none",
            cursor: "pointer",
            color: "white"
          }}
        >
          Reset
        </button>

        {/* RESULT */}
        <div style={{ marginTop: 20 }}>
          {loading && (
            <p style={{ color: "#38BDF8" }}>
              Running simulation...
            </p>
          )}

          {result && (
            <div>
              <h4 style={{ color: "#F87171" }}>
                Affected Nodes
              </h4>
              <ul>
                {result.affectedPorts?.map((p, i) => (
                  <li key={i} style={{ color: "#E2E8F0" }}>
                    {p}
                  </li>
                ))}
              </ul>

              <h4 style={{ color: "#FACC15" }}>
                Impact Reason
              </h4>
              <ul>
                {result.reason?.map((r, i) => (
                  <li key={i} style={{ color: "#CBD5F5" }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div style={{ flex: 1 }}>
        <MapView
          nodes={nodes}
          routes={routes}
          simulationData={result}   // 🔥 THIS DRIVES VISUAL
        />
      </div>
    </div>
  );
}