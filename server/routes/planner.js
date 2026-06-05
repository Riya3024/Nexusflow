const express = require("express");

const router = express.Router();

const {
  getDistance
} = require("../services/distanceEngine");

const {
  calculateTransport
} = require("../services/transportEngine");

const {
  recommendRoute
} = require("../services/recommendationEngine");

router.post("/", async (req, res) => {

  const {
    origin,
    destination,
    priority
  } = req.body;

  const distance =
    getDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

  const options =
    calculateTransport(distance);

  const best =
    recommendRoute(
      options,
      priority
    );

  res.json({
    success: true,
    distance,
    options,
    recommended: {
      mode: best[0],
      details: best[1]
    }
  });
});

module.exports = router;