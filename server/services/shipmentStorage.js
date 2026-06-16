const pool = require("../config/db");

async function initTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shipments (
      id VARCHAR(50) PRIMARY KEY,
      origin VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      mode VARCHAR(50) DEFAULT 'Sea',
      risk INT DEFAULT 0,
      path JSON,
      currentStep INT DEFAULT 0,
      progress INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Booked',
      plannedEta VARCHAR(50),
      predictedEta VARCHAR(50),
      createdAt BIGINT,
      events JSON,
      alerts JSON,
      recommendedRoute JSON,
      rerouted TINYINT(1) DEFAULT 0,
      delayProbability INT DEFAULT 0,
      healthScore INT DEFAULT 0,
      rerouteSuggestion JSON NULL
    )
  `);
}

const ready = initTable();

function safeJson(value, fallback = []) {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

async function getShipments() {
  await ready;
  const [rows] = await pool.execute("SELECT * FROM shipments ORDER BY createdAt DESC");
  return rows.map((row) => ({
    ...row,
    path: safeJson(row.path),
    events: safeJson(row.events),
    alerts: safeJson(row.alerts),
    recommendedRoute: safeJson(row.recommendedRoute),
    rerouteSuggestion: safeJson(row.rerouteSuggestion, null)
  }));
}

async function getShipmentById(id) {
  await ready;
  const [rows] = await pool.execute("SELECT * FROM shipments WHERE id = ?", [id]);
  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    path: safeJson(row.path),
    events: safeJson(row.events),
    alerts: safeJson(row.alerts),
    recommendedRoute: safeJson(row.recommendedRoute),
    rerouteSuggestion: safeJson(row.rerouteSuggestion, null)
  };
}

async function createShipment(shipment) {
  await ready;

  const data = {
    id: shipment.id,
    origin: shipment.origin,
    destination: shipment.destination,
    mode: shipment.mode || "Sea",
    risk: Number(shipment.risk || 0),
    path: JSON.stringify(shipment.path || []),
    currentStep: shipment.currentStep ?? 0,
    progress: shipment.progress ?? 0,
    status: shipment.status || "Booked",
    plannedEta: shipment.plannedEta || null,
    predictedEta: shipment.predictedEta || null,
    createdAt: shipment.createdAt || Date.now(),
    events: JSON.stringify(shipment.events || []),
    alerts: JSON.stringify(shipment.alerts || []),
    recommendedRoute: JSON.stringify(shipment.recommendedRoute || []),
    rerouted: shipment.rerouted ? 1 : 0,
    delayProbability: Number(shipment.delayProbability || 0),
    healthScore: Number(shipment.healthScore || 0),
    rerouteSuggestion: shipment.rerouteSuggestion ? JSON.stringify(shipment.rerouteSuggestion) : null
  };

  await pool.execute(
    `INSERT INTO shipments
    (id, origin, destination, mode, risk, path, currentStep, progress, status, plannedEta, predictedEta, createdAt, events, alerts, recommendedRoute, rerouted, delayProbability, healthScore, rerouteSuggestion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.origin,
      data.destination,
      data.mode,
      data.risk,
      data.path,
      data.currentStep,
      data.progress,
      data.status,
      data.plannedEta,
      data.predictedEta,
      data.createdAt,
      data.events,
      data.alerts,
      data.recommendedRoute,
      data.rerouted,
      data.delayProbability,
      data.healthScore,
      data.rerouteSuggestion
    ]
  );

  return getShipmentById(data.id);
}

async function updateShipment(id, updates) {
  await ready;
  const existing = await getShipmentById(id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };

  await pool.execute(
    `UPDATE shipments SET
      origin = ?,
      destination = ?,
      mode = ?,
      risk = ?,
      path = ?,
      currentStep = ?,
      progress = ?,
      status = ?,
      plannedEta = ?,
      predictedEta = ?,
      createdAt = ?,
      events = ?,
      alerts = ?,
      recommendedRoute = ?,
      rerouted = ?,
      delayProbability = ?,
      healthScore = ?,
      rerouteSuggestion = ?
    WHERE id = ?`,
    [
      merged.origin,
      merged.destination,
      merged.mode,
      Number(merged.risk || 0),
      JSON.stringify(merged.path || []),
      Number(merged.currentStep || 0),
      Number(merged.progress || 0),
      merged.status,
      merged.plannedEta || null,
      merged.predictedEta || null,
      merged.createdAt || Date.now(),
      JSON.stringify(merged.events || []),
      JSON.stringify(merged.alerts || []),
      JSON.stringify(merged.recommendedRoute || []),
      merged.rerouted ? 1 : 0,
      Number(merged.delayProbability || 0),
      Number(merged.healthScore || 0),
      merged.rerouteSuggestion ? JSON.stringify(merged.rerouteSuggestion) : null,
      id
    ]
  );

  return getShipmentById(id);
}

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment
};