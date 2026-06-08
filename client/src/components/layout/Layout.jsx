import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const guestMode = localStorage.getItem("guestMode") === "true";

  const user = guestMode
    ? null
    : JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 🔥 SIDEBAR */}
      <Sidebar />

      {/* 🔥 MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          background: "#070B14",
          color: "white",
          overflowY: "auto"
        }}
      >
        {/* 🔥 USER HEADER */}
        {(guestMode || user) && (
          <div
            style={{
              background: "#0D1526",
              padding: "15px 25px",
              borderBottom: "1px solid #1E293B",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  color: "#38BDF8",
                  fontWeight: "bold",
                  fontSize: 18
                }}
              >
                👤 {guestMode ? "Guest User" : user.name}
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 14
                }}
              >
                {guestMode ? "Limited demo access" : user.email}
              </div>
            </div>

            <div
              style={{
                color: "#22C55E",
                fontSize: 14
              }}
            >
              {guestMode ? "Guest ID: DEMO" : `User ID: ${user.id}`}
            </div>
          </div>
        )}

        {/* 🔥 THIS IS IMPORTANT (ROUTING RENDERS HERE) */}
        <Outlet />
      </div>
    </div>
  );
}