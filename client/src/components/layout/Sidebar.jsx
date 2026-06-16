import { Link } from "react-router-dom";

export default function Sidebar() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div
      style={{
        width: 250,
        background: "#020617",
        color: "#E2E8F0",
        padding: 20,
        height: "100vh",
        borderRight: "1px solid #1E293B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>

        <h2
          style={{
            color: "#38BDF8",
            marginBottom: 30
          }}
        >
          NexusFlow
        </h2>

        {user && (
          <div
            style={{
              marginBottom: 25,
              padding: 10,
              background: "#0F172A",
              borderRadius: 8
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: "#38BDF8"
              }}
            >
              {user.name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#94A3B8"
              }}
            >
              {user.email}
            </div>

            <div
              style={{
                fontSize: 11,
                marginTop: 5,
                color: "#22C55E"
              }}
            >
              ID: {user.id}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >

          <Link
            to="/dashboard"
            style={linkStyle}
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/dashboard/planner"
            style={linkStyle}
          >
            📦 Shipment Planner
          </Link>
          <Link to="/tracking" style={linkStyle}>
  🚚 Create Shipment
</Link>

          <Link
            to="/dashboard/routes"
            style={linkStyle}
          >
            🛣 Routes
          </Link>

          <Link
            to="/dashboard/simulate"
            style={linkStyle}
          >
            🧠 Simulation
          </Link>

          <Link
            to="/dashboard/analytics"
            style={linkStyle}
          >
            📊 Analytics
          </Link>

          <Link
            to="/dashboard/alerts"
            style={linkStyle}
          >
            🚨 Alerts
          </Link>

          <Link
            to="/dashboard/gemini-analyzer"
            style={linkStyle}
          >
            🤖 AI Analyzer
          </Link>

          <Link
            to="/dashboard/audit"
            style={linkStyle}
          >
            📜 Audit Log
          </Link>

        </div>
      </div>

      <button
        onClick={logout}
        style={{
          background: "#EF4444",
          border: "none",
          color: "white",
          padding: 10,
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        Logout
      </button>

    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#CBD5E1",
  padding: "10px",
  borderRadius: "8px",
  background: "#0F172A"
};