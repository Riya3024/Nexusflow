import { useEffect, useState } from "react";
import axios from "axios";

export default function ShipmentPlanner() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/nodes");
        const raw = res.data?.nodes || res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : [];

        const normalized = list
          .map((node) => {
            if (typeof node === "string") {
              return { name: node };
            }

            return {
              id: node.id || node._id || node.name,
              name: node.name || node.city || node.label || ""
            };
          })
          .filter((node) => node.name);

        setNodes(normalized);
      } catch (err) {
        console.error("Failed to load nodes:", err);
      }
    };

    fetchNodes();
  }, []);

  const planShipment = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/shipment-plan", {
        origin,
        destination,
        weight: Number(weight),
        priority,
        budget: Number(budget)
      });

      setResult(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        background: "#070B14",
        color: "white"
      }}
    >
      <h2 style={{ color: "#38BDF8" }}>📦 Shipment Planner</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 500
        }}
      >
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select Origin</option>
          {nodes.map((node) => (
            <option key={node.id || node.name} value={node.name}>
              {node.name}
            </option>
          ))}
        </select>

        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
            boxSizing: "border-box"
          }}
        >
          <option value="">Select Destination</option>
          {nodes.map((node) => (
            <option key={node.id || node.name} value={node.name}>
              {node.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
            boxSizing: "border-box"
          }}
        />

        <input
          placeholder="Budget ($)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
            boxSizing: "border-box"
          }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "white",
            outline: "none",
            boxSizing: "border-box"
          }}
        >
          <option>Normal</option>
          <option>High</option>
          <option>Critical</option>
        </select>

        <button
          onClick={planShipment}
          style={{
            background: "#38BDF8",
            border: "none",
            padding: 10,
            cursor: "pointer",
            borderRadius: 8,
            color: "#03111f",
            fontWeight: "600"
          }}
        >
          Generate Plan
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: "#22C55E" }}>Recommended Plan</h3>

          <div
            style={{
              background: "#1a2332",
              padding: 15,
              marginBottom: 15,
              borderRadius: 10,
              borderLeft: "4px solid #38BDF8"
            }}
          >
            <p style={{ margin: "5px 0" }}>
              <strong>📍 Distance:</strong> {result.distance} km
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>🌦️ Origin Weather Risk:</strong> {result.origin?.weatherRisk}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>🌦️ Destination Weather Risk:</strong> {result.destination?.weatherRisk}
            </p>
          </div>

          {result.options?.map((o, i) => (
            <div
              key={i}
              style={{
                background:
                  o.mode === result.recommendation?.mode ? "#1a3a2a" : "#111827",
                padding: 15,
                marginBottom: 10,
                borderRadius: 10,
                border:
                  o.mode === result.recommendation?.mode
                    ? "2px solid #22C55E"
                    : "1px solid #333"
              }}
            >
              <strong
                style={{
                  color:
                    o.mode === result.recommendation?.mode ? "#4ade80" : "white",
                  fontSize: "16px"
                }}
              >
                {o.mode === "Road" && "🚛 "}
                {o.mode === "Air" && "✈️ "}
                {o.mode === "Sea" && "🚢 "}
                {o.mode}
                {o.mode === result.recommendation?.mode && " ⭐ RECOMMENDED"}
              </strong>

              <div style={{ marginTop: "10px" }}>
  <div>💰 Cost: ${o.cost}</div>
  <div>⏱ Time: {o.time}h</div>
  <div
    style={{
      color:
        o.risk < 25 ? "#4caf50" : o.risk < 50 ? "#ff9800" : "#f44336",
      fontWeight: "bold"
    }}
  >
    ⚠ Risk: {o.risk}
  </div>

  <div style={{ marginTop: "10px", fontSize: "14px", lineHeight: "1.6" }}>
  <div>⛽ Fuel Used: {o.fuelLiters} L</div>
  <div>🌱 CO2 Emissions: {o.co2Kg} kg</div>
 
</div>
</div>
            </div>
          ))}

          <div
            style={{
              background: "#0D1526",
              padding: 15,
              borderRadius: 10,
              borderLeft: "4px solid #4caf50"
            }}
          >
            <h4 style={{ color: "#4caf50", margin: "0 0 10px 0" }}>
              🤖 AI Recommendation
            </h4>

            <p style={{ fontWeight: "bold", color: "#38BDF8", margin: "5px 0" }}>
              Recommended Mode: {result.recommendation?.mode}
            </p>

            <p style={{ fontStyle: "italic", margin: "10px 0", lineHeight: "1.5" }}>
              {result.recommendation?.reason}
            </p>

            <div
              style={{
                display: "flex",
                gap: "15px",
                fontSize: "14px",
                marginTop: "10px",
                flexWrap: "wrap"
              }}
            >
              <span style={{ color: "#4caf50" }}>
                🛡 Safest Risk: {result.recommendation?.safestOption}
              </span>
              <span style={{ color: "#ff9800" }}>
                💰 Cheapest: ${result.recommendation?.cheapestOption}
              </span>
              <span style={{ color: "#2196f3" }}>
                ⚡ Fastest: {result.recommendation?.fastestOption}h
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}