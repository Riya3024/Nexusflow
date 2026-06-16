const express = require("express");
const router = express.Router();

const {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment
} = require("../services/shipmentStorage");

// GET /api/shipments
function getAllShipments(req, res) {
  try {
    const shipments = getShipments();
    res.json(shipments);
    // or: res.json({ success: true, data: shipments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
}

// GET /api/shipments/:id
function getShipment(req, res) {
  try {
    const shipment = getShipmentById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json(shipment);
    // or: res.json({ success: true, data: shipment });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
}

// PATCH /api/shipments/:id
function patchShipment(req, res) {
  try {
    const existing = getShipmentById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const updated = updateShipment(req.params.id, req.body);
    res.json(updated);
    // or: res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update shipment" });
  }
}

// POST /api/shipments
router.post("/", (req,res)=>{
  try {

    const shipment = {
      id: "SHP" + Date.now(),

      origin: req.body.origin,

      destination: req.body.destination,

      mode: req.body.mode || "Sea",

      risk: Number(req.body.risk || 0),

      path: req.body.path || [
        req.body.origin,
        "Dubai Hub",
        "Singapore Hub",
        req.body.destination
      ],

      currentStep: 0,

      progress: 0,

      status: "Booked",

      plannedEta: req.body.eta || "18h",

      predictedEta: req.body.eta || "21h",

      createdAt: Date.now(),

      events:[
        {
          title:"Shipment Created",
          time:new Date().toISOString(),
          detail:"Created from planner"
        }
      ],

      alerts:[],

      recommendedRoute:[]
    };


    const created = createShipment(shipment);

    res.status(201).json(created);


  } catch(err){

    console.log(err);

    res.status(500).json({
      error:"Failed to create shipment"
    });

  }
});

router.get("/", getAllShipments);
router.get("/:id", getShipment);
router.patch("/:id", patchShipment);

// POST /api/shipments/:id/reroute
router.post("/:id/reroute", async (req, res) => {
  try {

    const shipment = getShipmentById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        error: "Shipment not found"
      });
    }


    const newRoute = [
      shipment.origin,
      "Dubai Hub",
      "Singapore Hub",
      shipment.destination
    ];


    const updated = updateShipment(
      shipment.id,
      {

        path: newRoute,

        recommendedRoute: newRoute,

        rerouted: true,

        currentStep: 0,

        progress: 0,

        status: "Booked",

        createdAt:
          shipment.createdAt ||
          Date.now(),

        plannedEta:
          shipment.plannedEta ||
          "18h",

        predictedEta:
          shipment.predictedEta ||
          "21h",


        events: [
          ...(shipment.events || []),
          {
            title:
              "AI Re-route Generated",

            time:
              new Date().toISOString(),

            detail:
              "Alternative route recommended"
          }
        ]
      }
    );


    res.json(updated);


  } catch(err){

    console.log(err);

    res.status(500).json({
      error:"Failed to reroute shipment"
    });

  }
});


module.exports = router;