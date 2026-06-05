const axios = require("axios");

async function searchCities(query) {
  try {
    const url = "https://photon.komoot.io/api/";
    const res = await axios.get(url, {
      params: {
        q: query,
        limit: 8
      },
      headers: {
        "User-Agent": "NexusFlow/1.0"
      }
    });

    const features = res.data?.features || [];

    return features.map((item) => {
      const p = item.properties || {};
      const name = p.name || p.city || p.town || p.village || "";
      const city = p.city || p.town || p.village || "";
      const state = p.state || "";
      const country = p.country || "";
      const parts = [name, city, state, country].filter(Boolean);

      return {
        place_id: p.osm_id || item.id || Math.random().toString(36).slice(2),
        name,
        display_name: parts.join(", "),
        lat: item.geometry?.coordinates?.[1] ?? null,
        lon: item.geometry?.coordinates?.[0] ?? null,
        state,
        country,
        raw: item
      };
    });
  } catch (err) {
    console.error("Photon search error:", err.message);
    throw new Error("Unable to fetch city suggestions");
  }
}

async function getCoordinates(city) {
  try {
    const results = await searchCities(city);
    if (!results.length) throw new Error("City not found");

    const first = results[0];
    return {
      lat: first.lat,
      lng: first.lon,
      display_name: first.display_name
    };
  } catch (err) {
    console.error("Get coordinates error:", err.message);
    throw new Error("Unable to locate city");
  }
}

module.exports = {
  searchCities,
  getCoordinates
};