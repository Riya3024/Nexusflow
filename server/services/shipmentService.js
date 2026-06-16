const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../data/shipments.csv"
);

function getShipments() {
  const data = fs.readFileSync(filePath,"utf8");

  const rows = data.trim().split("\n");

  const headers = rows.shift().split(",");

  return rows.map(row => {
    const values = row.split(",");

    return headers.reduce((obj, h, i) => {
      obj[h] = values[i];
      return obj;
    }, {});
  });
}

function addShipment(shipment) {
  const line =
    "\n" +
    [
      shipment.id,
      shipment.origin,
      shipment.destination,
      shipment.weight,
      shipment.priority,
      shipment.status,
      shipment.eta,
      shipment.progress,
      shipment.mode,
      shipment.risk
    ].join(",");

  fs.appendFileSync(filePath, line);
}

module.exports = {
  getShipments,
  addShipment
};