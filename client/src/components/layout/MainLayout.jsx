import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div style={{ height: "100vh", background: "#070B14" }}>

      {/* 🔥 NAVBAR */}
      <div style={{
        height: 60,
        background: "#0D1526",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        color: "#38BDF8"
      }}>
        <h2>NexusFlow</h2>

        <div style={{ display: "flex", gap: 15 }}>
          <Link to="/" style={{ color: "#38BDF8" }}>Dashboard</Link>
          <Link to="/routes" style={{ color: "#38BDF8" }}>Routes</Link>
          <Link to="/simulate" style={{ color: "#38BDF8" }}>Simulate</Link>
          <Link to="/analytics" style={{ color: "#38BDF8" }}>Analytics</Link>
          <Link to="/alerts" style={{ color: "#38BDF8" }}>Alerts</Link>
          <Link to="/gemini-analyzer" style={{ color: "#38BDF8" }}>AI Docs</Link>
        </div>
      </div>

      {/* 🔥 PAGE CONTENT */}
      <div style={{ height: "calc(100vh - 60px)" }}>
        <Outlet />
      </div>

    </div>
  );
}