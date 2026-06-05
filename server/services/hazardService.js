const axios = require("axios");

async function getEarthquakeRisk(lat, lon) {
  try {
    const end = new Date();
    const start = new Date();

    // Check last 90 days instead of 30
    start.setDate(start.getDate() - 90);

    const res = await axios.get(
      "https://earthquake.usgs.gov/fdsnws/event/1/query",
      {
        params: {
          format: "geojson",
          starttime: start.toISOString().split("T")[0],
          endtime: end.toISOString().split("T")[0],

          latitude: lat,
          longitude: lon,

          // Increased search area
          maxradiuskm: 1000,

          // Lower threshold to capture more events
          minmagnitude: 2.5,

          orderby: "time"
        },
        timeout: 10000
      }
    );

    const features = res.data?.features || [];

console.log("================================");
console.log("EARTHQUAKE CHECK");
console.log("Latitude:", lat);
console.log("Longitude:", lon);
console.log("Features Found:", features.length);

if (features.length > 0) {
  console.log(
    "Latest Magnitude:",
    features[0]?.properties?.mag
  );
}
console.log("================================");

    const count = features.length;

    const strongest = features.reduce(
      (max, f) => Math.max(max, f?.properties?.mag || 0),
      0
    );

    console.log(
      `[EQ] Lat:${lat} Lon:${lon} Events:${count} Strongest:${strongest}`
    );

    let score = 0;

    if (count > 0) {
      score = Math.min(
        100,
        Math.round(count * 5 + strongest * 12)
      );
    }

    return {
      score,
      level:
        score >= 70
          ? "high"
          : score >= 40
          ? "medium"
          : "low",

      count,
      strongest,

      raw: features[0] || null
    };
  } catch (err) {
    console.error("Earthquake risk error:", err.message);

    return {
      score: 0,
      level: "low",
      count: 0,
      strongest: 0,
      raw: null
    };
  }
}

async function getFloodRisk(lat, lon) {
  try {
    // Open-Meteo flood service
    const res = await axios.get(
      "https://flood-api.open-meteo.com/v1/flood",
      {
        params: {
          latitude: lat,
          longitude: lon
        },
        timeout: 10000
      }
    );

    console.log(
      "[FLOOD] Response:",
      JSON.stringify(res.data, null, 2)
    );

    const data = res.data || {};

    console.log("================================");
console.log("FLOOD CHECK");
console.log("Latitude:", lat);
console.log("Longitude:", lon);
console.log(JSON.stringify(data, null, 2));
console.log("================================");

    const discharge =
      Number(
        data?.daily?.river_discharge?.[0] ??
        data?.river_discharge ??
        data?.riverDischarge ??
        0
      ) || 0;

    let score = 0;

    if (discharge > 0) {
      score = Math.min(
        100,
        Math.round(Math.log10(discharge + 1) * 25)
      );
    }

    return {
      score,

      level:
        score >= 70
          ? "high"
          : score >= 40
          ? "medium"
          : "low",

      discharge,

      raw: data
    };
  } catch (err) {
    console.error("Flood risk error:", err.message);

    return {
      score: 0,
      level: "low",
      discharge: 0,
      raw: null
    };
  }
}

async function getClimateHazardRisk(lat, lon) {
  const [earthquake, flood] = await Promise.all([
    getEarthquakeRisk(lat, lon),
    getFloodRisk(lat, lon)
  ]);

  const score = Math.round(
    (earthquake.score + flood.score) / 2
  );

  console.log(
    `[HAZARD] Lat:${lat} Lon:${lon}`,
    {
      earthquake: earthquake.score,
      flood: flood.score,
      total: score
    }
  );

  return {
    score,

    level:
      score >= 70
        ? "high"
        : score >= 40
        ? "medium"
        : "low",

    earthquake,
    flood
  };
}

module.exports = {
  getEarthquakeRisk,
  getFloodRisk,
  getClimateHazardRisk
};