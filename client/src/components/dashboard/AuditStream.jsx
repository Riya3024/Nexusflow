import { useEffect, useState } from "react";
import axios from "axios";

export default function AuditStream() {
  const [logs, setLogs] = useState([]);

  const fetchAudit = async () => {
    try {
      const res = await axios.get("/api/audit");
      console.log("📜 AUDIT:", res.data);

      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Audit fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAudit();

    const interval = setInterval(fetchAudit, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "10px" }}>
      <h3>📜 Activity Stream</h3>

      {logs.length === 0 ? (
        <p>No activity yet</p>
      ) : (
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          {logs.slice().reverse().map((log, index) => (
            <div
              key={index}
              style={{
                padding: "8px",
                marginBottom: "6px",
                background: "#0f172a",
                borderRadius: "6px",
                border: "1px solid #1e293b"
              }}
            >
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {new Date(log.time || Date.now()).toLocaleTimeString()}
              </div>

              <div style={{ fontWeight: "bold", color: "#38bdf8" }}>
                {log.type}
              </div>

              <div style={{ fontSize: "13px" }}>
                {log.description || "No description"}
              </div>

              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {log.node}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}