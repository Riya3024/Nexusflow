const axios = require("axios");
const https = require("https");

const API_KEY = process.env.WEATHER_API_KEY;
const agent = new https.Agent({ family: 4 });

function mapWeatherToRisk(main) {
  const map = {
    Clear: 10,
    Clouds: 20,
    Rain: 60,
    Thunderstorm: 80,
    Drizzle: 50,
    Snow: 70,
    Mist: 40,
    Fog: 50,
    Haze: 35,
    Smoke: 45,
    Dust: 45,
    Sand: 45,
    Ash: 55,
    Squall: 75,
    Tornado: 95
  };

  return map[main] ?? 30;
}

async function getWeatherRisk(lat, lon) {
  try {
    const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric"
      },
      timeout: 5000,
      httpsAgent: agent
    });

    const weatherMain = res.data.weather?.[0]?.main ?? "Clear";
    const weatherDesc = res.data.weather?.[0]?.description ?? "";
    const temp = res.data.main?.temp ?? 0;
    const feelsLike = res.data.main?.feels_like ?? temp;
    const pressure = res.data.main?.pressure ?? 1013;
    const humidity = res.data.main?.humidity ?? 50;
    const tempMin = res.data.main?.temp_min ?? temp;
    const tempMax = res.data.main?.temp_max ?? temp;
    const windSpeed = res.data.wind?.speed ?? 0;
    const windDeg = res.data.wind?.deg ?? null;
    const windGust = res.data.wind?.gust ?? 0;
    const visibility = res.data.visibility ?? 10000;
    const clouds = res.data.clouds?.all ?? 0;
    const rain = res.data.rain?.["1h"] ?? res.data.rain?.["3h"] ?? 0;
    const snow = res.data.snow?.["1h"] ?? res.data.snow?.["3h"] ?? 0;

    let risk = mapWeatherToRisk(weatherMain);
    if (weatherMain === "Thunderstorm") risk += 20;
    if (weatherMain === "Drizzle") risk += 10;
    if (weatherMain === "Snow") risk += 15;
    if (weatherMain === "Fog" || weatherMain === "Mist" || weatherMain === "Haze") risk += 10;

    risk += Math.min(20, windSpeed * 2);
    risk += Math.min(10, windGust * 1.5);
    risk += Math.min(15, rain * 5);
    risk += Math.min(15, snow * 5);

    if (visibility < 3000) risk += 15;
    if (clouds > 75) risk += 5;
    if (humidity > 85) risk += 5;
    if (pressure < 1000) risk += 10;
    if (Math.abs(temp - feelsLike) >= 5) risk += 5;

    risk = Math.min(100, Math.round(risk));

    return {
      score: risk,
      level: risk >= 70 ? "high" : risk >= 40 ? "medium" : "low",
      raw: {
        weatherMain,
        weatherDesc,
        temp,
        feelsLike,
        pressure,
        humidity,
        tempMin,
        tempMax,
        windSpeed,
        windDeg,
        windGust,
        visibility,
        clouds,
        rain,
        snow
      }
    };
  } catch (err) {
    console.error("Weather API Error:", err.message);
    const fallback = Math.floor(Math.random() * 50) + 20;
    return {
      score: fallback,
      level: fallback >= 70 ? "high" : fallback >= 40 ? "medium" : "low",
      raw: null
    };
  }
}

module.exports = { getWeatherRisk };