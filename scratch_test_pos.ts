import { LocalDbController } from "./packages/db/src/localDb.ts";

async function testCreate() {
  try {
    const res = await LocalDbController.createPosManager("imran-ai", {
      name: "Test Manager",
      phone: "1234567890",
      password: "pass",
      storeId: "store_1",
      isActive: true
    });
    console.log("Created:", res);
    
    const updated = await LocalDbController.updatePosManager("imran-ai", res.id, {
      name: "Updated Manager"
    });
    console.log("Updated:", updated);
  } catch (err) {
    console.error("Error:", err);
  }
}

testCreate();
