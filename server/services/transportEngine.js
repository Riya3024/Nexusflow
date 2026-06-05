function calculateTransport(distance) {

  return {
    air: {
      eta: distance / 800,
      cost: distance * 1.5,
      risk: 20
    },

    sea: {
      eta: distance / 35,
      cost: distance * 0.4,
      risk: 15
    },

    road: {
      eta: distance / 60,
      cost: distance * 0.8,
      risk: 35
    }
  };
}

module.exports = {
  calculateTransport
};