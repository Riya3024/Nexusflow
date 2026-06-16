function getBackupRoute(shipment, allShipments = []) {
  const alternatives = allShipments.filter(
    (s) => s.id !== shipment.id && s.origin === shipment.origin && s.destination === shipment.destination
  );

  const sorted = alternatives.sort((a, b) => (a.risk || 0) - (b.risk || 0));
  const backup = sorted[0];

  if (!backup) {
    return {
      shouldReroute: false,
      message: "No backup route available."
    };
  }
console.log("REROUTE RESULT:", {
  shouldReroute: true,
  recommendedRoute: backup.path,
  backupMode: backup.mode,
  backupRisk: backup.risk,
  backupEta: backup.predictedEta
});
  return {
  shouldReroute: true,
  message: "High risk detected. Suggested reroute available.",
  recommendedRoute: backup.path || [],
  backupMode: backup.mode || "Sea",
  backupRisk: backup.risk || 0,
  backupEta: backup.predictedEta || backup.eta || "N/A"
};
}

module.exports = { getBackupRoute };