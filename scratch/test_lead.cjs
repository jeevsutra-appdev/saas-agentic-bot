async function test() {
  const res = await fetch("https://saas-agentic-bot.vercel.app/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantSlug: "jeevsutra-appdev",
      name: "Test Lead",
      phone: "1234567890",
      countryCode: "+91",
      email: "",
      type: "ecom",
      details: "Test"
    })
  });
  console.log(res.status, await res.text());
}
test();
