import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  Circle // ✅ FIXED: added missing import
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";
import { useState } from "react";
import L from "leaflet";
import "leaflet-polylinedecorator";
import { useMap } from "react-leaflet";
import { useEffect } from "react";


function FixMapResize() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}


function FlowAnimation({ routes, nodes }) {
  const map = useMap();

  useEffect(() => {
    if (!routes || !nodes) return;

    const decorators = [];

    routes.forEach((route) => {
      const from = nodes.find(n => n.id === route.from);
      const to = nodes.find(n => n.id === route.to);

      if (!from || !to) return;

      const latlngs = [
        [from.lat, from.lng],
        [to.lat, to.lng]
      ];

      const line = L.polyline(latlngs, {
        color: "#1E90FF",
        weight: 2,
        opacity: 0.3
      }).addTo(map);

      const decorator = L.polylineDecorator(line, {
        patterns: [
          {
            offset: "0%",
            repeat: "10%",
            symbol: L.Symbol.arrowHead({
              pixelSize: 6,
              pathOptions: {
                fillOpacity: 1,
                weight: 0,
                color: "#38BDF8"
              }
            })
          }
        ]
      }).addTo(map);

      decorators.push({ line, decorator });
    });

    return () => {
      decorators.forEach(d => {
        map.removeLayer(d.line);
        map.removeLayer(d.decorator);
      });
    };

  }, [routes, nodes, map]);

  return null;
}


function MovingShipment({ routeData, nodes }) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!routeData?.dijkstra?.path) return;

    const interval = setInterval(() => {
      setPosition(prev => prev + 0.01);
    }, 50);

    return () => clearInterval(interval);
  }, [routeData]);

  if (!routeData?.dijkstra?.path) return null;

  const coords = routeData.dijkstra.path
    .map(id => {
      const node = nodes.find(n => n.id === id);
      return node ? [node.lat, node.lng] : null;
    })
    .filter(Boolean);

  if (coords.length < 2) return null;

  // interpolate position between points
  const totalSegments = coords.length - 1;
  const progress = position % totalSegments;

  const index = Math.floor(progress);
  const t = progress - index;

  const start = coords[index];
  const end = coords[index + 1];

  if (!start || !end) return null;

  const lat = start[0] + (end[0] - start[0]) * t;
  const lng = start[1] + (end[1] - start[1]) * t;

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={6}
      pathOptions={{
        color: "#22FF88",
        fillColor: "#22FF88",
        fillOpacity: 1
      }}
    />
  );
}

