"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Trash2, Printer, 
  Home, List, Clock, Wallet, Percent, Settings, LogOut,
  ChevronDown, Minus, Plus, ShoppingCart, X, CheckCircle, QrCode
} from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function POSTerminal() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tenantSlug = params.tenant as string;
  const storeId = searchParams?.get("storeId") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountInput, setDiscountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit" | "qris">("qris");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, subtitle: string} | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [customersList, setCustomersList] = useState<any[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");



  // Mobile cart drawer state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // POS Manager Login State
  const [loggedInManager, setLoggedInManager] = useState<any>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Settings Sidebar State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [posThemeColor, setPosThemeColor] = useState("#FF4F64");
  const [posUpiId, setPosUpiId] = useState("");
  const [posPrinterType, setPosPrinterType] = useState("thermal");
  const [posPaperSize, setPosPaperSize] = useState("80mm");
  const [savingSettings, setSavingSettings] = useState(false);

  // QR Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const prodRes = await fetch(`/api/ecom?tenant=${tenantSlug}&storeId=${storeId}`);
        if (prodRes.ok) {
          const pData = await prodRes.json();
          const validProducts = (pData.products || []).filter((p: any) => p.status === 'active' || p.status === undefined);
          setProducts(validProducts);
          setCategoriesData(pData.categories || []);
          setStore(pData.storefront);
          
          if (pData.storefront?.posThemeColor) setPosThemeColor(pData.storefront.posThemeColor);
          if (pData.storefront?.posUpiId) setPosUpiId(pData.storefront.posUpiId);
          if (pData.storefront?.posPrinterType) setPosPrinterType(pData.storefront.posPrinterType);
          if (pData.storefront?.posPaperSize) setPosPaperSize(pData.storefront.posPaperSize);
        }

        const custRes = await fetch(`/api/ecom/customers?tenantSlug=${tenantSlug}&storeId=${storeId}`);
        if (custRes.ok) {
          const cData = await custRes.json();
          setCustomers(cData.customers || []);
        }
      } catch (err) {
        console.error("Failed to fetch POS data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tenantSlug, storeId]);

  // Barcode Scanner Integration
  useEffect(() => {
    let barcodeString = "";
    let timeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isSettingsOpen || isQRModalOpen) return;
      
      if (e.key === "Enter") {
        if (barcodeString.length > 2) {
          const matchedProd = products.find(p => p.sku === barcodeString || p.id === barcodeString || p.name.toLowerCase() === barcodeString.toLowerCase());
          if (matchedProd) {
            addToCart(matchedProd);
          } else {
            alert("Product not found in catalog for barcode: " + barcodeString);
          }
        }
        barcodeString = "";
        return;
      }

      if (e.key.length === 1) {
        barcodeString += e.key;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => { barcodeString = ""; }, 150); // Scanner inputs are very fast
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, isSettingsOpen, isQRModalOpen]);

  // Mobile App Scanner Polling
  useEffect(() => {
    if (!storeId || !tenantSlug || products.length === 0) return;
    
    let lastPollTime = Date.now() - 5000; // Look back slightly on mount
    
    const pollScanner = async () => {
      try {
        const res = await fetch(`/api/ecom/scanner?tenantSlug=${tenantSlug}&storeId=${storeId}&since=${lastPollTime}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.success && data.scans && data.scans.length > 0) {
          lastPollTime = data.serverTime;
          
          data.scans.forEach((scan: any) => {
            const matchedProd = products.find(p => p.sku === scan.barcode || p.id === scan.barcode || p.name.toLowerCase() === scan.barcode.toLowerCase());
            if (matchedProd) {
              setCart(prev => {
                const existing = prev.find(item => item.id === matchedProd.id);
                if (existing) {
                  return prev.map(item => item.id === matchedProd.id ? { ...item, qty: item.qty + 1 } : item);
                }
                return [...prev, { ...matchedProd, qty: 1 }];
              });
              
              setToastMessage({ title: "Product Scanned", subtitle: matchedProd.name });
              setTimeout(() => setToastMessage(null), 2000);
            } else {
              setToastMessage({ title: "Scanner Error", subtitle: `Product not found: ${scan.barcode}` });
              setTimeout(() => setToastMessage(null), 3000);
            }
          });
        }
      } catch (e) {}
    };
    
    const interval = setInterval(pollScanner, 2000);
    return () => clearInterval(interval);
  }, [tenantSlug, storeId, products]);

  const categories = useMemo(() => {
    return [{ id: "All", name: "All" }, ...categoriesData];
  }, [categoriesData]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategoryId === "All" || p.categoryId === activeCategoryId;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategoryId, searchQuery]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (product.stock !== undefined && existing.qty + 1 > product.stock) {
          alert(`Cannot add more. Only ${product.stock} in stock.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      if (product.stock !== undefined && product.stock < 1) {
        alert('Item is out of stock.');
        return prev;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (delta > 0 && item.stock !== undefined && newQty > item.stock) {
          alert(`Cannot add more. Only ${item.stock} in stock.`);
          return item;
        }
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + ((item.price / 100) * item.qty), 0);
  }, [cart]);

  const discountValue = parseFloat(discountInput) || 0;
  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return subtotal * (Math.min(100, Math.max(0, discountValue)) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const tax = (subtotal - discountAmount) * 0;
  const total = subtotal - discountAmount + tax;

  const getCurrencySymbol = (code: string) => {
    const map: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", INR: "₹", BDT: "৳",
      AUD: "A$", CAD: "C$", SGD: "S$", AED: "د.إ", SAR: "﷼",
      JPY: "¥", CNY: "¥", CHF: "CHF", ZAR: "R", NZD: "NZ$",
      RUB: "₽", BRL: "R$", MXN: "Mex$", SEK: "kr", NOK: "kr",
      DKK: "kr", HKD: "HK$", TRY: "₺", KRW: "₩", IDR: "Rp",
      MYR: "RM", PHP: "₱", THB: "฿", VND: "₫", EGP: "E£",
      NGN: "₦", PKR: "₨", LKR: "Rs", KWD: "KD", QAR: "QR"
    };
    return map[code] || "$";
  };
  const currencySymbol = getCurrencySymbol(store?.globalCurrency);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/ecom/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          storeId: store?.id,
          posThemeColor,
          posUpiId
        })
      });
      setIsSettingsOpen(false);
    } catch(err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const deductStockAndRefresh = async () => {
    for (const item of cart) {
      if (item.stock !== undefined) {
        try {
          await fetch("/api/store", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: item.id,
              tenantSlug,
              stock: Math.max(0, item.stock - item.qty)
            })
          });
        } catch(e) {
          console.error("Failed to deduct stock for", item.name);
        }
      }
    }
    const prodRes = await fetch(`/api/ecom?tenant=${tenantSlug}&storeId=${storeId}`);
    if (prodRes.ok) {
      const pData = await prodRes.json();
      setProducts((pData.products || []).filter((p: any) => p.status === 'active' || p.status === undefined));
    }
  }

  const handleCheckout = () => {
    if (paymentMethod === 'qris') {
      setIsQRModalOpen(true);
      setPaymentSuccess(false);
    } else {
      processCheckout();
    }
  };

  
  const printReceiptIframe = (invNo?: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const itemsHtml = cart.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.name || 'Item'}</strong><br/>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${(item.price / 100).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${((item.price * item.qty) / 100).toFixed(2)}</td>
        </tr>
      `).join('');

    const receiptHtml = posPrinterType === 'a4' ? `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { 
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            color: #000;
            background: #fff;
          }
          .page {
            width: 210mm;
            padding: 20mm;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;}
          .header img { max-height: 80px; }
          .header-right { text-align: right; }
          .title { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0; color: #333; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px; }
          th { text-align: left; padding: 12px 10px; background: #f9fafb; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
          .totals { width: 250px; float: right; font-size: 14px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="page">
            <div class="header">
              <div>
                ${store?.brandLogo ? `<img loading="lazy" src="${store.brandLogo}" />` : `<h2>${store?.companyName || 'Store'}</h2>`}
                <p style="color:#666; font-size: 14px; margin-top:5px;">${store?.storeDescription || ""}</p>
              </div>
              <div class="header-right">
                <h1 class="title">INVOICE</h1>
                <p style="margin:0; font-size:14px; color:#666;">Date: ${new Date().toLocaleDateString()}</p>
                ${customerName ? `<p style="margin:0; font-size:14px; color:#666;">Customer: ${customerName} (${customerPhone})</p>` : ''}
                <p style="margin:0; font-size:14px; color:#666;">Receipt / Invoice #: ${invNo || Math.floor(Math.random() * 1000000)}</p>
                <p style="margin:0; font-size:14px; color:#666;">Payment: ${paymentMethod.toUpperCase()}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${currencySymbol}${subtotal.toFixed(2)}</span>
              </div>
              ${discountAmount > 0 ? `
              <div class="totals-row" style="color: #ef4444;">
                <span>Discount:</span>
                <span>-${currencySymbol}${discountAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>Total:</span>
                <span>${currencySymbol}${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div style="clear:both;"></div>
            <div style="margin-top: 50px; text-align:center; color:#888; font-size:12px;">
              <p>Thank you for your business!</p>
            </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            color: #000;
          }
          .thermal {
            width: ${posPaperSize === '58mm' ? '50mm' : '72mm'};
            margin: 0 auto;
            padding: 5mm;
            font-size: 12px;
          }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { max-height: 50px; margin-bottom: 10px; }
          .header h1 { margin: 0; font-size: 1.2em; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 2px 0; font-size: 0.9em; color: #444; }
          .divider { border-top: 1px dashed #000; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 5px 0; border-bottom: 1px solid #000; }
          td { padding: 8px 0; vertical-align: top; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
          .totals-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 1.1em; }
          .grand-total { font-weight: bold; font-size: 1.3em; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #000; }
          .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #555; }
        </style>
      </head>
      <body>
        <div class="thermal">
          <div class="header">
            ${store?.brandLogo ? `<img loading="lazy" src="${store.brandLogo}" />` : ''}
            <h1>${store?.companyName || "Store"}</h1>
            <p>${store?.storeDescription || ""}</p>
            <p>Receipt / Invoice #: ${invNo || Math.floor(Math.random() * 1000000)}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            ${customerName ? `<p>Customer: ${customerName}<br/>${customerPhone}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name}<br><small>${currencySymbol}${(item.price/100).toFixed(2)}</small></td>
                  <td class="text-center">${item.qty}</td>
                  <td class="text-right">${currencySymbol}${((item.price/100)*item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${currencySymbol}${subtotal.toFixed(2)}</span>
            </div>
            ${discountAmount > 0 ? `
            <div class="totals-row">
              <span>Discount:</span>
              <span>-${currencySymbol}${discountAmount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Total:</span>
              <span>${currencySymbol}${total.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="font-size: 0.9em; margin-top: 10px;">
              <span>Payment Method:</span>
              <span style="text-transform: uppercase;">${paymentMethod}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  const processCheckout = async () => {
    const invNo = "INV-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    printReceiptIframe(invNo);

    // Add customer to CRM
    let savedCustomerId = null;
    if (customerName && customerPhone) {
      try {
        const custRes = await fetch('/api/ecom/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantSlug, storeId, name: customerName, phone: customerPhone, email: customerEmail, source: "pos" })
        });
        const custData = await custRes.json();
        if (custData.customer) savedCustomerId = custData.customer.id;
      } catch (e) {}
    }

    // Save Order for Analytics
    try {
      await fetch('/api/ecom/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          storeId,
          buyerName: customerName || "Guest",
          buyerPhone: customerPhone || "",
          buyerEmail: customerEmail || "",
          customerId: selectedCustomerId || savedCustomerId,
          invoiceNo: invNo,
          amountCents: Math.round(total * 100),
          status: "paid",
          paymentMethod: paymentMethod,
          itemsJson: JSON.stringify(cart),
          productId: cart[0]?.id || "",
          source: "pos"
        })
      });
    } catch(e) {}
    
    // Deduct stock
    await deductStockAndRefresh();

    setCart([]);
    setDiscountInput("");
    setIsMobileCartOpen(false);
  };

  const handleVerifyQRSuccess = async () => {
    setPaymentSuccess(true);
    // Voice Announcement
    try {
      const amountText = store?.globalCurrency === 'INR' ? `${total.toFixed(2)} rupees` : `${total.toFixed(2)} ${store?.globalCurrency || 'dollars'}`;
      const msg = new SpeechSynthesisUtterance(`Payment of ${amountText} received successfully`);
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
        setToastMessage({title: "Customer Created", subtitle: `New Customer: ${data.customer.name} updated successfully.`});
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
        localStorage.setItem(`pos_mgr_${tenantSlug}`, JSON.stringify(data.manager));
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch(err) {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    const product = products.find(p => p.id === decodedText || p.id.includes(decodedText));
    if (product) {
      addToCart(product);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };



  const handlePosLogout = () => {
    setLoggedInManager(null);
    localStorage.removeItem(`pos_mgr_${tenantSlug}`);
  };

  if (!loggedInManager) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/50 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <LogOut className="w-8 h-8 text-white rotate-180" />
            </div>
            <h2 className="text-2xl font-black text-white">POS Terminal Login</h2>
            <p className="text-sm text-gray-400 mt-2">Enter your Store Manager credentials</p>
          </div>
          <form onSubmit={handlePosLogin} className="flex flex-col gap-5">
            {loginError && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold text-center">{loginError}</div>}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone or ID</label>
              <input 
                type="text" 
                value={loginPhone} 
                onChange={e => setLoginPhone(e.target.value)} 
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" 
                placeholder="Enter your phone or ID" 
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)} 
                className="bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" 
                placeholder="••••••••" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoggingIn ? "Authenticating..." : "Access Terminal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

const renderCartSidebar = (isMobile: boolean = false) => (
    <div className={`w-full h-full bg-white flex flex-col ${isMobile ? '' : 'shadow-[-10px_0_30px_rgba(0,0,0,0.02)] border-l border-gray-100 z-20'} no-print relative`}>
      <div className="px-5 md:px-6 py-5 flex items-center justify-between pb-4">
        <h2 className="font-black text-xl text-gray-800">Current Bill</h2>
        {isMobile ? (
          <button onClick={() => setIsMobileCartOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-50 p-2 rounded-full">
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button className="text-gray-400 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        )}
      </div>

      {/* Customer Selection UI */}
      <div className="px-5 md:px-6 pb-4 border-b border-gray-100">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Details</label>
        {!selectedCustomerId ? (
          <div className="space-y-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search phone or name..." 
                value={customerSearch}
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                  // Also set name and phone to help with auto-fill if they decide to add new
                  if (/^\d+$/.test(e.target.value)) setCustomerPhone(e.target.value);
                  else setCustomerName(e.target.value);
                }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              />
              {isCustomerDropdownOpen && customerSearch.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).map(c => (
                    <div 
                      key={c.id} 
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setCustomerName(c.name);
                        setCustomerPhone(c.phone);
                        setCustomerEmail(c.email || "");
                        setIsCustomerDropdownOpen(false);
                        setCustomerSearch("");
                      }}
                    >
                      <div>
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] uppercase">{c.name.charAt(0)}</div>
                          {c.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 ml-6">{c.phone}</div>
                      </div>
                    </div>
                  ))}
                  {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)).length === 0 && (
                    <div className="p-4 text-center">
                      <div className="text-sm text-gray-500 mb-2">No customers found</div>
                      <button 
                        onClick={() => {
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Create New Customer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Add</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input type="text" placeholder="Full Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                <input type="text" placeholder="Phone Number *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
              <button 
                onClick={handleCreateCustomer}
                disabled={isCreatingCustomer || !customerName.trim() || !customerPhone.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm"
              >
                {isCreatingCustomer ? (
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                )}
                Save Customer
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex justify-between items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-inner shadow-indigo-700/50">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-indigo-950">{customerName}</div>
                <div className="text-xs text-indigo-600/80 font-medium">{customerPhone}</div>
              </div>
            </div>
            <button 
              onClick={() => {
                setSelectedCustomerId(null);
                setCustomerName("");
                setCustomerPhone("");
                setCustomerEmail("");
              }}
              className="text-indigo-400 hover:text-rose-500 p-2 bg-white hover:bg-rose-50 rounded-xl shadow-sm transition-all z-10 relative"
              title="Change Customer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 md:px-6 flex flex-col gap-3 custom-scrollbar pb-4">
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-70">
            <ShoppingCart className="h-10 w-10 mb-3" />
            <p className="text-xs font-bold">Cart is empty</p>
            <p className="text-[10px] mt-1 text-center">Scan barcode or click items to add</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex gap-3 items-center group">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-50 shrink-0 shadow-sm border border-gray-100">
                {item.images && item.images[0] ? (
                  <img loading="lazy" src={item.images[0]} className="w-full h-full object-cover" />
                ) : item.image ? (
                  <img loading="lazy" src={item.image} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h4 className="font-extrabold text-xs text-gray-800 truncate">{item.name}</h4>
                <div className="text-gray-400 font-medium text-[9px] mt-0.5 truncate">{categoriesData.find(c => c.id === item.categoryId)?.name || "General"}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-black text-xs text-gray-900">{currencySymbol}{((item.price / 100) * item.qty).toFixed(2)}</span>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-1.5 py-0.5 border border-gray-100">
                  <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-red-500 p-0.5"><Minus className="h-2.5 w-2.5" strokeWidth={3} /></button>
                  <span className="text-[10px] font-black w-3 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-green-500 p-0.5"><Plus className="h-2.5 w-2.5" strokeWidth={3} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Billing Summary */}
      <div className="px-5 md:px-6 pb-6 pt-4 flex flex-col bg-white">
        <div className="border-t border-dashed border-gray-200 py-3 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
            <span>Subtotal</span>
            <span className="text-gray-800">{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
            <span className="flex items-center gap-1 cursor-pointer" onClick={() => setDiscountType(t => t === 'percentage' ? 'flat' : 'percentage')}>
              Discount {discountType === "percentage" ? "(%)" : `(${currencySymbol})`} <ChevronDown className="h-3 w-3" />
            </span>
            <div className="flex items-center gap-2">
              {discountAmount > 0 && <span className="text-red-500">-{currencySymbol}{discountAmount.toFixed(2)}</span>}
              <input 
                type="number" 
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                className="w-14 px-1.5 py-1 text-right bg-gray-50 border border-gray-200 rounded text-gray-800 focus:outline-none focus:border-red-300 font-mono text-xs"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-dashed border-gray-200 py-3 flex justify-between items-center">
          <span className="text-lg font-black text-gray-800">Total</span>
          <span className="text-xl font-black text-gray-900">{currencySymbol}{total.toFixed(2)}</span>
        </div>

        {/* Payment Method */}
        <div className="mb-4 mt-1">
          <h3 className="text-xs font-black text-gray-800 mb-2">Payment Method</h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setPaymentMethod("cash")}
              className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all
              ${paymentMethod === "cash" ? "shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-white" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}
              style={paymentMethod === "cash" ? {backgroundColor: posThemeColor, borderColor: posThemeColor} : {}}
            >
              <Wallet className="h-4 w-4" />
              <span className="text-[9px] font-bold">Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod("debit")}
              className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all
              ${paymentMethod === "debit" ? "shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-white" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}
              style={paymentMethod === "debit" ? {backgroundColor: posThemeColor, borderColor: posThemeColor} : {}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              <span className="text-[9px] font-bold">Debit</span>
            </button>
            <button 
              onClick={() => setPaymentMethod("qris")}
              className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all
              ${paymentMethod === "qris" ? "shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-white" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-500"}`}
              style={paymentMethod === "qris" ? {backgroundColor: posThemeColor, borderColor: posThemeColor} : {}}
            >
              <QrCode className="h-4 w-4" />
              <span className="text-[9px] font-bold">QR UPI</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0 || (!selectedCustomerId && (!customerName.trim() || !customerPhone.trim()))}
          className="w-full py-3.5 text-white font-black rounded-2xl text-sm transition-all shadow-[0_8px_24px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          style={{backgroundColor: posThemeColor}}
        >
          Add to Billing
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-[#Fdfbfb] text-gray-800 font-sans overflow-hidden flex-col md:flex-row relative w-full">
      
      {/* CSS for Printing */}
      

      {/* Sidebar Navigation (Hidden on mobile, bottom bar instead) */}
      <div className="hidden md:flex w-[72px] bg-white border-r border-gray-100 flex-col items-center py-6 gap-6 z-20 no-print relative shrink-0">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-black shadow-lg overflow-hidden shrink-0" style={{backgroundColor: posThemeColor}}>
          {store?.brandLogo ? <img loading="lazy" src={store.brandLogo} alt="Logo" className="w-full h-full object-cover" /> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>}
        </div>
        
        <div className="flex flex-col gap-4 w-full px-2 mt-2">
          <Link href={`/c/${tenantSlug}`} className="w-full aspect-square rounded-2xl flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)]" style={{backgroundColor: `${posThemeColor}15`, color: posThemeColor}}>
            <Home className="h-5 w-5" />
          </Link>
          <button className="w-full aspect-square rounded-2xl text-gray-400 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center transition-all">
            <List className="h-5 w-5" />
          </button>
          <button className="w-full aspect-square rounded-2xl text-gray-400 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center transition-all">
            <Clock className="h-5 w-5" />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="w-full aspect-square rounded-2xl text-gray-400 hover:text-gray-800 hover:bg-gray-50 flex items-center justify-center transition-all">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <button className="mt-auto w-full px-2">
          <div className="w-full aspect-square rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
            <LogOut className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* Main POS Interface */}
      <div className="flex-1 flex flex-col no-print bg-[#F9FAFC] relative z-10 w-full min-w-0">
        {/* Header */}
        <header className="px-3 md:px-6 pt-4 md:pt-6 pb-2 md:pb-3 flex items-center justify-between gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-2 md:hidden">
             <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-black shadow-sm overflow-hidden shrink-0" style={{backgroundColor: posThemeColor}}>
               {store?.brandLogo ? <img loading="lazy" src={store.brandLogo} alt="Logo" className="w-full h-full object-cover" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>}
             </div>
             <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 text-gray-400"><Settings className="h-5 w-5"/></button>
          </div>

          <div className="relative w-full md:max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search menu or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 outline-none shadow-sm transition-all"
            />
          </div>
          <div className="hidden md:flex items-center gap-2.5 bg-white pr-3 pl-1.5 py-1.5 rounded-full border border-gray-200 shadow-sm shrink-0">
            {loggedInManager?.avatar ? (
               <img loading="lazy" src={loggedInManager.avatar} alt="Cashier" className="h-8 w-8 rounded-full object-cover" />
            ) : (
               <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">{loggedInManager?.name?.[0] || 'A'}</div>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-800 leading-tight">{loggedInManager?.name || 'Cashier'}</span>
              <span className="text-[9px] text-gray-400 font-medium">POS Manager</span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-400 ml-1" />
          </div>
        </header>

        {/* Categories */}
        <div className="px-3 md:px-6 py-2 shrink-0">
          <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar snap-x">
            {categories.map((cat, idx) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`flex items-center justify-center shrink-0 h-10 px-4 rounded-xl transition-all cursor-pointer shadow-sm border snap-start font-bold text-[11px]
                    ${isActive ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  style={isActive ? {backgroundColor: posThemeColor, boxShadow: `0 4px 12px ${posThemeColor}40`} : {}}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid - DENSE LAYOUT */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-24 md:pb-6 custom-scrollbar relative w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col p-2 group cursor-pointer hover:shadow-md transition-all active:scale-[0.97]"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2 relative">
                  {product.images && product.images[0] ? (
                    <img loading="lazy" src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : product.image ? (
                    <img loading="lazy" src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px] font-medium">No Img</div>
                  )}
                  {product.stock !== undefined && (
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-[6px] text-[7px] font-black uppercase tracking-wider backdrop-blur-md ${product.stock > 0 ? 'bg-white/80 text-gray-800' : 'bg-red-500/90 text-white'}`}>
                      {product.stock > 0 ? `${product.stock}` : 'OUT'}
                    </div>
                  )}
                </div>
                
                <h3 className="font-extrabold text-[10px] md:text-[11px] text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                
                <div className="mt-auto flex items-center justify-between pt-1">
                  <div className="flex items-end gap-[1px]">
                    <span className="font-black text-xs md:text-sm text-gray-900">{currencySymbol}{(product.price / 100).toFixed(2)}</span>
                  </div>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-white shadow-sm" style={{backgroundColor: posThemeColor}}>
                    <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400">
              <span className="text-3xl mb-3">🍽️</span>
              <p className="font-bold text-xs">No items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile Cart */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 no-print">
        <button 
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full text-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-3.5 flex items-center justify-between active:scale-[0.98] transition-transform"
          style={{backgroundColor: '#1e293b'}}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#1e293b]">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="font-bold text-xs">View Bill</span>
          </div>
          <div className="font-black text-sm text-emerald-400">
            {currencySymbol}{total.toFixed(2)}
          </div>
        </button>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden md:flex w-[340px] lg:w-[380px] shrink-0">
        {renderCartSidebar(false)}
      </div>

      {/* Mobile Cart Bottom Sheet Drawer */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end no-print">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />
          <div className="relative bg-white rounded-t-3xl w-full h-[85vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
            {renderCartSidebar(true)}
          </div>
        </div>
      )}

      {/* POS Settings Sidebar Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end no-print">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
           <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-black text-lg text-gray-800">POS Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><X className="h-5 w-5"/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">POS Theme Color</h3>
                  <div className="flex gap-3 flex-wrap">
                    {['#FF4F64', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#000000'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => setPosThemeColor(color)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${posThemeColor === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : 'hover:scale-110'}`}
                        style={{backgroundColor: color}}
                      >
                        {posThemeColor === color && <CheckCircle className="h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Store UPI ID (For QR Payments)</h3>
                  <input 
                    type="text" 
                    value={posUpiId} 
                    onChange={e => setPosUpiId(e.target.value)}
                    placeholder="e.g. yourname@upi"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 font-medium leading-relaxed">
                    Enter your merchant or personal UPI ID. When you select QR UPI payment, a dynamic QR code will be generated for the exact bill amount. Customers can scan it with any UPI app (GPay, PhonePe, Paytm).
                  </p>
                </div>


                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 mt-5">Printer Type</h3>
                  <select 
                    value={posPrinterType} 
                    onChange={e => setPosPrinterType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 appearance-none"
                  >
                    <option value="thermal">Thermal Printer (Roll)</option>
                    <option value="inkjet_laser">Inkjet / Laser (A4/Letter)</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 mt-5">Paper Size</h3>
                  <select 
                    value={posPaperSize} 
                    onChange={e => setPosPaperSize(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 appearance-none"
                  >
                    {posPrinterType === 'thermal' ? (
                      <>
                        <option value="80mm">80mm Thermal Roll (Standard)</option>
                        <option value="58mm">58mm Thermal Roll (Mini)</option>
                      </>
                    ) : (
                      <>
                        <option value="a4">A4 Sheet</option>
                        <option value="letter">US Letter</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 mt-5">Voice Announcement Language</h3>
                  <select 
                    value={voiceLang} 
                    onChange={e => setVoiceLang(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 appearance-none"
                  >
                    <option value="none">Off (No Voice)</option>
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="bn-IN">Bengali</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 mt-5 border-t border-gray-100 pt-5 flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-500" /> Scanner App QR Code
                  </h3>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-center gap-3">
                    <p className="text-xs text-emerald-800 text-center font-medium">Scan this code from your mobile device to open the POS Barcode Scanner App. It connects to your current session.</p>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-200">
                      <img loading="lazy" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/b/${tenantSlug}/scanner?storeId=${storeId}` : '')}`} alt="Scanner QR" className="w-32 h-32" />
                    </div>
                    <a 
                      href={`/b/${tenantSlug}/scanner?storeId=${storeId}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 mt-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Open Scanner Link
                    </a>
                  </div>
                </div>
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save POS Settings'}
                </button>
                <button 
                  onClick={handlePosLogout}
                  className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout POS Manager
                </button>
             </div>
           </div>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !paymentSuccess && setIsQRModalOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl flex flex-col items-center overflow-hidden animate-in zoom-in-95 duration-300">
            {paymentSuccess ? (
              <div className="w-full py-16 flex flex-col items-center justify-center bg-emerald-50 text-emerald-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/30">
                  <CheckCircle className="h-10 w-10" strokeWidth={3} />
                </div>
                <h2 className="font-black text-2xl text-emerald-800 mb-1">Payment Received!</h2>
                <p className="font-bold text-emerald-600/80">{currencySymbol}{total.toFixed(2)}</p>
              </div>
            ) : (
              <>
                <div className="w-full bg-gray-900 px-6 py-5 flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-black text-lg">Scan & Pay</h3>
                    <p className="text-gray-400 text-[10px] font-medium">{posUpiId || 'demo@upi'}</p>
                  </div>
                  <button onClick={() => setIsQRModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-full"><X className="h-4 w-4"/></button>
                </div>
                
                <div className="py-8 px-6 flex flex-col items-center w-full">
                  <div className="bg-white p-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 mb-6">
                    <QRCodeSVG value={`upi://pay?pa=${posUpiId || 'demo@upi'}&pn=Store&am=${total.toFixed(2)}&cu=INR`} size={200} level="H" includeMargin={false} />
                  </div>
                  
                  <div className="text-center mb-8">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-black text-4xl text-gray-900 tracking-tight">{currencySymbol}{total.toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={handleVerifyQRSuccess}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Verify Payment Received
                  </button>
                  <p className="text-[9px] text-center text-gray-400 mt-4 px-4 leading-relaxed font-medium">
                    Since you are using direct UPI without a payment gateway API, please verify the payment on your phone or soundbox, then click verify.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden Receipt for Printing */}
      </div>
  );
}