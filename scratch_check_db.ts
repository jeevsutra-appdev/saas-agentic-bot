import { LocalDbController } from "./packages/db/src/localDb.ts";

async function check() {
  try {
    const managers = await LocalDbController.getPosManagers("imran-ai");
    console.log("POS Managers for imran-ai:", managers);
    
    const db = await LocalDbController.read();
    console.log("Total POS Managers in DB:", db.posManagers?.length);
    console.log("Total Delivery Boys in DB:", db.deliveryBoys?.length);
    
    // Check if storefront template is undefined
    const storefront = db.storefronts?.find(s => s.tenantSlug === "imran-ai");
    console.log("Storefront template:", storefront?.template);
    
    if (storefront && !storefront.template) {
        console.log("Fixing undefined template...");
        storefront.template = "retail";
        await LocalDbController.write(db);
        console.log("Fixed.");
    }
  } catch (err) {
    console.error("Error reading DB:", err);
  }
}

check();