export default function MapView({
  nodes = [],
  routes = [],
  aiRoutes = [],
  simulationData = null,
  aiData,
  routeData,
  onNodeClick,
  selectedRoute,
  weatherOn
}) {

  console.log("🧠 simulationData:", simulationData);

  const normalize = (id) => String(id).toLowerCase().trim();

  const [activeCascade, setActiveCascade] = useState(null);


  const getRiskColor = (risk) => {
    if (risk > 70) return "#EF4444";
    if (risk > 40) return "#FACC15";
    return "#22C55E";
  };

  return (
    <MapContainer
      center={[20, 80]}
      zoom={3}
      style={{ height: "100%", width: "100%" }}
    >
      {/* ✅ FIX RESIZE */}
    <FixMapResize />

    {/* 🔥 FLOW ANIMATION (ADD HERE) */}
    <FlowAnimation routes={routes} nodes={nodes} />
    <MovingShipment routeData={routeData} nodes={nodes} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {/* ================= ROUTES ================= */}
      {routes.map(route => {

        const fromNode = nodes.find(n => n.id === route.from);
        const toNode = nodes.find(n => n.id === route.to);

        if (!fromNode || !toNode) return null;

        const avgRisk =
          ((fromNode.riskScore || 0) + (toNode.riskScore || 0)) / 2;

        const isBest = aiData?.bestRouteId === route.id;
        const isSelected = route.id === selectedRoute;

        return (
          <Polyline
            key={route.id}
            positions={[
              [fromNode.lat, fromNode.lng],
              [toNode.lat, toNode.lng]
            ]}
            pathOptions={{
  color: isSelected
    ? "#00FFF7"
    : (isBest ? "#22C55E" : getRiskColor(avgRisk)),

  weight: isSelected
    ? 8
    : (isBest ? 6 : 2),

  opacity: isSelected
    ? 1
    : (isBest ? 1 : 0.4)
}}
          >
            <Tooltip>
              {route.id}<br />
              Risk: {avgRisk.toFixed(1)}
              {isBest && " 🟢 AI Best Route"}
            </Tooltip>
          </Polyline>
        );
      })}

      {/* ================= DIJKSTRA ================= */}
      {routeData?.dijkstra?.path && (
  <Polyline
    positions={routeData.dijkstra.path
      .map(id => {
        const node = nodes.find(n => n.id === id);
        return node ? [node.lat, node.lng] : null;
      })
      .filter(Boolean)}
    pathOptions={{
      color: "#00E5FF",
      weight: 8
    }}
  >
    <Tooltip>
      Smart Route (Dijkstra)<br />
      Avg Risk: {routeData.dijkstra.avgRisk?.toFixed(2)}<br />
      Total Risk: {routeData.dijkstra.totalRisk?.toFixed(2)}
    </Tooltip>
  </Polyline>
)}

      {/* ================= GEMINI ROUTES ================= */}
      {aiRoutes.map((route, idx) => {

        const coords = route.path
          ?.map(id => {
            const node = nodes.find(n => n.id === id);
            return node ? [node.lat, node.lng] : null;
          })
          .filter(Boolean);

        if (!coords || coords.length < 2) return null;

        return (
          <Polyline
            key={"ai_" + idx}
            positions={coords}
            pathOptions={{
              color: "#A78BFA",
              weight: 5,
              dashArray: "6"
            }}
          >
            <Tooltip>
              🤖 AI Route #{route.rank}<br />
              Risk: {route.newRiskScore}<br />
              {route.reason}
            </Tooltip>
          </Polyline>
        );
      })}

      {/* ================= WEATHER OVERLAY (FIXED POSITION) ================= */}
      {weatherOn && nodes.map(n => (
        <Circle
          key={"weather_" + n.id}
          center={[n.lat, n.lng]}
          radius={50000}
          pathOptions={{
            color: "blue",
            fillOpacity: 0.2
          }}
        />
      ))}

      {/* ================= NODES ================= */}
      {nodes.map(node => {

        const isRisky = aiData?.riskyNodes
          ?.map(normalize)
          .includes(normalize(node.id));

        const isPredicted = aiData?.predictions
          ?.map(p => normalize(p.id))
          .includes(normalize(node.id));

        // 🔥 CASCADE DETECTION
        const isAffected =
          simulationData?.affectedPorts?.some(p => {
            const a = normalize(p);
            const b = normalize(node.name);

            return (
              a === b ||
              a.includes(b) ||
              b.includes(a)
            );
          });

        const isAnimating = activeCascade === node.id;

        let color = "#22C55E";

        if (isAffected) color = "#A78BFA";
        else if (isRisky) color = "#EF4444";
        else if (isPredicted) color = "#FACC15";

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={isAffected ? 18 : isRisky ? 14 : isPredicted ? 12 : 10}
            className={isAffected && isAnimating ? "ripple-node" : ""}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.9
            }}
            eventHandlers={{
              click: async () => {
                try {
                  console.log("🟡 CLICKED:", node.name);
                  setActiveCascade(node.id);

                  const res = await fetch("/api/cascade", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ node })
});

const data = await res.json();

console.log("🟢 RESPONSE:", data);

// 🔥 THIS LINE FIXES YOUR ISSUE
if (onNodeClick) {
  onNodeClick(data.data || data);
}

                  if (onNodeClick) {
                    onNodeClick(data?.data || {
                      affectedPorts: ["Fallback"],
                      reason: ["API failed"]
                    });
                  }

                } catch (err) {
                  console.error("❌ ERROR:", err);

                  onNodeClick({
                    affectedPorts: ["Fallback"],
                    reason: ["Network error"]
                  });
                }
              }
            }}
          >
            <Tooltip>
              <strong>{node.name}</strong><br />
              Risk: {node.riskScore?.toFixed(1) || 0}
              {isRisky && " 🔴 High Risk"}
              {!isRisky && isPredicted && " 🟡 Future Risk"}
              {isAffected && " 🟣 Impacted"}
            </Tooltip>
          </CircleMarker>
        );
      })}

    </MapContainer>
  );
}