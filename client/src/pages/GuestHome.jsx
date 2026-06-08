import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GuestHome() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Guest User",
        email: "guest@nexusflow.com",
        id: "GUEST"
      })
    );
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 40 }}>
      <h2 style={{ color: "#38BDF8" }}>Guest Access</h2>
      <p style={{ color: "#cbd5e1", maxWidth: 700, lineHeight: 1.7 }}>
        You are viewing NexusFlow in guest mode. You can explore the project and see
        how shipment planning works, but some saving and advanced dashboard features
        may require login.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        <button onClick={() => navigate("/dashboard/planner")}>
          Open Planner Demo
        </button>
        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
        <button onClick={() => navigate("/")}>
          Back Home
        </button>
      </div>
    </div>
  );
}