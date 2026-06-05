import { useEffect, useState } from "react";
import axios from "axios";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);

  const loadAudit = async () => {
    try {
      const res = await axios.get("/api/audit");
      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Audit fetch error:", err);
    }
  };

  useEffect(() => {
    loadAudit();
    const interval = setInterval(loadAudit, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🎬 GROUP BY TYPE (Netflix rows)
  const grouped = logs.reduce((acc, log) => {
    const key = log.type || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div style={{
      background: "#070B14",
      minHeight: "100vh",
      color: "#fff",
      padding: 20
    }}>
      <h1 style={{ color: "#38BDF8" }}>📜 Audit Dashboard</h1>

      {Object.keys(grouped).length === 0 && (
        <p style={{ color: "#94A3B8" }}>No activity yet</p>
      )}

      {/* 🎬 NETFLIX ROWS */}
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} style={{ marginTop: 30 }}>
          
          {/* ROW TITLE */}
          <h2 style={{ color: "#FACC15", marginBottom: 10 }}>
            {type}
          </h2>

          {/* HORIZONTAL SCROLL */}
          <div style={{
            display: "flex",
            overflowX: "auto",
            gap: 12,
            paddingBottom: 10
          }}>
            {items.slice().reverse().map((log, i) => (
              <div
                key={i}
                style={{
                  minWidth: 250,
                  background: "#0D1526",
                  borderRadius: 10,
                  padding: 15,
                  boxShadow: "0 0 10px rgba(56,189,248,0.2)",
                  transition: "0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div style={{
                  color: "#38BDF8",
                  fontWeight: "bold",
                  marginBottom: 5
                }}>
                  {log.type}
                </div>

                <div style={{ fontSize: 14 }}>
                  {log.node || log.route || "System Event"}
                </div>

                {log.action && (
                  <div style={{
                    color: "#22C55E",
                    fontSize: 12,
                    marginTop: 5
                  }}>
                    Action: {log.action}
                  </div>
                )}

                <div style={{
                  fontSize: 11,
                  color: "#64748B",
                  marginTop: 10
                }}>
                  {new Date(log.time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}