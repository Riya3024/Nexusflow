const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "audit.json");

// ================= INIT FILE =================
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}

// ================= ADD AUDIT =================
function addAudit(entry) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));

    const newEntry = {
      id: Date.now(),
      time: new Date().toISOString(),
      ...entry
    };

    data.push(newEntry);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Audit write error:", err);
  }
}

// ================= GET AUDIT =================
function getAudit() {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    return data;
  } catch (err) {
    console.error("Audit read error:", err);
    return [];
  }
}

// ================= EXPORT =================
module.exports = {
  addAudit,
  getAudit
};