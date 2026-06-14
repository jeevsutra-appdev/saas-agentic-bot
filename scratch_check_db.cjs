const { LocalDbController } = require("./packages/db/dist/localDb.js");

async function check() {
  try {
    const managers = await LocalDbController.getPosManagers("imran-ai");
    console.log("POS Managers for imran-ai:", managers);
    
    const db = await LocalDbController.read();
    console.log("Total POS Managers in DB:", db.posManagers?.length);
    console.log("Total Delivery Boys in DB:", db.deliveryBoys?.length);
  } catch (err) {
    console.error("Error reading DB:", err);
  }
}

check();
