const fs = require("fs");

function readCSV(path) {
  if (!fs.existsSync(path)) return [];

  const text = fs.readFileSync(path, "utf8");

  const rows = text.trim().split("\n");

  const headers = rows.shift().split(",");

  return rows.map(row => {
    const values = row.split(",");

    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = values[i];
    });

    return obj;
  });
}

function appendCSV(path, row) {

  const values = Object.values(row).join(",");

  fs.appendFileSync(path, "\n" + values);
}

module.exports = {
  readCSV,
  appendCSV
};