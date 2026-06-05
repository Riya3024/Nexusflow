function recommendRoute(options, priority) {

  if (priority === "FAST") {

    return Object.entries(options)
      .sort(
        (a, b) =>
          a[1].eta -
          b[1].eta
      )[0];
  }

  if (priority === "CHEAP") {

    return Object.entries(options)
      .sort(
        (a, b) =>
          a[1].cost -
          b[1].cost
      )[0];
  }

  return Object.entries(options)
    .sort(
      (a, b) =>
        a[1].risk -
        b[1].risk
    )[0];
}

module.exports = {
  recommendRoute
};