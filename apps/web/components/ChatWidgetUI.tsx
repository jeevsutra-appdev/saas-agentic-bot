"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, Paperclip, ShoppingBag, Check, ChevronDown, StopCircle, X, Tag, ExternalLink, ShieldCheck, CreditCard, FileText, Download, MessageSquarePlus, Square } from "lucide-react";
import BookingCard from "./BookingCard";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      type="button" 
      onClick={handleCopy} 
      className="hover:text-indigo-400 text-gray-500 transition-colors cursor-pointer text-[10px] font-extrabold tracking-wider uppercase"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

const UrlPreview = ({ href, children }: { href: string, children: React.ReactNode }) => {
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!href.startsWith("http")) {
      setLoading(false);
      return;
    }
    fetch(`/api/meta?url=${encodeURIComponent(href)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error && (data.title || data.image)) setMeta(data);
      })
      .finally(() => setLoading(false));
  }, [href]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 text-indigo-400 opacity-60">
        <Loader2 className="w-3 h-3 animate-spin" /> Fetching preview...
      </span>
    );
  }

  if (meta) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block my-3 group no-underline">
        <div className="flex flex-col sm:flex-row overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all hover:bg-black/60 group-hover:border-indigo-500/30">
          {meta.image && (
            <div className="sm:w-32 h-24 sm:h-auto shrink-0 overflow-hidden relative bg-black/50">
              <img loading="lazy" src={meta.image} alt={meta.title || "Link Preview"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <div className="p-3.5 flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="text-[13.5px] font-bold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">{meta.title || href}</h4>
            {meta.description && <p className="text-[11.5px] text-gray-400 line-clamp-2 leading-snug">{meta.description}</p>}
            <div className="flex items-center gap-1.5 mt-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest truncate">{new URL(href).hostname}</span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 font-semibold transition-colors break-all">
      {children}
      <ExternalLink className="w-3 h-3 inline-block shrink-0" />
    </a>
  );
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  fileName?: string;
  isVisionActive?: boolean;
  timestamp?: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  compareAtPrice?: number;
  categoryId?: string;
  currency?: string;
  tenantSlug?: string;
}

interface ChatWidgetUIProps {
  tenantSlug: string;
  agentConfig: any;
  isPreviewMode?: boolean;
  onUsageUpdate?: (usage: any) => void;
  isEmbed?: boolean;
  overrideAgentId?: string;
}

export default function ChatWidgetUI({ tenantSlug, agentConfig, isPreviewMode = false, onUsageUpdate, isEmbed = false, overrideAgentId: propAgentId }: ChatWidgetUIProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [selectedProductForPopup, setSelectedProductForPopup] = useState<Product | null>(null);
  
  // Persistent Memory State
  const [sessionId, setSessionId] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [isMemoryLoaded, setIsMemoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // AbortController ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Premium In-Chat Credit Card Checkout states
  const [storefront, setStorefront] = useState<any>(null);
  const [activeCheckout, setActiveCheckout] = useState<{ id: string; name: string; price: number; isDigital?: boolean } | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<"card" | "cod">("card");
  const [checkoutCardName, setCheckoutCardName] = useState("");
  const [checkoutCardNumber, setCheckoutCardNumber] = useState("");
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState("");
  const [checkoutCardCvc, setCheckoutCardCvc] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");

  // Premium In-Chat Booking form states
  const [bookingDate, setBookingDate] = useState("Mon, May 25");
  const [bookingSlot, setBookingSlot] = useState("");
  const [bookingClientName, setBookingClientName] = useState("");
  const [bookingClientEmail, setBookingClientEmail] = useState("");
  const [bookingStep, setBookingStep] = useState<"slot" | "details" | "processing" | "success">("slot");

  // Premium Lead Collection states
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCountryCode, setLeadCountryCode] = useState("+1");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Currency Engine State
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1, INR: 83.5, GBP: 0.79, EUR: 0.92, AUD: 1.5, AED: 3.67 });
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [displayCurrencySymbol, setDisplayCurrencySymbol] = useState("$");

  useEffect(() => {
    // Force global currency based on store settings
    const baseCurrency = storefront?.globalCurrency || "USD";
    const getCurrencySymbol = (code: string) => {
      const map: Record<string, string> = {
        USD: "$", EUR: "€", GBP: "£", INR: "₹", BDT: "৳", AUD: "A$", CAD: "C$", SGD: "S$", AED: "د.إ"
      };
      return map[code] || "$";
    };
    setDisplayCurrency(baseCurrency);
    setDisplayCurrencySymbol(getCurrencySymbol(baseCurrency));
  }, [storefront?.globalCurrency]);

  useEffect(() => {
    fetch("/api/currency")
      .then(r => r.json())
      .then(data => { if (data.success && data.rates) setExchangeRates(data.rates); })
      .catch(() => {});
  }, []);

  const formatPrice = (cents: number) => {
    const baseCurrency = storefront?.globalCurrency || "USD";
    if (baseCurrency === displayCurrency) return `${displayCurrencySymbol}${(cents / 100).toFixed(2)}`;
    
    const baseRate = exchangeRates[baseCurrency] || 1;
    const targetRate = exchangeRates[displayCurrency] || 1;
    const priceInUSD = (cents / 100) / baseRate;
    const finalPrice = priceInUSD * targetRate;
    return `${displayCurrencySymbol}${finalPrice.toFixed(2)}`;
  };

  // --- PERSISTENT MEMORY LOGIC ---
  useEffect(() => {
    let currentSession = localStorage.getItem("aether_session_id");
    if (!currentSession) {
      currentSession = crypto.randomUUID();
      localStorage.setItem("aether_session_id", currentSession);
    }
    setSessionId(currentSession);

    const savedChatId = localStorage.getItem(`aether_last_chat_${agentConfig?.id}`);
    const currentChatId = savedChatId || crypto.randomUUID();
    setChatId(currentChatId);

    const savedLeadState = localStorage.getItem(`aether_lead_${currentChatId}`);
    if (savedLeadState === "true") {
      setHasSubmittedLead(true);
    }

    if (savedChatId) {
      const savedMsgs = localStorage.getItem(`aether_messages_${currentChatId}`);
      if (savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs);
          const hydrated = parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : undefined
          }));
          setMessages(hydrated);
          setIsMemoryLoaded(true);
          return;
        } catch (e) {
          console.error("Failed to parse chat memory", e);
        }
      }
    }
    
    // If no memory was loaded, set the initial greeting
    if (agentConfig?.name) {
      setMessages([{
        role: "assistant",
        content: `Hi there! 👋 I'm **${agentConfig.name}**. How can I help you today?`,
        timestamp: new Date()
      }]);
    }
    setIsMemoryLoaded(true);
  }, [agentConfig?.id, agentConfig?.name]);

  useEffect(() => {
    // Save messages whenever they change
    if (isMemoryLoaded && chatId && messages.length > 0) {
      localStorage.setItem(`aether_last_chat_${agentConfig?.id}`, chatId);
      localStorage.setItem(`aether_messages_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId, isMemoryLoaded, agentConfig?.id]);

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();
    
    setChatId(newChatId);
    setSessionId(newSessionId);
    setHasSubmittedLead(false);
    
    // Clear lead submission in memory
    localStorage.removeItem(`aether_lead_${newChatId}`);
    
    // Save to local storage
    localStorage.setItem("aether_session_id", newSessionId);
    localStorage.setItem(`aether_last_chat_${agentConfig?.id}`, newChatId);
    
    // Clear and reset messages with new greetings
    setMessages([{
      role: "assistant",
      content: `Hi there! 👋 I'm **${agentConfig?.name}**. How can I help you today?`,
      timestamp: new Date()
    }]);
    
    setInput("");
  };

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/ecom?tenant=${tenantSlug}`)
      .then(r => r.json())
      .then(data => { 
        if (data.success) {
          setProducts(data.products || []); 
          setCategories(data.categories || []);
          setStorefront(data.storefront || null);
        }
      })
      .catch(() => {});
  }, [tenantSlug]);

  const scrollToBottom = (isSmooth = true) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: isSmooth ? "smooth" : "auto"
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isSending]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  // ─── STOP GENERATION ───
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    setIsSending(false);
    // Add a stopped indicator message
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "⏹ Generation stopped.",
      timestamp: new Date()
    }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1024;
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setUploadedFile(compressedDataUrl);
            setIsVisionMode(true);
          } else {
            // Fallback if canvas context fails
            setUploadedFile(ev.target?.result as string);
            setIsVisionMode(true);
          }
        };
        img.onerror = () => {
          // Fallback if image loading fails
          setUploadedFile(ev.target?.result as string);
          setIsVisionMode(true);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedFile(ev.target?.result as string);
        setIsVisionMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || (!leadPhone && !leadEmail)) return;
    setIsSubmittingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          name: leadName,
          phone: leadPhone,
          countryCode: leadCountryCode,
          email: leadEmail,
          type: "ecom",
          details: "Captured via ChatWidget"
        })
      });
      if (res.ok) {
        setHasSubmittedLead(true);
        localStorage.setItem(`aether_lead_${chatId}`, "true");
      }
    } catch (err) {
      console.error("Lead capture failed", err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleCheckout = async (productId: string) => {
    if (isPreviewMode) { alert(`[Preview] Checkout: ${productId}`); return; }
    setIsCheckingOut(productId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: productId, tenantSlug, region: "US" })
      });
      const data = await res.json();
      if (res.ok && data.success) alert(`Redirecting to payment...\n${data.redirectUrl}`);
    } catch { alert("Checkout failed."); }
    finally { setIsCheckingOut(null); }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string, overrideAgentId?: string) => {
    e?.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isSending || !agentConfig) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      image: uploadedFile || undefined,
      fileName: uploadedFileName || undefined,
      isVisionActive: isVisionMode,
      timestamp: new Date()
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!overrideInput) setInput("");
    setUploadedFile(null);
    setUploadedFileName("");
    setIsVisionMode(false);
    setIsSending(true);

    if (isPreviewMode) {
      previewTimeoutRef.current = setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "✨ **Preview Mode** — Save and deploy this agent to activate real AI responses with your configured model and skills!",
          timestamp: new Date()
        }]);
        setIsSending(false);
        previewTimeoutRef.current = null;
      }, 1200);
      return;
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          provider: agentConfig.provider || "openrouter",
          model: agentConfig.mainModel || agentConfig.model || "openrouter/free",
          messages: updated,
          tenantSlug,
          agentId: overrideAgentId || propAgentId || agentConfig?.id,
          useOwnModels: agentConfig.useOwnModels,
          simulateNonAI: agentConfig.simulateNonAI,
          leadData: hasSubmittedLead ? {
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            countryCode: leadCountryCode
          } : undefined
        })
      });

      if (!response.ok) {
        let errText = "Failed to get a response.";
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {}
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errText}`, timestamp: new Date() }]);
        return;
      }

      // Add a placeholder empty assistant message to write the stream into
      setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      if (reader) {
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            accumulatedText += chunk;
            
            // Dynamically update the last message text in real-time
            setMessages(prev => {
              const next = [...prev];
              if (next.length > 0) {
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  content: accumulatedText
                };
              }
              return next;
            });
          }
        }
      } else {
        const text = await response.text();
        setMessages(prev => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: text
            };
          }
          return next;
        });
        accumulatedText = text;
      }

      // Parse metadata headers sent by the streaming server
      const providerHeader = response.headers.get("X-Provider") || "";
      const modelHeader = response.headers.get("X-Model") || "";
      const skillTriggeredHeader = response.headers.get("X-Skill-Triggered") === "true";
      const skillNameHeader = response.headers.get("X-Skill-Name") || "";
      const rawSkillOutput = response.headers.get("X-Skill-Output") || "";
      const skillOutputHeader = decodeURIComponent(rawSkillOutput);
      
      if (onUsageUpdate) {
        onUsageUpdate({
          prompt_tokens: Math.ceil(textToSend.length / 4) + 15,
          completion_tokens: Math.ceil(accumulatedText.length / 4),
          skillTriggered: skillTriggeredHeader,
          skillName: skillNameHeader,
          skillOutput: skillOutputHeader,
          provider: providerHeader,
          model: modelHeader
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection failed. Please try again.", timestamp: new Date() }]);
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const MiniTimer = () => {
    const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);
    useEffect(() => {
      if (timeLeft <= 0) return;
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(t);
    }, [timeLeft]);
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return (
      <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] ml-2">
        <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
        <span className="text-[9px] font-mono font-bold text-amber-400 tabular-nums tracking-tighter">
          {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const ScarcityTimer = ({ timeStr }: { timeStr: string }) => {
    const totalTime = parseInt(timeStr.split(":")[0] || "0") * 60 + parseInt(timeStr.split(":")[1] || "0");
    const [timeLeft, setTimeLeft] = useState(() => totalTime);

    useEffect(() => {
      if (timeLeft <= 0) return;
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(t);
    }, [timeLeft]);

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="my-6 p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#0a0a0c] to-[#1a1400] backdrop-blur-2xl shadow-[0_15px_50px_rgba(245,158,11,0.15)] relative overflow-hidden group flex flex-col items-center justify-center text-center mx-auto ring-1 ring-white/10"
      >
        {/* Animated Metallic Glow Effects */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite] pointer-events-none"></div>
        
        {/* Shimmer sweep */}
        <div className="absolute -inset-full w-[300%] bg-gradient-to-r from-transparent via-amber-200/5 to-transparent skew-x-12 animate-[shimmer_3s_infinite] pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-5 relative z-10">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,1)]"></div>
          <span className="text-[11px] uppercase font-black tracking-[0.3em] bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">Exclusive Offer Ends In</span>
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] border border-amber-500/40 bg-gradient-to-b from-[#2a2200] to-[#0a0a0c] backdrop-blur-xl flex items-center justify-center shadow-[inset_0_2px_20px_rgba(251,191,36,0.15),0_8px_20px_rgba(0,0,0,0.6)] ring-1 ring-amber-500/20 relative overflow-hidden">
               <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              <span className="font-sans font-black text-4xl sm:text-5xl tracking-tighter tabular-nums bg-gradient-to-b from-[#FFFBE6] via-[#FFD666] to-[#D46B08] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(251,191,36,0.4)]">
                {m.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-500/60 mt-3 tracking-[0.25em]">Minutes</span>
          </div>

          <div className="text-amber-500/40 font-black text-3xl sm:text-4xl pb-6 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">:</div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] border border-amber-500/40 bg-gradient-to-b from-[#2a2200] to-[#0a0a0c] backdrop-blur-xl flex items-center justify-center shadow-[inset_0_2px_20px_rgba(251,191,36,0.15),0_8px_20px_rgba(0,0,0,0.6)] ring-1 ring-amber-500/20 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
              <span className="font-sans font-black text-4xl sm:text-5xl tracking-tighter tabular-nums bg-gradient-to-b from-[#FFFBE6] via-[#FFD666] to-[#D46B08] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(251,191,36,0.4)]">
                {s.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-500/60 mt-3 tracking-[0.25em]">Seconds</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- MULTI-AGENT SWARM ORCHESTRATION ---
  useEffect(() => {
    if (!isSending && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content) {
        const delegateMatch = lastMsg.content.match(/\[DELEGATE:([a-zA-Z0-9_-]+):([\s\S]*?)\]/i);
        if (delegateMatch) {
          const targetAgentId = delegateMatch[1];
          const delegatedTask = delegateMatch[2];
          
          // Trigger the next agent after a short visual delay
          setTimeout(() => {
             handleSubmit(undefined, `[SYSTEM DELEGATION HANDOFF]\nTask: ${delegatedTask}`, targetAgentId);
          }, 1200);
        }
      }
    }
  }, [isSending, messages]);

  const renderContent = (content: string, isStreaming = false) => {
    const template = agentConfig?.templateStyle || "glass";
    const isLightBubble = ["ios", "minimal", "playful", "holographic"].includes(template);

    // Append a blinking cursor block character if we are currently streaming
    const contentToParse = isStreaming ? content + "▍" : content;
    const parts = contentToParse.split(/(\[CHECKOUT:[^\]]+\]|\[PRODUCTS:[^\]]+\]|\[BUY:[^\]]+\]|\[CATEGORY:[^\]]+\]|\[BOOKING\]|\[BOOK:[^\]]*\]|\[TIMER:[^\]]+\]|\[GENERATE_CATALOG_PDF:[^\]]+\]|\[SHARE_PRELOADED_PDF:[^\]]+\]|\[DELEGATE:[^\]]+\]|\[FILE:[^\]]+\])/g);
    
    return parts.map((part, i) => {
      if (part.startsWith("[FILE:") && part.endsWith("]")) {
        const fileUrl = part.substring(6, part.length - 1);
        const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
        return (
          <div key={i} className="my-3 p-4 rounded-[16px] bg-[#060810]/60 border border-white/10 flex items-center gap-4 shadow-xl backdrop-blur-md hover:bg-[#060810]/80 transition-all hover:border-indigo-500/40 group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
              {isPdf ? <FileText className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" /> : <Paperclip className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-[13.5px] truncate mb-0.5">{fileUrl.split("/").pop() || "Document"}</h4>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{isPdf ? "PDF Document" : "File Attachment"}</p>
            </div>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition-colors">
              <Download className="w-4 h-4" />
            </a>
          </div>
        );
      }
      if (part.startsWith("[DELEGATE:") && part.endsWith("]")) {
        const [, targetId] = part.split(":");
        return (
          <div key={i} className="my-2 p-3 rounded-lg bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center gap-2 text-indigo-300 text-xs font-bold animate-pulse shadow-inner">
            <Loader2 className="w-4 h-4 animate-spin" />
            Swarm Orchestration: Delegating task to Agent [{targetId}]...
          </div>
        );
      }
      if (part.startsWith("[GENERATE_CATALOG_PDF:") && part.endsWith("]")) {
        const ids = part.substring(22, part.length - 1);
        return (
          <div key={i} className="my-4">
            <a 
              href={`/api/pdf/catalog?tenant=${tenantSlug}&products=${ids}&agentName=${encodeURIComponent(agentConfig?.name || "Aether AI")}`} 
              target="_blank"
              download
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_10px_30px_rgba(225,29,72,0.25)] transition-all hover:scale-[1.02] group"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition" />
              Download Generated PDF
              <Download className="w-4 h-4 ml-1 opacity-70" />
            </a>
          </div>
        );
      }
      if (part.startsWith("[SHARE_PRELOADED_PDF:") && part.endsWith("]")) {
        const payload = part.substring(21, part.length - 1);
        const [docName, docUrl] = payload.split("|");
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4 rounded-[20px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#111] to-[#000] shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col relative max-w-[320px] mx-auto w-full group"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            <div className="p-5 relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-7 h-7 text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-white text-[16px] tracking-tight mb-1 px-2">{docName || "Requested Document"}</h4>
              <p className="text-[11px] text-gray-400 mb-5">Premium Static Document</p>
              
              <a 
                href={docUrl || "#"} 
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02]"
              >
                View & Download
                <Download className="w-4 h-4 ml-1 opacity-70" />
              </a>
            </div>
            
            <div className="bg-[#050505] p-3 flex justify-center items-center gap-2 border-t border-white/5">
               <Sparkles className="w-3 h-3 text-emerald-400" />
               <span className="text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest font-bold">Available Instantly</span>
            </div>
          </motion.div>
        );
      }
      
      if (part.startsWith("[CHECKOUT:") && part.endsWith("]")) {
        const payload = part.substring(10, part.length - 1);
        const [amountStr, itemsStr] = payload.split(":");
        const amount = parseInt(amountStr, 10);
        
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="my-4 rounded-[24px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#111] to-[#000] shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col relative max-w-[320px] mx-auto w-full"
          >
            {/* Apple Pay / Premium Native Style Glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <div className="p-6 pb-4 relative z-10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-white text-[18px] tracking-tight mb-1">Aether Pay</h4>
              <p className="text-[12px] text-gray-400 opacity-80 leading-snug px-4">{itemsStr ? itemsStr.replace(/\+/g, ' + ') : 'Custom Order'}</p>
            </div>
            
            <div className="px-6 py-4 flex flex-col items-center justify-center bg-white/[0.03] relative z-10 border-t border-b border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</span>
              <div className="flex items-start">
                <span className="text-gray-400 text-sm mt-1 mr-1">{displayCurrencySymbol}</span>
                <span className="font-sans text-white font-black text-[36px] tracking-tighter leading-none">{formatPrice(amount).replace(displayCurrencySymbol, '')}</span>
              </div>
            </div>
            
            <div className="p-5 relative z-10 bg-black/40">
              <button 
                onClick={() => {
                  setActiveCheckout({
                    id: "custom_checkout",
                    name: itemsStr ? itemsStr.replace(/\+/g, ' + ') : "Custom Order",
                    price: amount,
                    isDigital: false
                  });
                  setCheckoutStep("form");
                }}
                className="w-full h-12 rounded-full bg-white text-black text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <CreditCard className="w-4 h-4 fill-black/10" />
                Pay Securely
              </button>
            </div>
          </motion.div>
        );
      }

      if ((part.startsWith("[PRODUCTS:") || part.startsWith("[BUY:")) && part.endsWith("]")) {
        const idString = part.startsWith("[PRODUCTS:") 
          ? part.substring(10, part.length - 1) 
          : part.substring(5, part.length - 1);
          
        const parsedProducts = idString.split(",").map(s => {
          const parts = s.trim().split(":");
          return {
            id: parts[0].toLowerCase(),
            discountedPrice: parts[1] ? parseInt(parts[1], 10) : null,
            couponCode: parts[2] ? parts[2].toUpperCase() : null
          };
        });
        
        let matchedProducts = [];
        if (parsedProducts.some(p => p.id === "all")) {
          matchedProducts = products.map(p => ({...p}));
        } else {
          matchedProducts = products.filter(p => parsedProducts.some(parsed => parsed.id === p.id.toLowerCase() || parsed.id === p.name.toLowerCase())).map(p => {
             const override = parsedProducts.find(parsed => parsed.id === p.id.toLowerCase() || parsed.id === p.name.toLowerCase());
             if (override && override.discountedPrice) {
               return { ...p, compareAtPrice: p.price, price: override.discountedPrice, couponCode: override.couponCode };
             }
             return { ...p };
          });
        }
        
        if (matchedProducts.length === 0) return <span key={i} className="text-gray-500 italic text-[11px] block my-2 border border-white/5 bg-white/5 p-2 rounded-lg">No matching products found in the catalog.</span>;
        
        const relatedProducts = products.filter(p => !matchedProducts.some(m => m.id === p.id)).slice(0, 6);
        const duplicatedRelated = [...relatedProducts, ...relatedProducts]; // for seamless loop
        
        return (
          <div key={i} className="my-3 -mx-2 flex flex-col gap-6">
            <div className="px-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {matchedProducts.map((product, idx) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                  className="w-full rounded-[16px] overflow-hidden border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.5)] group transition-all duration-300 flex flex-col hover:shadow-[0_12px_35px_rgba(99,102,241,0.15)] relative"
                >
                  {product.image ? (
                     <div className="relative h-32 sm:h-40 lg:h-48 w-full overflow-hidden shrink-0">
                       <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
                     </div>
                  ) : (
                     <div className="h-32 sm:h-40 lg:h-48 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center font-bold text-gray-600 text-xl tracking-widest uppercase shrink-0 border-b border-white/5 relative">
                       {product.name.substring(0, 3)}
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent"></div>
                     </div>
                  )}
                  <div className="px-3 pb-3 pt-2 flex flex-col flex-grow relative z-10">
                    <div className="absolute -top-3 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 shadow-lg">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/90">
                        {product.compareAtPrice && product.compareAtPrice > product.price ? "Special Offer" : (idx % 2 === 0 ? "Trending" : "Best Seller")}
                      </span>
                    </div>
                    {product.couponCode && (
                      <div className="absolute -top-3 right-2 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm z-20">
                        {product.couponCode}
                      </div>
                    )}
                    <h4 className="font-black text-white/95 text-[13px] sm:text-[14px] leading-snug line-clamp-2 mb-1 mt-1 drop-shadow-md">{product.name}</h4>
                    <div className="mt-auto pt-2 flex flex-col gap-2">
                      <div className="flex flex-col gap-0.5">
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                           <span className="text-[10px] text-gray-400 line-through font-medium">{formatPrice(product.compareAtPrice)}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-sans text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 font-black text-[17px] tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">{formatPrice(product.price)}</span>
                          <MiniTimer />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => window.open(`/b/${tenantSlug}/p/${product.id}`, '_blank')}
                          className="flex-[0.3] h-8 rounded-lg text-white bg-white/10 hover:bg-white/20 text-[10px] font-bold flex items-center justify-center transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            setActiveCheckout({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              isDigital: product.isDigital
                            });
                            setCheckoutStep("form");
                          }}
                          className="flex-[0.7] h-8 rounded-lg text-black text-[11px] uppercase tracking-wider font-black flex items-center justify-center gap-1 transition-all bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] shadow-[0_4px_14px_rgba(234,179,8,0.4)] border border-yellow-300/50 hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(234,179,8,0.6)] active:scale-[0.97]"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Related Products Auto-Looping Marquee */}
            {relatedProducts.length > 0 && (
              <div className="mt-2 w-full overflow-hidden relative">
                <div className="px-4 mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Related Products</h5>
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes smooth-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-smooth-marquee {
                    animation: smooth-marquee 25s linear infinite;
                  }
                  .animate-smooth-marquee:hover {
                    animation-play-state: paused;
                  }
                  .marquee-mask {
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                  }
                `}} />
                <div className="marquee-mask w-full">
                  <div className="flex gap-3 w-max animate-smooth-marquee px-4">
                    {duplicatedRelated.map((product, ridx) => (
                      <div 
                        key={`${product.id}-${ridx}`} 
                        onClick={() => window.open(`/b/${tenantSlug}/p/${product.id}`, '_blank')}
                        className="w-[180px] shrink-0 bg-[#060810]/80 rounded-[14px] border border-white/5 shadow-lg overflow-hidden flex items-center p-2 gap-3 cursor-pointer hover:bg-white/5 transition-colors group"
                      >
                        {product.image ? (
                          <img loading="lazy" src={product.image} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">IMG</div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h6 className="text-[11px] font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{product.name}</h6>
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      
      if (part.startsWith("[CATEGORY:") && part.endsWith("]")) {
        const catId = part.substring(10, part.length - 1).toLowerCase();
        let matchedCats = [];
        if (catId === "all") matchedCats = categories;
        else matchedCats = categories.filter(c => c.id.toLowerCase() === catId);
        
        if (matchedCats.length === 0) return null;
        
        return (
          <div key={i} className="flex flex-col gap-2 my-3">
            {matchedCats.map((cat, idx) => (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="rounded-xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-[#0f1225] to-[#1a1f3c] shadow-lg flex items-center p-3 gap-3 hover:border-indigo-500/50 transition-colors cursor-pointer group"
                onClick={() => handleSubmit(undefined, `Show me all products in the ${cat.name} category.`)}
              >
                {cat.image ? (
                   <img loading="lazy" src={cat.image} alt={cat.name} className="h-12 w-12 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform" />
                ) : (
                   <div className="h-12 w-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs shadow-inner">
                     {cat.name.substring(0, 2).toUpperCase()}
                   </div>
                )}
                <div className="flex-grow">
                   <h4 className="font-bold text-indigo-100 text-[13px]">{cat.name}</h4>
                   <p className="text-[10px] text-indigo-300/60 line-clamp-1">{cat.description || "Browse collection"}</p>
                </div>
                <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                   <span className="text-xs font-bold">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        );
      }
      
      if ((part.startsWith("[BOOK:") || part === "[BOOK]") && part.endsWith("]")) {
        const inner = part.slice(6, part.length - 1).trim();
        const serviceId = inner || undefined;
        return (
          <BookingCard
            key={i}
            tenantSlug={tenantSlug}
            serviceId={serviceId}
          />
        );
      }

      if (part.startsWith("[BOOKING]")) {
        const availableSlots = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"];
        const availableDates = ["Mon, May 25", "Tue, May 26", "Wed, May 27", "Thu, May 28"];
        
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="my-4 rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-[#0c0f24] to-[#121636] shadow-[0_8px_30px_rgba(99,102,241,0.2)] p-5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">Live Appointment Mesh</span>
            </div>

            <AnimatePresence mode="wait">
              {bookingStep === "slot" && (
                <motion.div
                  key="booking-slot"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col gap-4"
                >
                  <div>
                    <h4 className="font-extrabold text-white text-[15px] leading-tight mb-1">Schedule a Call</h4>
                    <p className="text-[11px] text-gray-400">Select a date and an available slot below:</p>
                  </div>

                  {/* Date Slider */}
                  <div className="flex gap-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {availableDates.map((d) => (
                      <button
                        key={d}
                        onClick={() => setBookingDate(d)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[10.5px] font-bold border transition-all ${
                          bookingDate === d
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setBookingSlot(slot);
                          setBookingStep("details");
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/40 text-xs font-bold text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {bookingStep === "details" && (
                <motion.div
                  key="booking-details"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-[14px]">Provide Contact Info</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{bookingDate} @ {bookingSlot}</p>
                    </div>
                    <button
                      onClick={() => setBookingStep("slot")}
                      className="text-[10px] text-indigo-400 font-bold hover:underline"
                    >
                      Change Slot
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-1">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={bookingClientName}
                      onChange={(e) => setBookingClientName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-gray-600 font-medium"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={bookingClientEmail}
                      onChange={(e) => setBookingClientEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-gray-600 font-medium"
                    />
                  </div>

                  <button
                    disabled={!bookingClientName || !bookingClientEmail}
                    onClick={() => {
                      setBookingStep("processing");
                      setTimeout(() => {
                        setBookingStep("success");
                        setTimeout(() => {
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: `📅 **Booking Confirmed!**\n\nYour appointment is confirmed for **${bookingDate} at ${bookingSlot}**.\n\nA calendar invite (.ics) has been dispatched to **${bookingClientEmail}** for your records. We look forward to talking with you soon!`,
                            timestamp: new Date()
                          }]);
                          setBookingStep("slot");
                          setBookingClientName("");
                          setBookingClientEmail("");
                          setBookingSlot("");
                        }, 2500);
                      }, 2000);
                    }}
                    className="w-full mt-1.5 py-3 rounded-xl text-[#060810] text-[12px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:pointer-events-none hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, #a5b4fc, #6366f1)` }}
                  >
                    <Check className="w-4 h-4" />
                    Confirm Booking
                  </button>
                </motion.div>
              )}

              {bookingStep === "processing" && (
                <motion.div
                  key="booking-processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-8 flex flex-col items-center justify-center text-center relative z-10"
                >
                  <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Securing Calendar Slot</h4>
                  <p className="text-[10px] text-gray-400">Verifying scheduler database availability...</p>
                </motion.div>
              )}

              {bookingStep === "success" && (
                <motion.div
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-6 flex flex-col items-center justify-center text-center relative z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Appointment Saved!</h4>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Confirmed via Aether Calendar</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      }

      if (part.startsWith("[TIMER:") && part.endsWith("]")) {
        const timeStr = part.substring(7, part.length - 1);
        return <ScarcityTimer key={i} timeStr={timeStr} />;
      }
      
      if (part.trim() !== "") {
        return (
          <div key={i} className={`markdown-body leading-relaxed max-w-full text-[13px] ${isLightBubble ? "text-gray-800" : "text-gray-300"}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ children }) => (
                  <strong className={`${isLightBubble ? "text-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600" : "text-indigo-300 bg-gradient-to-r from-indigo-300 to-purple-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.15)]"} font-extrabold bg-clip-text text-transparent`}>
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className={`border-l-4 border-indigo-500 ${isLightBubble ? "bg-indigo-50 text-gray-700" : "bg-indigo-950/20 text-gray-300"} px-4 py-2 rounded-r-xl my-3 italic`}>
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => href ? <UrlPreview href={href}>{children}</UrlPreview> : null,
                table: ({ children }) => (
                  <div className={`overflow-x-auto my-4 rounded-xl border ${isLightBubble ? "border-gray-200 bg-white/50" : "border-white/10 bg-white/[0.02]"} backdrop-blur-md shadow-2xl max-w-full`}>
                    <table className={`w-full text-left border-collapse text-[13px] ${isLightBubble ? "text-gray-700" : "text-gray-300"}`}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className={`${isLightBubble ? "bg-gray-50 text-gray-900 border-gray-200" : "bg-white/[0.04] text-white border-white/10"} border-b font-bold`}>{children}</thead>,
                tbody: ({ children }) => <tbody className={`divide-y ${isLightBubble ? "divide-gray-100" : "divide-white/5"}`}>{children}</tbody>,
                tr: ({ children }) => <tr className={`${isLightBubble ? "hover:bg-gray-50" : "hover:bg-white/[0.02]"} transition-colors`}>{children}</tr>,
                th: ({ children }) => <th className={`px-4 py-3 font-semibold ${isLightBubble ? "text-gray-900" : "text-white/90"}`}>{children}</th>,
                td: ({ children }) => <td className={`px-4 py-3 ${isLightBubble ? "text-gray-700" : "text-gray-300"} font-medium`}>{children}</td>,
                ul: ({ children }) => <ul className={`list-none pl-1 mb-4 space-y-2 ${isLightBubble ? "text-gray-800" : "text-gray-200"}`}>{children}</ul>,
                ol: ({ children }) => <ol className={`list-decimal pl-6 mb-4 space-y-2 ${isLightBubble ? "text-gray-800" : "text-gray-200"} marker:text-indigo-400 marker:font-bold`}>{children}</ol>,
                li: ({ children }) => (
                  <li className="relative pl-6 leading-relaxed">
                    <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_6px_rgba(129,140,248,0.5)]"></span>
                    {children}
                  </li>
                ),
                h1: ({ children }) => <h1 className={`text-[20px] font-black mt-6 mb-3 tracking-tight bg-gradient-to-r ${isLightBubble ? "from-gray-900 to-gray-600" : "from-white to-gray-400"} bg-clip-text text-transparent`}>{children}</h1>,
                h2: ({ children }) => <h2 className={`text-[17px] font-extrabold mt-5 mb-2.5 tracking-tight bg-gradient-to-r ${isLightBubble ? "from-gray-900 to-gray-600 border-gray-200" : "from-white to-gray-300 border-white/10"} bg-clip-text text-transparent border-b pb-1`}>{children}</h2>,
                h3: ({ children }) => <h3 className={`text-[15px] font-bold mt-4 mb-2 tracking-tight ${isLightBubble ? "text-indigo-600 drop-shadow-sm" : "text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.2)]"}`}>{children}</h3>,
                p: ({ children }) => <p className={`mb-3.5 text-[14px] leading-relaxed ${isLightBubble ? "text-gray-700" : "text-gray-200"} font-normal`}>{children}</p>,
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = String(children).replace(/\n$/, '');
                  if (match) {
                    return (
                      <div className={`my-4 rounded-xl overflow-hidden border ${isLightBubble ? "border-gray-200 bg-gray-50 text-gray-800" : "border-white/10 bg-black/60"} shadow-2xl max-w-full flex flex-col font-mono text-[12px] leading-relaxed`}>
                        <div className={`flex items-center justify-between px-4 py-2 border-b ${isLightBubble ? "border-gray-200 bg-white" : "border-white/5 bg-white/[0.02]"} text-gray-400 text-[10px] uppercase font-bold tracking-wider`}>
                          <span>{match[1]}</span>
                          <CopyButton text={codeText} />
                        </div>
                        <pre className={`p-4 overflow-x-auto max-w-full ${isLightBubble ? "text-indigo-900" : "text-indigo-200"}`}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className={`${isLightBubble ? "bg-gray-100 text-pink-600" : "bg-white/10 text-pink-300"} px-1.5 py-0.5 rounded font-mono text-[12px] leading-normal`}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {part}
            </ReactMarkdown>
          </div>
        );
      }
      return null;
    });
  };

  if (!agentConfig) return null;

  const themeColor = agentConfig.themeColor || "#6366f1";
  const template = agentConfig.templateStyle || "glass";
  const isDark = ["glass", "neo-dark", "default"].includes(template);

  const getBg = () => {
    switch (template) {
      case "glass": return "bg-[#060810]";
      case "ios": return "bg-[#F2F2F7]";
      case "neo-dark": return "bg-[#080808]";
      case "minimal": return "bg-gray-50";
      case "playful": return "bg-[#FFF4F0]";
      case "cyberpunk": return "bg-[#0B0C10]";
      case "holographic": return "bg-gradient-to-br from-[#f3e7e9] to-[#e3eeff]";
      case "luxury-gold": return "bg-[#111]";
      case "emerald-city": return "bg-[#061E16]";
      case "aurora": return "bg-[#0A0E17]";
      default: return "bg-[#060810]";
    }
  };

  const getUserBubble = () => {
    switch (template) {
      case "glass": return "text-white rounded-[20px] rounded-tr-[4px]";
      case "ios": return "bg-[#007AFF] text-white rounded-[20px] rounded-br-[4px]";
      case "neo-dark": return "bg-gray-800 text-white rounded-xl rounded-tr-[4px]";
      case "minimal": return "bg-gray-900 text-white rounded-2xl rounded-tr-[4px]";
      case "playful": return "text-white rounded-[22px] rounded-tr-[4px]";
      case "cyberpunk": return "bg-[#F50057] text-white rounded-none border-b-2 border-r-2 border-[#00E5FF] shadow-[2px_2px_0px_#00E5FF]";
      case "holographic": return "bg-white/40 border border-white/60 text-gray-800 rounded-3xl rounded-tr-sm shadow-xl backdrop-blur-md";
      case "luxury-gold": return "bg-[#D4AF37] text-black rounded-sm border border-[#FFDF73] rounded-tr-3xl rounded-bl-3xl font-medium";
      case "emerald-city": return "bg-[#10B981] text-white rounded-2xl rounded-tr-none shadow-[0_0_15px_rgba(16,185,129,0.4)]";
      case "aurora": return "bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-3xl rounded-tr-md shadow-[0_0_20px_rgba(139,92,246,0.3)]";
      default: return "text-white rounded-[20px] rounded-tr-[4px]";
    }
  };

  const getBotBubble = () => {
    switch (template) {
      case "glass": return "bg-white/8 border border-white/8 text-gray-200 rounded-[20px] rounded-tl-[4px] backdrop-blur-sm";
      case "ios": return "bg-white text-gray-800 rounded-[20px] rounded-bl-[4px] shadow-sm border border-gray-100";
      case "neo-dark": return "bg-[#161616] border border-gray-800/60 text-gray-300 rounded-xl rounded-tl-[4px]";
      case "minimal": return "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-[4px]";
      case "playful": return "bg-white border border-orange-100 text-gray-800 rounded-[22px] rounded-tl-[4px] shadow-sm";
      case "cyberpunk": return "bg-[#1A1A1D] border-l-2 border-t-2 border-[#00E5FF] text-[#00E5FF] rounded-none shadow-[-2px_-2px_0px_#F50057]";
      case "holographic": return "bg-white/20 border border-white/40 text-gray-800 rounded-3xl rounded-tl-sm shadow-lg backdrop-blur-xl";
      case "luxury-gold": return "bg-[#1A1A1A] text-[#D4AF37] rounded-sm border border-[#D4AF37]/50 rounded-tl-3xl rounded-br-3xl font-medium";
      case "emerald-city": return "bg-[#064E3B] text-emerald-100 border border-emerald-500/30 rounded-2xl rounded-tl-none";
      case "aurora": return "bg-white/5 border border-white/10 text-gray-200 rounded-3xl rounded-tl-md backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]";
      default: return "bg-white/8 border border-white/8 text-gray-200 rounded-[20px] rounded-tl-[4px]";
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={isEmbed ? "w-full h-full overflow-hidden relative" : `absolute inset-0 flex justify-center items-center overflow-hidden z-50 ${isDark ? 'bg-[#030408]' : 'bg-gray-100'} sm:px-6 sm:py-8 md:px-12 md:py-12`}>
      {/* Premium Desktop Ambient Background Elements */}
      {!isEmbed && (
        <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20" style={{ background: themeColor }}></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-[0.15]" style={{ background: themeColor }}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>
      )}
      
      <div className={isEmbed ? `w-full h-full flex flex-col font-sans overflow-hidden relative ${getBg()}` : `w-full h-full sm:h-[95vh] max-h-[1000px] max-w-5xl flex flex-col font-sans overflow-hidden relative z-10 sm:rounded-[36px] sm:border ${isDark ? 'border-white/10 sm:shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_2px_20px_rgba(255,255,255,0.05)] sm:ring-1 sm:ring-white/5' : 'border-gray-200 sm:shadow-[0_30px_100px_rgba(0,0,0,0.1),inset_0_2px_20px_rgba(255,255,255,0.5)] sm:ring-1 sm:ring-black/5'} ${getBg()}`}>
      {/* Ambient glow */}
      {isDark && !isEmbed && (
        <div
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[280px] h-[180px] rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{ background: themeColor }}
        />
      )}

      {/* ─── HEADER ─── */}
      <header className={`relative z-20 px-4 pt-4 pb-3 flex items-center justify-between gap-3 shrink-0 ${isDark ? "border-b border-white/5" : "border-b border-gray-200 bg-white/80 backdrop-blur-xl"}`}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-b from-white/3 to-transparent pointer-events-none" />}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            {agentConfig.avatarUrl ? (
              <img loading="lazy" src={agentConfig.avatarUrl} alt={agentConfig.name}
                className="h-10 w-10 rounded-full object-cover shadow-xl border-2"
                style={{ borderColor: themeColor + "60" }}
              />
            ) : (
              <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)` }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#060810] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          </div>
          <div>
            <h2 className={`font-bold text-sm leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
              {agentConfig.name || "AI Agent"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSending ? (
                <motion.p
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: themeColor }}
                >Thinking…</motion.p>
              ) : (
                <p className="text-[10px] text-emerald-500 font-bold tracking-wider uppercase">Online</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-500 bg-white/5 font-mono">PREVIEW</span>
          )}
          <button
            type="button"
            onClick={handleNewChat}
            className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer border ${
              isDark 
                ? "bg-white/5 hover:bg-white/10 border-white/5 text-gray-400 hover:text-white" 
                : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500 hover:text-gray-900"
            }`}
            title="Reset Chat (New Session)"
          >
            <MessageSquarePlus className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ─── MESSAGES ─── */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto px-4 py-5 flex flex-col gap-4 relative z-0"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
              className={`flex flex-col gap-1 w-full ${msg.role === "assistant" ? "self-start items-start" : "self-end items-end"}`}
            >
              {msg.role === "user" && msg.image && (
                <img loading="lazy" src={msg.image} alt="Upload" className="h-28 w-auto rounded-2xl object-cover border border-white/10 shadow-xl mb-1 self-end" />
              )}
              {msg.role === "user" && msg.fileName && (
                <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 shadow-lg mb-1 self-end flex items-center gap-3">
                  <FileText className="w-4 h-4 text-white/70" />
                  <span className="text-[12px] font-medium text-white truncate max-w-[200px]">{msg.fileName}</span>
                </div>
              )}
              {msg.role === "user" ? (
                <div
                  className={`px-4 py-3 text-[13.5px] leading-relaxed shadow-lg relative ${getUserBubble()}`}
                  style={template !== "ios" ? {
                    background: `linear-gradient(135deg, ${themeColor}DD, ${themeColor}99)`,
                  } : {}}
                >
                  <div>{renderContent(msg.content, false)}</div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  {(() => {
                    const isStreaming = idx === messages.length - 1 && isSending;
                    const contentToParse = isStreaming ? msg.content + "▍" : msg.content;
                    const parts = contentToParse.split(/(\[CHECKOUT:[^\]]+\]|\[PRODUCTS:[^\]]+\]|\[BUY:[^\]]+\]|\[CATEGORY:[^\]]+\]|\[BOOKING\]|\[BOOK:[^\]]*\]|\[TIMER:[^\]]+\]|\[GENERATE_CATALOG_PDF:[^\]]+\]|\[SHARE_PRELOADED_PDF:[^\]]+\]|\[DELEGATE:[^\]]+\]|\[FILE:[^\]]+\])/g);
                    let hasRenderedName = false;
                    
                    return parts.map((part, i) => {
                      if (part.trim() === "") return null;
                      const isWidget = part.startsWith("[") && part.endsWith("]") && !part.startsWith("[Document");
                      if (isWidget) {
                        return <div key={i} className="w-full">{renderContent(part, false)}</div>;
                      } else {
                        const showName = !hasRenderedName;
                        hasRenderedName = true;
                        return (
                          <div key={i} className={`px-4 py-3 text-[13.5px] leading-relaxed shadow-lg relative w-full ${getBotBubble()}`}>
                            {showName && (
                              <div className="flex items-center gap-1.5 mb-2 opacity-60">
                                <Sparkles className="h-3 w-3" style={{ color: themeColor }} />
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: themeColor }}>{agentConfig.name}</span>
                              </div>
                            )}
                            <div>{renderContent(part, false)}</div>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              )}
              <span className="text-[10px] text-gray-600 px-1">{formatTime(msg.timestamp)}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Premium Aura Typing Indicator */}
        <AnimatePresence>
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`self-start px-6 py-5 w-full rounded-[20px] rounded-tl-[4px] shadow-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${isDark ? "bg-[#060810]/80 border border-indigo-500/20 backdrop-blur-md" : "bg-white border border-indigo-100"}`}
            >
              {/* Animated Glow Background */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-xl animate-[pulse_2s_ease-in-out_infinite] -z-10" style={{ backgroundImage: `linear-gradient(to right, transparent, ${themeColor}, transparent)` }}></div>
              <div className="absolute -left-[100%] top-0 bottom-0 w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_2s_infinite] pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full justify-center">
                <div className="flex items-center gap-1.5 shrink-0">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ color: themeColor, backgroundColor: themeColor }}
                      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1, delay, ease: "easeInOut" }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center justify-center overflow-hidden h-6 relative w-full max-w-[250px]">
                  {(() => {
                    // Generate dynamic statuses based on the last user message
                    const lastUserMsg = messages.slice().reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
                    const hasImage = messages.slice().reverse().find(m => m.role === "user")?.image || isVisionMode;
                    const agentName = agentConfig?.name || "Agent";
                    
                    let statuses = [`${agentName} is thinking...`, "Orchestrating...", "Synthesizing response..."];
                    
                    if (hasImage) {
                      statuses = ["Vision active...", "Analyzing visual data...", "Extracting features...", "Synthesizing response..."];
                    } else if (lastUserMsg.includes("buy") || lastUserMsg.includes("price") || lastUserMsg.includes("catalog") || lastUserMsg.includes("product")) {
                      statuses = ["Querying database...", "Fetching ecom products...", "Applying smart pricing...", "Synthesizing response..."];
                    } else if (lastUserMsg.includes("search") || lastUserMsg.includes("find") || lastUserMsg.includes("who is")) {
                      statuses = ["Orchestrating swarm...", "Searching web...", "Reading search results...", "Synthesizing response..."];
                    } else if (lastUserMsg.includes("book") || lastUserMsg.includes("appointment") || lastUserMsg.includes("schedule")) {
                      statuses = ["Checking availability...", "Accessing calendar booking...", "Synthesizing response..."];
                    } else if (lastUserMsg.includes("lead") || lastUserMsg.includes("@") || lastUserMsg.includes("webhook")) {
                      statuses = ["Validating data...", "Triggering automations...", "Synthesizing response..."];
                    }

                    // Simple hack to cycle through without an external component:
                    // Use CSS animations to slide up the different statuses!
                    return (
                      <div className="absolute inset-0 flex flex-col items-center justify-start animate-[slideUp_6s_infinite_steps(3)]">
                        {statuses.slice(0, 3).map((status, idx) => (
                          <div key={idx} className="h-6 flex items-center justify-center shrink-0 w-full">
                            <span 
                              className="text-[11px] sm:text-xs font-extrabold tracking-[0.15em] uppercase text-center w-full truncate"
                              style={{ 
                                background: `linear-gradient(to right, ${themeColor}, #a78bfa)`, 
                                WebkitBackgroundClip: "text", 
                                WebkitTextFillColor: "transparent" 
                              }}
                            >
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { transform: translateY(0); }
          33.33% { transform: translateY(-24px); }
          66.66% { transform: translateY(-48px); }
          100% { transform: translateY(0); }
        }
      `}} />

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && !isSending && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-4 z-30 h-8 w-8 rounded-full flex items-center justify-center shadow-xl border border-white/10 backdrop-blur-md bg-black/60 text-gray-300"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── INPUT BAR or LEAD FORM ─── */}
      <div className={`relative z-20 p-3 pb-4 shrink-0 ${isDark ? "bg-gradient-to-t from-[#060810] via-[#060810]/95 to-transparent pt-6" : "border-t border-gray-200 bg-white"}`}>
        {hasSubmittedLead ? (
          <>
            {/* File preview */}
            <AnimatePresence>
              {uploadedFileName && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 mx-1 flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{uploadedFileName}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input pill */}
            <motion.div
              animate={{
                boxShadow: isFocused
                  ? `0 0 0 1px ${themeColor}60, 0 8px 40px ${themeColor}25`
                  : `0 4px 20px rgba(0,0,0,0.4)`
              }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-[26px] transition-colors ${isDark ? "bg-white/7 border border-white/8" : "bg-gray-100 border border-gray-200"}`}
            >
              <label className={`h-9 w-9 flex items-center justify-center rounded-full cursor-pointer transition shrink-0 ${isDark ? "hover:bg-white/8 text-gray-500" : "hover:bg-gray-200 text-gray-400"}`}>
                <Paperclip className="h-4 w-4" />
                <input type="file" accept="image/*,.pdf,.doc,.txt" className="hidden" onChange={handleFileUpload} />
              </label>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !isSending) { e.preventDefault(); handleSubmit(); } }}
                placeholder={isSending ? "AI is processing..." : "Ask anything..."}
                disabled={isSending}
                className={`flex-grow bg-transparent px-1.5 py-2 text-[14px] focus:outline-none ${isDark ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"} ${isSending ? "opacity-60" : ""}`}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={isSending ? handleStop : handleSubmit}
                disabled={!isSending && (!input.trim() && !uploadedFile)}
                className="h-10 w-10 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-30 shadow-lg transition-all"
                style={{ background: isSending ? `linear-gradient(135deg, #ef4444, #b91c1c)` : `linear-gradient(135deg, ${themeColor}, ${themeColor}BB)` }}
              >
                <AnimatePresence mode="wait">
                  {isSending ? (
                    <motion.div
                      key="stop"
                      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                      className="ml-0.5"
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </>
        ) : (
          <motion.form 
            onSubmit={handleLeadSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold">Let's get started!</h3>
                  <p className="text-[10px] text-gray-400">Please provide your details to continue.</p>
                </div>
              </div>

              <input 
                type="text"
                placeholder="Your Name *"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              
              <div className="flex gap-2">
                <select 
                  value={leadCountryCode}
                  onChange={(e) => setLeadCountryCode(e.target.value)}
                  className="bg-[#1a1b26] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 outline-none w-24 shrink-0"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input 
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <input 
                type="email"
                placeholder="Email Address"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />

              <button 
                type="submit"
                disabled={isSubmittingLead || !leadName || (!leadPhone && !leadEmail)}
                className="w-full h-10 mt-1 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)` }}
              >
                {isSubmittingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Chatting"}
                {!isSubmittingLead && <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.form>
        )}
        {!isPreviewMode && (
          <p className="text-center text-[9px] text-gray-700 mt-2 tracking-wide">Powered by Aether AI</p>
        )}
      </div>

      {/* ─── PREMIUM IN-CHAT PAYMENT SHEET ─── */}
      <AnimatePresence>
        {activeCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-black/90 backdrop-blur-3xl sm:border border-t border-white/10 rounded-t-[40px] sm:rounded-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.8),inset_0_2px_20px_rgba(255,255,255,0.05)] overflow-hidden relative p-6 sm:p-8 z-50 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/5 pointer-events-none" />
              
              {/* Drag indicator */}
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-5 cursor-pointer" onClick={() => setActiveCheckout(null)} />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block">Secure Checkout • {storefront?.storeName || agentConfig.name || "Aether Store"}</span>
                  </div>
                  <h3 className="text-[24px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-600 tracking-tight leading-none">Premium Direct Pay</h3>
                </div>
                <button 
                  onClick={() => setActiveCheckout(null)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checkoutStep === "form" && (
                <div className="flex flex-col gap-4">
                  {/* Global Cart Timer */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-[0_4px_20px_rgba(251,191,36,0.1)]">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-200/90">Offer Reserved For</span>
                    </div>
                    <MiniTimer />
                  </div>

                  {/* Dynamic negotiation offers block */}
                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-3.5 flex flex-col gap-2 relative">
                    <p className="text-[10.5px] text-indigo-300 font-medium leading-relaxed flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Want a discount? You can negotiate special offers directly in the chat window!
                    </p>
                    <button
                      onClick={() => {
                        const name = activeCheckout.name;
                        setActiveCheckout(null);
                        handleSubmit(undefined, `I am interested in buying "${name}". Do you have any special discount coupon codes or promotional bundles available that you can authorize for me right now?`);
                      }}
                      className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10.5px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Ask AI Agent for a Special Offer First
                    </button>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 flex justify-between items-center shadow-inner relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="flex-grow max-w-[65%] relative z-10">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Order Summary</p>
                      <p className="text-[14px] text-white/95 font-black leading-snug">{activeCheckout.name}</p>
                    </div>
                    <span className="text-[24px] font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 font-black shrink-0 relative z-10 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">{formatPrice(activeCheckout.price)}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Full Name</label>
                        <input 
                          type="text"
                          placeholder="John Doe"
                          value={checkoutCardName}
                          onChange={(e) => setCheckoutCardName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Email</label>
                        <input 
                          type="email"
                          placeholder="you@email.com"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Phone Number</label>
                      <input 
                        type="text"
                        placeholder="+1 234 567 890"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-medium"
                      />
                    </div>

                    {!activeCheckout?.isDigital && (
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Full Shipping Address</label>
                        <textarea 
                          placeholder="Street, City, Zip, Country"
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-medium resize-none"
                        />
                      </div>
                    )}

                    {storefront?.enableCashOnDelivery && (
                      <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
                        <button
                          onClick={() => setCheckoutPaymentMethod("card")}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${checkoutPaymentMethod === "card" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"}`}
                        >
                          Credit Card
                        </button>
                        <button
                          onClick={() => setCheckoutPaymentMethod("cod")}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${checkoutPaymentMethod === "cod" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"}`}
                        >
                          Cash on Delivery
                        </button>
                      </div>
                    )}

                    {checkoutPaymentMethod === "card" && (
                      <>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Card Number</label>
                          <div className="relative">
                            <input 
                              type="text"
                              maxLength={19}
                              placeholder="4242 4242 4242 4242"
                              value={checkoutCardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                const matches = val.match(/\d{4,16}/g);
                                const match = (matches && matches[0]) || '';
                                const parts = [];
                                for (let i = 0, len = match.length; i < len; i += 4) {
                                  parts.push(match.substring(i, i + 4));
                                }
                                if (parts.length > 0) {
                                  setCheckoutCardNumber(parts.join(' '));
                                } else {
                                  setCheckoutCardNumber(val);
                                }
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-3.5 pr-10 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-mono"
                            />
                            <CreditCard className="absolute right-3.5 top-3 w-4 h-4 text-gray-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">Expiry Date</label>
                            <input 
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              value={checkoutCardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 2) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setCheckoutCardExpiry(val);
                              }}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1.5 ml-1">CVC</label>
                            <input 
                              type="password"
                              maxLength={3}
                              placeholder="***"
                              value={checkoutCardCvc}
                              onChange={(e) => setCheckoutCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600 font-mono"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    disabled={!checkoutCardName || !checkoutEmail || !checkoutPhone || (!activeCheckout?.isDigital && !checkoutAddress) || (checkoutPaymentMethod === "card" && (checkoutCardNumber.length < 15 || checkoutCardExpiry.length < 5 || checkoutCardCvc.length < 3))}
                    onClick={async () => {
                      setCheckoutStep("processing");
                      try {
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            tenantSlug,
                            productId: activeCheckout.id,
                            buyerName: checkoutCardName,
                            buyerEmail: checkoutEmail,
                            buyerPhone: checkoutPhone,
                            shippingAddress: checkoutAddress,
                            paymentMethod: checkoutPaymentMethod,
                            amountCents: activeCheckout.price
                          })
                        });
                        if (!res.ok) throw new Error("Checkout failed");
                        
                        setCheckoutStep("success");
                        setTimeout(() => {
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: `🎉 **Checkout Successful!**\n\nYour payment of **${formatPrice(activeCheckout.price)}** for **"${activeCheckout.name}"** was authorized successfully via ${checkoutPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe'}.\n\nAn automated receipt and order details have been emailed to ${checkoutEmail}. Feel free to ask me if you have any questions!`,
                            timestamp: new Date()
                          }]);
                          setActiveCheckout(null);
                          setCheckoutCardName("");
                          setCheckoutEmail("");
                          setCheckoutPhone("");
                          setCheckoutAddress("");
                          setCheckoutCardNumber("");
                          setCheckoutCardExpiry("");
                          setCheckoutCardCvc("");
                        }, 2500);
                      } catch (err) {
                        console.error(err);
                        setCheckoutStep("form");
                        alert("There was an error processing your checkout.");
                      }
                    }}
                    className="w-full mt-3 py-4 rounded-2xl text-[#3a2000] text-[15px] font-black flex items-center justify-center gap-2 transition-all shadow-[0_8px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_40px_rgba(251,191,36,0.5)] hover:-translate-y-1 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                    style={{ background: `linear-gradient(135deg, #fde68a, #f59e0b)` }}
                  >
                    <ShieldCheck className="w-5 h-5 text-[#3a2000]" />
                    {checkoutPaymentMethod === "cod" ? `Place Order for ${formatPrice(activeCheckout.price)}` : `Pay ${formatPrice(activeCheckout.price)} Securely`}
                  </button>
                  <p className="text-center text-[9.5px] text-gray-500 mt-2.5 flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    AES-256 Bit Encryption | PCI-DSS Compliant Gateway
                  </p>
                </div>
              )}

              {checkoutStep === "processing" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/10" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent"
                    />
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-1.5">Authorizing Funds</h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Securing connection to PCI credit gateway network. Please do not close or reload this window...</p>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)] mb-6"
                  >
                    <motion.div
                      initial={{ scale: 0.4 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Check className="w-10 h-10 text-amber-400" />
                    </motion.div>
                  </motion.div>
                  <h4 className="text-[18px] font-black text-white mb-1.5">Payment Captured!</h4>
                  <p className="text-xs text-amber-400 font-bold tracking-wider uppercase mb-1">Receipt Ref: #AETH-{Math.floor(100000 + Math.random() * 900000)}</p>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed mt-2">Your credit transaction processed successfully. Closing drawer and updating chat thread...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
