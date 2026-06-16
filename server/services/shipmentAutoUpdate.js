const {
  getShipments,
  updateShipment
} = require("./shipmentStorage");

const { getBackupRoute } = require("./rerouteService");

async function startShipmentAutoUpdate() {
  setInterval(async () => {
    try {
      const shipments = await getShipments();

      for (const s of shipments) {
        if (!Array.isArray(s.path)) continue;
        if (s.path.length < 2) continue;
        if (s.currentStep >= s.path.length - 1) continue;

        const nextStep = Number(s.currentStep || 0) + 1;
        const totalSteps = s.path.length - 1;

        const progress = Math.min(
          100,
          Math.round((nextStep / Math.max(totalSteps, 1)) * 100)
        );

        const status =
          progress >= 100
            ? "Delivered"
            : progress >= 75
            ? "Out for Delivery"
            : progress >= 25
            ? "In Transit"
            : "Booked";

        const delayProbability = Math.min(
          95,
          Math.round((s.risk || 0) * 0.8 + progress * 0.2)
        );

        const healthScore = Math.max(
          0,
          100 - (s.risk || 0) - progress / 2
        );

        const predictedEta =
          `${18 + Math.round((s.risk || 0) / 10) + Math.round(progress / 20)}h`;

        const alerts = [
          ...(s.alerts || [])
        ];

        if (
          progress > 25 &&
          !alerts.some(
            (a) =>
              a.type === "TRANSIT"
          )
        ) {
          alerts.push({
            type: "TRANSIT",
            message:
              "Shipment entered transit zone"
          });
        }

        if (
          progress > 75 &&
          !alerts.some(
            (a) =>
              a.type === "ETA"
          )
        ) {
          alerts.push({
            type: "ETA",
            message:
              "Shipment approaching destination"
          });
        }

        if (
          (s.risk || 0) > 60 &&
          !alerts.some(
            (a) =>
              a.type === "RISK"
          )
        ) {
          alerts.push({
            type: "RISK",
            message:
              `Risk increased to ${s.risk}`
          });
        }

        const rerouteSuggestion =
          (s.risk || 0) >= 80
            ? getBackupRoute(s, shipments)
            : s.rerouteSuggestion || {
                shouldReroute: false,
                message: "Risk is within acceptable range."
              };

        if (
          rerouteSuggestion.shouldReroute &&
          !alerts.some(
            (a) =>
              a.type === "REROUTE"
          )
        ) {
          alerts.push({
            type: "REROUTE",
            message:
              rerouteSuggestion.message
          });
        }

        const event = {
          title: `Moved to ${s.path[nextStep]}`,
          time:
            new Date().toISOString(),
          detail:
            `Shipment reached step ${
              nextStep + 1
            } of ${s.path.length}`
        };

        await updateShipment(
          s.id,
          {
            currentStep:
              nextStep,
            progress,
            status,
            delayProbability,
            healthScore,
            predictedEta,
            rerouteSuggestion,
            alerts,
            events: [
              ...(s.events || []),
              event
            ]
          }
        );
      }
    } catch (err) {
      console.error("Auto update error:", err);
    }
  }, 5000);
}

module.exports = {
  startShipmentAutoUpdate
};