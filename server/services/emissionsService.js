const EMISSION_FACTORS = {
  road: 0.12, // kg CO2e per tonne-km
  rail: 0.03,
  sea: 0.01,
  air: 0.8
};

const FUEL_FACTORS = {
  road: 0.33, // liters per km for a light truck baseline
  rail: 0.08,
  sea: 0.04,
  air: 2.5
};

const CO2_PER_LITER_DIESEL = 2.68;

function calculateFreightEmissions({ distanceKm, weightKg, mode }) {
  const m = (mode || "road").toLowerCase();
  const weightTonnes = weightKg / 1000;
  const tonneKm = distanceKm * weightTonnes;
  const emissionFactor = EMISSION_FACTORS[m] ?? EMISSION_FACTORS.road;
  const fuelRate = FUEL_FACTORS[m] ?? FUEL_FACTORS.road;

  const co2FromTonneKm = tonneKm * emissionFactor;
  const fuelLiters = distanceKm * fuelRate * (1 + weightTonnes * 0.15);
  const co2FromFuel = fuelLiters * CO2_PER_LITER_DIESEL;

  return {
    tonneKm: Number(tonneKm.toFixed(2)),
    fuelLiters: Number(fuelLiters.toFixed(2)),
    co2Kg: Number(co2FromFuel.toFixed(2)),
    co2KgDistanceBased: Number(co2FromTonneKm.toFixed(2))
  };
}

module.exports = { calculateFreightEmissions };