import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <div style={{
      height: 60,
      background: "#0D1526",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 20
    }}>
      <h2 style={{ color: "#38BDF8" }}>NexusFlow</h2>

      <Link to="/" style={{ color: "#CBD5F5" }}>Dashboard</Link>
      <Link to="/routes" style={{ color: "#CBD5F5" }}>Routes</Link>
      <Link to="/simulate" style={{ color: "#CBD5F5" }}>Simulate</Link>
      <Link to="/analytics" style={{ color: "#CBD5F5" }}>Analytics</Link>
      <Link to="/alerts" style={{ color: "#CBD5F5" }}>Alerts</Link>
      <Link to="/gemini-analyzer" style={{ color: "#CBD5F5" }}>Analyzer</Link>
    </div>
  );
}