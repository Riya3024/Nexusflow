const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/shipments.json");

function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");
}

function getShipments() {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
}

function saveShipments(shipments) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(shipments, null, 2), "utf8");
}

function createShipment(shipment) {
  const shipments = getShipments();
  shipments.push(shipment);
  saveShipments(shipments);
  return shipment;
}

function getShipmentById(id) {
  return getShipments().find((s) => String(s.id) === String(id)) || null;
}

function updateShipment(id, updates) {
  const shipments = getShipments();
  const index = shipments.findIndex((s) => String(s.id) === String(id));
  if (index === -1) return null;

  shipments[index] = { ...shipments[index], ...updates };
  saveShipments(shipments);
  return shipments[index];
}

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  saveShipment: createShipment
};