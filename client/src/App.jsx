import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";


import HomePage from "./pages/HomePage";
import GuestHome from "./pages/GuestHome";
import RoutesPage from "./pages/Routes";
import Simulate from "./pages/Simulate";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import GeminiAnalyzer from "./pages/GeminiAnalyzer";
import ShipmentPlanner from "./pages/ShipmentPlanner";
import AuditPage from "./pages/AuditPage";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/navi/ProtectedRoute";

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [aiResult, setAiResult] = useState("");
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showAI, setShowAI] = useState(true);

  const load = async () => {
    try {
      const n = await axios.get("/api/nodes");
      const r = await axios.get("/api/routes");
      const a = await axios.get("/api/alerts");

      setNodes(n.data.data);
      setRoutes(r.data.data);
      setAlerts(a.data.data);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    load();

    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>

      <Routes>
       
<Route path="/" element={<HomePage />} />
<Route path="/guest" element={<GuestHome />} />
        {/* AUTH PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN APP */}
        <Route path="/dashboard" element={<Layout />}>

          {/* DASHBOARD */}
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard
                  nodes={nodes}
                  setNodes={setNodes}
                  routes={routes}
                  setRoutes={setRoutes}
                  alerts={alerts}
                  setAlerts={setAlerts}
                  aiResult={aiResult}
                  setAiResult={setAiResult}
                  aiData={aiData}
                  setAiData={setAiData}
                  loadingAI={loadingAI}
                  setLoadingAI={setLoadingAI}
                  filter={filter}
                  setFilter={setFilter}
                  showAI={showAI}
                  setShowAI={setShowAI}
                />
              </ProtectedRoute>
            }
          />
          

          {/* SHIPMENT PLANNER */}
          <Route path="planner" element={<ShipmentPlanner />} />

          {/* ROUTES */}
          <Route
            path="routes"
            element={
              <ProtectedRoute>
                <RoutesPage />
              </ProtectedRoute>
            }
          />

          {/* SIMULATE */}
          <Route
            path="simulate"
            element={
              <ProtectedRoute>
                <Simulate />
              </ProtectedRoute>
            }
          />

          {/* ANALYTICS */}
          <Route
            path="analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* ALERTS */}
          <Route
            path="alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
          />

          {/* AUDIT */}
          <Route
            path="audit"
            element={
              <ProtectedRoute>
                <AuditPage />
              </ProtectedRoute>
            }
          />

          {/* GEMINI */}
          <Route
            path="gemini-analyzer"
            element={
              <ProtectedRoute>
                <GeminiAnalyzer />
              </ProtectedRoute>
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}