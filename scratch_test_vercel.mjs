async function test() {
  const res = await fetch("https://saas-agentic-bot.vercel.app/api/ecom/pos-managers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", tenantSlug: "imran-ai", name: "Test API", phone: "111", password: "111", storeId: "store_1" })
  });
  const data = await res.json();
  console.log("Vercel POST:", data);

  const res2 = await fetch("https://saas-agentic-bot.vercel.app/api/ecom/pos-managers?tenantSlug=imran-ai");
  const data2 = await res2.json();
  console.log("Vercel GET:", data2);
}
test();
