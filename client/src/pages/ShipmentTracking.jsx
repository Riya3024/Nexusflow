import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MapView from "../components/map/MapView";

const API_URL = `${import.meta.env.VITE_API_URL}/api/shipments`;

export default function ShipmentTracking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const plannedData = location.state?.plannedData || null;
  const fromPlanner = location.state?.fromPlanner || false;

  const [shipment, setShipment] = useState(plannedData);
  const [loading, setLoading] = useState(Boolean(id) && !plannedData);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    mode: "Sea",
    risk: "",
    eta: "",
    path: ""
  });

  const loadShipment = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const res = await axios.get(`${API_URL}/${id}`);
      setShipment(res.data);
    } catch (err) {
      setShipment(null);
      setError("Shipment not found or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!id) {
    setLoading(false);
    return;
  }

  loadShipment();

  const interval = setInterval(() => {
    loadShipment();
  }, 3000);

  return () => clearInterval(interval);
}, [id]);

  const createShipment = async () => {
    try {
      setCreating(true);
      setError("");

      const payload = {
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        mode: form.mode,
        risk: Number(form.risk || 0),
        eta: form.eta.trim(),
        path:
form.path.trim()
?
form.path.split("|")
:
[
 form.origin,
 "Dubai Hub",
 "Singapore Hub",
 form.destination
],
        status: "Planned",
        currentStep: 0,
        progress: 0,
        events: [
          {
            title: "Shipment created",
            time: new Date().toISOString(),
            detail: "Created from tracking page"
          }
        ]
      };

      const res = await axios.post(API_URL, payload);
      navigate(`/tracking/${res.data.id}`, {
        state: { plannedData: res.data, fromPlanner: false }
      });
    } catch (err) {
      setError("Failed to create shipment.");
    } finally {
      setCreating(false);
    }
  };

const nodes = useMemo(() => {
  if (!shipment?.path) return [];

  if (Array.isArray(shipment.path)) {
    return shipment.path.filter(Boolean);
  }

  return String(shipment.path)
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
}, [shipment]);

  const shipmentNodes = nodes.map(
  (name, index) => ({
    id: name,
    name,

    lat: 10 + index * 8,
    lng: 50 + index * 15,

    riskScore: shipment?.risk || 0
  })
);

const shipmentRoutes =
  shipmentNodes
    .slice(0, -1)
    .map((node, index) => ({
      id: `route_${index}`,
      from: shipmentNodes[index].id,
      to: shipmentNodes[index + 1].id
    }));

   

      


  const currentStep = Number(shipment?.currentStep ?? 0);
  const currentNode =
  nodes[Math.min(currentStep, nodes.length - 1)] || "-";

