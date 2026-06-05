import { useState } from "react";
import axios from "axios";

const CITY_LIST = [
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Delhi",
  "Kolkata",
  "Hyderabad",
  "Singapore",
  "Dubai",
  "Shanghai",
  "Rotterdam"
];

function CityAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Search city..."
}) {
  const [open, setOpen] = useState(false);

  const filteredCities = CITY_LIST.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (city) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <label style={{ display: "block", marginBottom: 6, color: "white" }}>
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
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

      {open && filteredCities.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 8,
            zIndex: 1000,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
          }}
        >
          {filteredCities.map((city) => (
            <div
              key={city}
              onMouseDown={() => handleSelect(city)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                color: "white",
                borderBottom: "1px solid #1f2937"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e293b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShipmentPlanner() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planShipment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

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
      setError(err.response?.data?.error || err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (score) => {
    if (typeof score !== "number") return "#94a3b8";
    if (score >= 70) return "#ef4444";
    if (score >= 40) return "#f59e0b";
    return "#22c55e";
  };

  const showValue = (value) => (value === undefined || value === null || value === "" ? "N/A" : value);

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

      <form
        onSubmit={planShipment}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 500
        }}
      >
        <CityAutocomplete
          label="Origin"
          value={origin}
          onChange={setOrigin}
          placeholder="Search origin city..."
        />

        <CityAutocomplete
          label="Destination"
          value={destination}
          onChange={setDestination}
          placeholder="Search destination city..."
        />

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
          type="submit"
          disabled={loading}
          style={{
            background: "#38BDF8",
            border: "none",
            padding: 10,
            cursor: "pointer",
            borderRadius: 8,
            color: "#03111f",
            fontWeight: "600",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 20, color: "#f87171", fontWeight: "600" }}>
          {error}
        </div>
      )}

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
              <strong>📍 Distance:</strong> {showValue(result.distance)} km
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>🌦️ Origin Climate Risk:</strong>{" "}
              <span style={{ color: riskColor(result.origin?.climateRisk?.score) }}>
                {showValue(result.origin?.climateRisk?.level)} (
                {showValue(result.origin?.climateRisk?.score)})
              </span>
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>🌦️ Destination Climate Risk:</strong>{" "}
              <span style={{ color: riskColor(result.destination?.climateRisk?.score) }}>
                {showValue(result.destination?.climateRisk?.level)} (
                {showValue(result.destination?.climateRisk?.score)})
              </span>
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>⚠ Overall Climate Risk:</strong>{" "}
              <span style={{ color: riskColor(result.climateRisk) }}>
                {showValue(result.climateRisk)}
              </span>
            </p>
          </div>

          <div
            style={{
              background: "#0f172a",
              padding: 15,
              marginBottom: 15,
              borderRadius: 10,
              border: "1px solid #243244"
            }}
          >
            <h4 style={{ marginTop: 0, color: "#38BDF8" }}>Climate Details</h4>

            <p style={{ margin: "5px 0" }}>
              <strong>Origin Flood:</strong>{" "}
              {showValue(result.climateDetails?.origin?.flood?.level)} (
              {showValue(result.climateDetails?.origin?.flood?.score)})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Origin Earthquake:</strong>{" "}
              {showValue(result.climateDetails?.origin?.earthquake?.level)} (
              {showValue(result.climateDetails?.origin?.earthquake?.score)})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Origin Rain:</strong>{" "}
              {showValue(result.climateDetails?.origin?.rain?.level)} (
              {showValue(result.climateDetails?.origin?.rain?.score)})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Destination Flood:</strong>{" "}
              {showValue(result.climateDetails?.destination?.flood?.level)} (
              {showValue(result.climateDetails?.destination?.flood?.score)})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Destination Earthquake:</strong>{" "}
              {showValue(result.climateDetails?.destination?.earthquake?.level)} (
              {showValue(result.climateDetails?.destination?.earthquake?.score)})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Destination Rain:</strong>{" "}
              {showValue(result.climateDetails?.destination?.rain?.level)} (
              {showValue(result.climateDetails?.destination?.rain?.score)})
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
                <div>💰 Cost: ${showValue(o.cost)}</div>
                <div>⏱ Time: {showValue(o.time)}h</div>
                <div
                  style={{
                    color:
                      o.risk < 25 ? "#4caf50" : o.risk < 50 ? "#ff9800" : "#f44336",
                    fontWeight: "bold"
                  }}
                >
                  ⚠ Risk: {showValue(o.risk)}
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
              Recommended Mode: {showValue(result.recommendation?.mode)}
            </p>

            <p style={{ fontStyle: "italic", margin: "10px 0", lineHeight: "1.5" }}>
              {showValue(result.recommendation?.reason)}
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
                🛡 Safest Risk: {showValue(result.recommendation?.safestOption)}
              </span>
              <span style={{ color: "#ff9800" }}>
                💰 Cheapest: ${showValue(result.recommendation?.cheapestOption)}
              </span>
              <span style={{ color: "#2196f3" }}>
                ⚡ Fastest: {showValue(result.recommendation?.fastestOption)}h
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}