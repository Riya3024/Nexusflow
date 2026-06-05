# 🚀 NexusFlow — AI-Powered Supply Chain Command Center

NexusFlow is a real-time, AI-driven logistics intelligence platform that predicts disruptions before they cascade and recommends optimized rerouting strategies using Google Gemini.

---

## 🧠 Overview

Modern supply chains are reactive — disruptions are detected only after damage is done.

**NexusFlow changes that.**

It continuously ingests live and simulated transit data, computes risk scores across all nodes, and uses AI to proactively recommend safer, faster routes — visualized on an interactive command dashboard.

---

## ⚡ Key Highlights

- 🔴 Real-time risk scoring (updates every 15 seconds)
- 🤖 Gemini-powered route optimization
- 🌍 Interactive Leaflet map with live network visualization
- 🚨 Anomaly detection & alert system
- 🔁 Cascade failure simulation
- 📊 KPI command bar with live metrics
- 🧾 Audit logs for AI decisions (accept/reject)
- 💬 Natural language AI query system

---

## 🧩 Problem It Solves

Supply chain managers often react too late to disruptions like:

- Port congestion
- Weather delays
- Carrier failures

NexusFlow enables **proactive decision-making** by:

- Predicting risks early  
- Simulating impact  
- Suggesting alternative routes  

---

## 👤 Target Users

- Logistics Managers  
- Supply Chain Analysts  
- Freight Coordinators  
- Enterprise Operations Teams  

---

## 🏗️ Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Leaflet.js (maps)
- Recharts (analytics)
- Framer Motion (animations)
- React Router

### Backend
- Node.js + Express
- REST APIs
- node-fetch
- dotenv

### AI Integration
- Google Gemini API (`gemini-1.5-flash`)

### External APIs
- OpenWeatherMap (weather risk)
- REST Countries (geo data)

---

## 🧠 Core Features

### 1. Live Risk Dashboard
- Nodes scored from **0–100**
- Color-coded severity (low → critical)

---

### 2. AI Route Optimizer
- Uses Gemini to generate:
  - 3 alternative routes
  - Risk comparison
  - Tradeoffs explanation

---

### 3. Interactive Map
- Leaflet-based network visualization
- Nodes = ports/hubs
- Routes = risk-colored lines

---

### 4. Cascade Simulator
- Click a node → simulate failure
- AI predicts downstream impact

---

### 5. Anomaly Detection
- Detects:
  - Delay spikes
  - Traffic congestion
  - Abnormal patterns

---

### 6. KPI Command Bar
- Active shipments
- Risky routes
- Avg delay
- AI acceptance rate

---

### 7. AI Decision System
- Accept → switch to AI route
- Reject → fallback to safest route (Dijkstra)
- Logged in audit trail

---

## 🗺️ User Flow

```text
Select Start & End
→ System computes safest route (Dijkstra)

AI generates alternatives (Gemini)

User:
→ Accept → AI route applied
→ Reject → Safe route restored