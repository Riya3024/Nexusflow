import { useEffect, useState } from "react";
import axios from "axios";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const res = await axios.get("/api/alerts");
    setAlerts(res.data.data);
  };

  const acknowledge = async (id) => {
    await axios.post(`/api/alerts/${id}/ack`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = alerts.filter(a =>
    filter === "all" ? true : a.status === filter
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Alerts Management</h2>

      {/* FILTER */}
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("acknowledged")}>Acknowledged</button>
      </div>

      {/* LIST */}
      {filtered.map(a => (
        <div key={a.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <strong>{a.title}</strong>
          <p>{a.description}</p>
          <p>Status: {a.status}</p>

          {a.status === "active" && (
            <button onClick={() => acknowledge(a.id)}>
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
}