const nextNode =
  nodes[Math.min(currentStep + 1, nodes.length - 1)] || "Destination Reached";
  const progress = Number(shipment?.progress ?? 0);

  const showCreateForm = !id && !plannedData;
  const showShipmentView = Boolean(shipment);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading shipment...</div>
      </div>
    );
  }


  const rerouteShipment = async () => {
  try {

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/shipments/${shipment.id}/reroute`
    );

    console.log(res.data);

    setShipment({
      ...res.data,
      rerouted:true
    });

  } catch(err) {

    console.log(
      "Reroute error",
      err.response?.data || err.message
    );

  }
};


  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Shipment Tracking</h1>
          <p style={styles.subtitle}>
            {fromPlanner ? "Opened from Shipment Planner" : "Direct tracking page"}
          </p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showCreateForm && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create Shipment</h2>

          <div style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Origin"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Destination"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
            <select
              style={styles.input}
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option>Sea</option>
              <option>Road</option>
              <option>Air</option>
            </select>
            <input
              style={styles.input}
              placeholder="Risk"
              value={form.risk}
              onChange={(e) => setForm({ ...form, risk: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="ETA"
              value={form.eta}
              onChange={(e) => setForm({ ...form, eta: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Route Path (use | e.g. Tokyo|Dubai|London)"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
            />
          </div>

          <button style={styles.button} onClick={createShipment} disabled={creating}>
            {creating ? "Creating..." : "Create Shipment"}
          </button>
        </div>
      )}

      {showShipmentView && (
        <>

  <div style={styles.grid}>

    {/* Shipment Info */}
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Shipment Info</h2>

      <p>
        <strong>Shipment ID:</strong> {shipment?.id}
      </p>

      <p>
        <strong>Status:</strong> {shipment?.status}
      </p>

      <p>
        <strong>Origin:</strong> {shipment?.origin}
      </p>

      <p>
        <strong>Destination:</strong> {shipment?.destination}
      </p>

      <p>
        <strong>Mode:</strong> {shipment?.mode}
      </p>

      <p>
        <strong>Delay Risk:</strong>{" "}
        {shipment?.risk > 70
          ? "🔴 High"
          : shipment?.risk > 40
          ? "🟠 Medium"
          : "🟢 Low"}
      </p>

      <p>
        <strong>Health Score:</strong>{" "}
        {shipment?.healthScore || Math.max(100 - shipment?.risk, 0)}
      </p>
    </div>

    {/* Live Tracking */}
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Live Tracking</h2>

      <p>
        <strong>Current Node:</strong> {currentNode}
      </p>

      <p>
        <strong>Next Node:</strong> {nextNode}
      </p>

      <p>
  <strong>
    Planned ETA:
  </strong>{" "}
  {shipment?.plannedEta || "-"}
</p>

<p>
  <strong>
    Predictive ETA:
  </strong>{" "}
  {shipment?.predictedEta || "-"}
</p>

      <p>
        <strong>Created At:</strong>{" "}
        {shipment?.createdAt
          ? new Date(shipment.createdAt).toLocaleString()
          : "-"}
      </p>
    </div>
  </div>

  {/* Progress */}
  <div style={{ ...styles.card, marginTop: 20 }}>
    <h2 style={styles.cardTitle}>Progress</h2>

    <div style={styles.progressBar}>
      <div
        style={{
          ...styles.progressFill,
          width: `${progress}%`
        }}
      />
    </div>

    <p style={styles.progressText}>
      {progress}% Complete
    </p>
  </div>

  {/* Timeline */}
  <div style={{ ...styles.card, marginTop: 20 }}>
    <h2 style={styles.cardTitle}>Timeline</h2>

    {(shipment?.events || []).map((event, index) => (
      <div
        key={index}
        style={{
          padding: "8px 0",
          borderBottom: "1px solid #243041"
        }}
      >
        ✓ {event.title}
      </div>
    ))}
  </div>

  
  {/* Shipment Map */}
<div
  style={{
    ...styles.card,
    marginTop: 20,
    height: "500px"
  }}
>
  <h2 style={styles.cardTitle}>
    Shipment Map
  </h2>

  <MapView
  nodes={shipmentNodes}
  routes={shipmentRoutes}
  aiRoutes={[]}
  simulationData={null}
  aiData={null}
  routeData={{
    dijkstra: {
      path: shipmentNodes.map(n => n.id),
      avgRisk: shipment?.risk || 0,
      totalRisk:
        (shipment?.risk || 0) *
        shipmentNodes.length
    }
  }}
  selectedRoute={null}
  weatherOn={false}
  onNodeClick={() => {}}
/>
</div>

         

  {/* AI Insights */}
  <div style={{ ...styles.card, marginTop: 20 }}>

<h2 style={styles.cardTitle}>
AI Insights
</h2>


<p>
<strong>
{shipment?.delayProbability || 0}%
</strong>{" "}
chance of delay
</p>


<p>
<strong>Reason:</strong>{" "}
{
 shipment?.risk > 70
 ? "🚨 High disruption risk detected"
 : shipment?.risk > 40
 ? "⚠️ Moderate risk detected"
 : "Route operating normally"
}
</p>


<p>
<strong>Recommendation:</strong>{" "}
{
 shipment?.risk >= 70
 ?
 "Alternative route recommended to reduce risk"
 :
 "Current route is acceptable"
}
</p>



{/* Automatic suggestion */}

{
shipment?.rerouteSuggestion?.shouldReroute && (

<div>

<h3>
🚨 AI Suggested Re-route
</h3>


<p>
{shipment.rerouteSuggestion.message}
</p>


<button
onClick={generateReroute}
style={{
background:"#22c55e",
color:"white",
border:"none",
padding:"10px 16px",
borderRadius:"8px",
cursor:"pointer"
}}
>

Accept Suggested Route

</button>


</div>

)

}



{/* Manual option */}

<button

onClick={rerouteShipment}

style={{
background:"#ef4444",
color:"white",
border:"none",
padding:"10px 16px",
borderRadius:"8px",
cursor:"pointer",
marginTop:"15px"
}}

>

Generate AI Re-route Manually

</button>

{shipment?.rerouted && shipment?.recommendedRoute?.length > 0 && (

<div
style={{
marginTop:"20px",
padding:"15px",
background:"#111827",
borderRadius:"10px"
}}
>

<h3>
✅ Re-route Applied
</h3>


<p>
<strong>New Route:</strong>
</p>


<p>
{shipment.recommendedRoute.join(" ➜ ")}
</p>


</div>

)}


</div>



  {/* Alerts */}
  <div
  style={{
    ...styles.card,
    marginTop: 20
  }}
>
  <h2 style={styles.cardTitle}>
    Alerts
  </h2>

  {shipment?.alerts?.length ? (
    shipment.alerts.map(
      (alert, idx) => (
        <div
          key={idx}
          style={{
            background:
              "#1e293b",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "8px"
          }}
        >
          🚨 {alert.message}
        </div>
      )
    )
  ) : (
    <p>No active alerts</p>
  )}
</div>

  {/* Tracking Events */}
  <div style={{ ...styles.card, marginTop: 20 }}>
    <h2 style={styles.cardTitle}>Tracking Events</h2>

    {shipment?.events?.length ? (
      <div style={styles.events}>
        {[...(shipment.events || [])]
          .reverse()
          .map((event, index) => (
            <div
              key={index}
              style={styles.eventItem}
            >
              <div style={styles.eventDot} />

              <div>
                <div style={styles.eventTitle}>
                  {event.title}
                </div>

                <div style={styles.eventMeta}>
                  {event.time}
                </div>

                {event.detail && (
                  <div style={styles.eventDetail}>
                    {event.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    ) : (
      <p>No events available.</p>
    )}
  </div>
 
</>
      )}
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "#07111f",
    color: "#fff",
    padding: "24px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    margin: 0,
    color: "#38bdf8"
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8"
  },
  error: {
    background: "#3f1d1d",
    border: "1px solid #7f1d1d",
    color: "#fecaca",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#111827",
    border: "1px solid #243041",
    borderRadius: "16px",
    padding: "18px"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "14px",
    color: "#facc15"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "14px"
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "10px 12px",
    color: "#fff",
    outline: "none"
  },
  button: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700
  },
  progressBar: {
    width: "100%",
    height: "18px",
    borderRadius: "999px",
    background: "#1e293b",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #38bdf8)"
  },
  progressText: {
    marginTop: "10px"
  },
  routeWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center"
  },
  routeNode: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#0f172a",
    border: "1px solid #334155",
    padding: "8px 12px",
    borderRadius: "999px"
  },
  arrow: {
    color: "#94a3b8"
  },
  events: {
    display: "grid",
    gap: "12px"
  },
  eventItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "10px 0",
    borderBottom: "1px solid #243041"
  },
  eventDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#38bdf8",
    marginTop: "6px",
    flexShrink: 0
  },
  eventTitle: {
    fontWeight: 700
  },
  eventMeta: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "2px"
  },
  eventDetail: {
    marginTop: "4px",
    color: "#cbd5e1"
  }
};