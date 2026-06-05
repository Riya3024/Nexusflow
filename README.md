# 🚀 NexusFlow AI

## AI-Powered Supply Chain Risk Intelligence & Route Optimization Platform

NexusFlow AI is an intelligent logistics command center that combines Machine Learning, Google Gemini AI, Route Optimization, Real-Time Risk Monitoring, and Cascade Impact Simulation to help organizations predict disruptions and make smarter supply chain decisions.

The platform visualizes logistics networks on an interactive map, predicts operational risks using AI/ML models, simulates disruption impacts, and recommends safer alternative routes in real time.

---

# 📌 Problem Statement

Modern supply chains face constant disruptions due to:

- Extreme weather
- Port congestion
- Transportation delays
- Carrier reliability issues
- Geopolitical risks

Most systems react only after disruptions occur.

NexusFlow AI provides predictive intelligence that enables proactive decision-making before disruptions become costly problems.

---

# 🎯 Core Features

## 1. Live Risk Command Dashboard

Real-time monitoring dashboard displaying:

- Ports
- Logistics hubs
- Warehouses
- Transportation routes

Each node is assigned a dynamic risk score ranging from 0–100.

### Risk Classification

| Score Range | Risk Level |
|------------|------------|
| 0 - 40 | Low Risk |
| 41 - 70 | Medium Risk |
| 71 - 100 | High Risk |

---

## 2. Interactive Supply Chain Network Map

Built using:

- React Leaflet
- CartoDB Dark Matter

Features:

- Risk-colored nodes
- Route visualization
- Weather overlays
- Cascade impact highlighting
- Route recommendations

### Node Colors

🟢 Green = Safe

🟡 Yellow = Medium Risk

🔴 Red = High Risk

🟣 Purple = Cascade Impacted

---

## 3. Machine Learning Risk Prediction Engine

NexusFlow uses an XGBoost Regressor model trained on logistics risk indicators.

### Input Features

- Weather Severity
- Traffic Congestion
- Ship Density
- Delay Rate

### Output

Predicted risk score:

```text
0 – 100
```

### ML Workflow

```text
Dataset
   ↓
XGBoost Training
   ↓
trained_model.pkl
   ↓
FastAPI Service
   ↓
Node.js Backend
   ↓
Dashboard Risk Scores
```

---

## 4. Gemini AI Route Optimization

When a user selects:

```text
Start Node
Destination Node
```

The system:

1. Calculates safest route using Dijkstra Algorithm
2. Sends route context to Gemini AI
3. Receives ranked route alternatives

### Gemini Output

- Alternative Routes
- Tradeoffs
- Risk Analysis
- Recommendations

Example:

```json
{
  "rank": 1,
  "path": ["Mumbai", "Dubai", "Rotterdam"],
  "risk": 22,
  "reason": "Lower congestion risk"
}
```

---

## 5. Cascade Disruption Simulator

Users can click any node on the map and simulate failure.

The system evaluates:

```text
What happens if this node becomes unavailable?
```

Gemini AI generates:

- Affected nodes
- Downstream disruptions
- Business impact assessment
- Risk propagation summary

Example:

```text
Singapore Port Failure

↓

Affected Nodes:
Mumbai
Dubai
Rotterdam

↓

Consequences:
Shipment Delays
Inventory Shortages
Route Congestion
```

---

## 6. Route Intelligence Center

Dedicated route management page.

Capabilities:

### Route Monitoring

- Active Routes
- Delayed Routes
- High Risk Routes

### AI Analysis

Generate Gemini-powered route alternatives.

### Route Actions

- Accept Route
- Reject Route

All actions are stored in audit logs.

---

## 7. Activity Stream & Audit Logging

Every major decision is recorded.

Examples:

- Route Accepted
- Route Rejected
- Cascade Simulation
- AI Recommendations

Audit logs provide:

- Traceability
- Decision History
- Operational Accountability

---

## 8. KPI Command Center

Live operational metrics:

### Active Shipments

Current active logistics movements.

### Routes At Risk

Routes exceeding risk thresholds.

### Average Network Risk

Average risk across all monitored nodes.

### AI Acceptance Rate

Measures adoption of AI-generated recommendations.

---

## 9. Weather Risk Overlay

Visual weather intelligence layer.

Displays:

- Environmental risk zones
- Weather severity around nodes
- Operational impact regions

Can be toggled on/off directly from the dashboard.

---

## 10. Analytics Dashboard

Historical performance insights.

Visualizations include:

### Disruptions Over Time

Area Chart

### Risk Trends

Line Chart

### Future Metrics

- Carrier Scoreboard
- AI Acceptance Rate
- Resolution Time Analysis
- Delay Trends

---

# 🏗 System Architecture

```text
                    ┌────────────────────┐
                    │ React Frontend     │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Express Backend    │
                    └───────┬────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                                   │
          ▼                                   ▼
 ┌──────────────────┐              ┌──────────────────┐
 │ Google Gemini AI │              │ FastAPI ML API   │
 │ Route Analysis   │              │ XGBoost Model    │
 └──────────────────┘              └──────────────────┘
          │                                   │
          └─────────────────┬─────────────────┘
                            ▼
                  Risk Intelligence Engine
```

---

# 🛠 Technology Stack

## Frontend

- React.js
- React Leaflet
- Axios
- Recharts

## Backend

- Node.js
- Express.js

## Artificial Intelligence

- Google Gemini API

## Machine Learning

- Python
- FastAPI
- XGBoost
- NumPy
- Joblib

## Visualization

- Leaflet Maps
- CartoDB Dark Matter

---

# 📂 Project Structure

```text
NexusFlow/
│
├── client/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── RoutesPage.jsx
│   │   ├── Analytics.jsx
│   │   └── AuditLogs.jsx
│   │
│   ├── map/
│   │   └── MapView.jsx
│   │
│   └── ai/
│       └── AskAI.jsx
│
├── server/
│   ├── routes/
│   │   └── api.js
│   │
│   ├── services/
│   │   ├── riskEngine.js
│   │   ├── mlService.js
│   │   └── geminiService.js
│   │
│   └── data/
│       └── auditStore.js
│
├── ml_service/
│   ├── app.py
│   ├── train_model.py
│   └── trained_model.pkl
│
└── README.md
```

---

# 🔮 Future Enhancements

- Real-Time Vessel Tracking
- Satellite Weather Intelligence
- Shipment Priority Escalation
- PDF Disruption Report Export
- Carrier Performance Analytics
- Predictive Delay Forecasting
- Multi-Agent Logistics AI
- Global Supply Chain Digital Twin

---

# 📈 Impact

NexusFlow AI transforms traditional logistics management from a reactive system into a predictive AI-powered decision platform.

Organizations can:

- Detect risks earlier
- Optimize routes faster
- Reduce operational delays
- Improve supply chain resilience
- Make data-driven decisions

---

# 👨‍💻 Developer

**Riya Kumari**

Built with:

**React.js + Node.js + FastAPI + XGBoost + Google Gemini AI + Leaflet**

---

## Vision

> Transforming supply chains from reactive operations into predictive AI-powered intelligence systems.