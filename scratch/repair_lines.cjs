const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'App developement', 'Demo apps for clients', 'saas Agentic bot', 'apps', 'web', 'app', 'b', '[tenant]', 'pos', 'page.tsx');

let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split(/\r?\n/);

const replacementStr = `  const handleVerifyQRSuccess = async () => {
    setPaymentSuccess(true);
    // Voice Announcement
    try {
      const amountText = store?.globalCurrency === 'INR' ? \`\${total.toFixed(2)} rupees\` : \`\${total.toFixed(2)} \${store?.globalCurrency || 'dollars'}\`;
      const msg = new SpeechSynthesisUtterance(\`Payment of \${amountText} received successfully\`);
      window.speechSynthesis.speak(msg);
    } catch(e) { console.error("TTS Failed", e) }

    setTimeout(() => {
      setIsQRModalOpen(false);
      processCheckout();
    }, 2500);
  };

  const handleCreateCustomer = async () => {
    setIsCreatingCustomer(true);
    try {
      const res = await fetch('/api/ecom/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug, storeId, name: customerName, phone: customerPhone, email: customerEmail, source: "pos" })
      });
      const data = await res.json();
      if (data.customer) {
        setCustomers(prev => [...prev, data.customer]);
        setSelectedCustomerId(data.customer.id);
        setCustomerSearch("");
        setToastMessage({title: "Customer Created", subtitle: \`New Customer: \${data.customer.name} updated successfully.\`});
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert("Failed to create customer");
      }
    } catch(e) {
      console.error(e);
      alert("Error creating customer");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handlePosLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/ecom/pos-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "login", tenantSlug, phone: loginPhone, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setLoggedInManager(data.manager);
        localStorage.setItem(\`pos_mgr_\${tenantSlug}\`, JSON.stringify(data.manager));
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch(err) {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };`;

if (lines[575].includes('handleVerifyQRSuccess') && lines[594].includes('};')) {
    lines.splice(575, 20, replacementStr);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log("Successfully replaced lines 576-595");
} else {
    console.log("Lines didn't match perfectly. line 576:", lines[575]);
    console.log("line 595:", lines[594]);
}
