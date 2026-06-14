const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../apps/db/local_db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

console.log("Local Database Inspection:");
for (const key of Object.keys(data)) {
  console.log(`- ${key}: ${Array.isArray(data[key]) ? data[key].length : typeof data[key]} items`);
}
