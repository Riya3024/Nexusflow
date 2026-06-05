const express = require("express");

const auth =
require("../middleware/authMiddleware");

const {
  appendCSV
} = require("../services/csvService");

const router = express.Router();

router.post(
  "/create",
  auth,
  (req,res)=>{

    const shipment = {

      id: Date.now(),

      userId: req.user.id,

      origin:req.body.origin,

      destination:req.body.destination,

      cargoWeight:req.body.cargoWeight,

      transportType:req.body.transportType
    };

    appendCSV(
      "./data/shipments.csv",
      shipment
    );

    res.json({
      success:true,
      shipment
    });
  }
);

module.exports = router;