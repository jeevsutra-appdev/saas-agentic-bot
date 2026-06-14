"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Package, MapPin, Phone, MessageSquare, Menu, X, CheckCircle2,
  Clock, Truck, Navigation, LogOut, Download, AlertTriangle, Map,
  PhoneCall, Check, Plus, Timer, History, ChevronRight, Star,
  Bell, BellOff, Zap, ArrowLeft, Send, Navigation2, Satellite
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

// ─── helpers ───────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!targetMs) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return remaining;
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return { text: "OVERDUE", isOverdue: true };
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const text = h > 0
    ? `${h}h ${m.toString().padStart(2, "0")}m`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return { text, isOverdue: false };
}

function getOrderDeadlineMs(order: any): number | null {
  const base = order.assignedAt || order.createdAt;
  const mins = order.deliveryDeadlineMinutes || order.prepTimeMinutes;
  if (!base || !mins) return null;
  return new Date(base).getTime() + mins * 60 * 1000;
}

// ─── sub-components ────────────────────────────────────────────────────────

function CountdownBadge({ order }: { order: any }) {
  const deadlineMs = getOrderDeadlineMs(order);
  const remaining = useCountdown(deadlineMs);
  if (!deadlineMs) return null;
  const { text, isOverdue } = fmtCountdown(remaining);
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${isOverdue ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
      <Timer className="w-3 h-3" />
      {isOverdue ? "OVERDUE" : text}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export default function DeliveryApp() {
  const params = useParams();
  const tenantSlug = params.tenant as string;

  const [storeData, setStoreData] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMapOrder, setActiveMapOrder] = useState<any>(null);

  // Login
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);

  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // UI state
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [trayTab, setTrayTab] = useState<"profile" | "history">("profile");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Extend time modal
  const [extendOrder, setExtendOrder] = useState<any>(null);
  const [extendLoading, setExtendLoading] = useState(false);

  // Siren auto-accept countdown
  const [sirenCountdown, setSirenCountdown] = useState(15);
  const sirenCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Track known active order IDs so polling can detect newly-assigned orders cross-device
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Chat
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // GPS + Push
  const [pushEnabled, setPushEnabled] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const gpsWatchRef = useRef<number | null>(null);

  // ── boot ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem(`aether-rider-${tenantSlug}`);
    if (stored) {
      try { setRider(JSON.parse(stored)); } catch (_) {}
    }

    fetch(`/api/ecom?tenant=${tenantSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStoreData(data.storefront);
        setLoading(false);
      });

    // PWA detection
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });
    if ((window.navigator as any).standalone || window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, [tenantSlug]);

  // ── polling + BroadcastChannel ────────────────────────────────────────────

  const fetchOrders = useCallback(async (isFirstLoad = false) => {
    if (!rider) return;
    try {
      const res = await fetch(`/api/ecom/delivery?tenantSlug=${tenantSlug}&riderId=${rider.id}`);
      const data = await res.json();
      if (data.success) {
        const freshOrders: any[] = data.orders || [];
        const activeOrders = freshOrders.filter(
          o => o.deliveryStatus !== "Delivered" && o.deliveryStatus !== "delivered"
        );

        if (!isFirstLoad) {
          // Detect brand-new orders not previously seen — trigger siren cross-device
          for (const o of activeOrders) {
            if (!knownOrderIdsRef.current.has(o.id) && !incomingOrder) {
              setIncomingOrder({
                orderId: o.id,
                deliveryBoyId: rider.id,
                buyerName: o.buyerName || o.customer?.name,
                prepTimeMinutes: o.deliveryDeadlineMinutes || o.prepTimeMinutes,
                assignedAt: o.assignedAt
              });
              startSiren();
              break;
            }
          }
        }

        // Update known IDs
        knownOrderIdsRef.current = new Set(activeOrders.map((o: any) => o.id));
        setOrders(freshOrders);
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider, tenantSlug]);

  const fetchHistory = useCallback(async () => {
    if (!rider) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/ecom/delivery?tenantSlug=${tenantSlug}&action=get_history&riderId=${rider.id}`);
      const data = await res.json();
      if (data.success) setOrderHistory(data.orders || []);
    } catch (_) {}
    finally { setHistoryLoading(false); }
  }, [rider, tenantSlug]);

  // ── GPS tracking ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rider || !isOnline) return;
    if (!navigator.geolocation) return;
    setGpsActive(false);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true);
        fetch("/api/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            riderId: rider.id,
            orderId: orders.find(o => o.deliveryBoyId === rider.id)?.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        }).catch(() => {});
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    gpsWatchRef.current = watchId;
    return () => {
      navigator.geolocation.clearWatch(watchId);
      gpsWatchRef.current = null;
      setGpsActive(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider, isOnline, tenantSlug]);

  // ── Push notifications subscription ───────────────────────────────────────
  useEffect(() => {
    if (!rider) return;
    (async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;

        // Register dedicated push service worker
        const reg = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        const keyRes = await fetch("/api/push");
        const { publicKey } = await keyRes.json();
        if (!publicKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
        });

        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "subscribe",
            tenantSlug,
            role: "rider",
            riderId: rider.id,
            subscription: sub.toJSON(),
          }),
        });
        setPushEnabled(true);
      } catch (_) {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider]);

  // ── Chat helpers ───────────────────────────────────────────────────────────
  const fetchChatMessages = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/delivery-chat?tenantSlug=${tenantSlug}&orderId=${orderId}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch (_) {}
  }, [tenantSlug]);

  // Poll chat every 4s when drawer is open
  useEffect(() => {
    if (!chatOrderId) return;
    fetchChatMessages(chatOrderId);
    const interval = setInterval(() => fetchChatMessages(chatOrderId), 4000);
    return () => clearInterval(interval);
  }, [chatOrderId, fetchChatMessages]);

  // Poll unread counts for all active orders every 8s
  useEffect(() => {
    if (!rider || !isOnline || orders.length === 0) return;
    const pollUnread = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        orders
          .filter(o => o.deliveryStatus !== "Delivered")
          .map(async (o) => {
            try {
              const res = await fetch(`/api/delivery-chat?tenantSlug=${tenantSlug}&orderId=${o.id}`);
              const data = await res.json();
              if (data.success) {
                counts[o.id] = (data.messages || []).filter(
                  (m: any) => m.fromRole === "admin" && !m.read
                ).length;
              }
            } catch (_) {}
          })
      );
      setUnreadCounts(counts);
    };
    pollUnread();
    const interval = setInterval(pollUnread, 8000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider, isOnline, orders.length]);

  const openChat = (orderId: string) => {
    setChatOrderId(orderId);
    setChatMessages([]);
    setChatText("");
    // Mark admin messages as read
    fetch("/api/delivery-chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, orderId, role: "rider" }),
    }).catch(() => {});
    setUnreadCounts(prev => ({ ...prev, [orderId]: 0 }));
  };

  const sendChatMessage = async () => {
    if (!chatText.trim() || !chatOrderId || !rider) return;
    const text = chatText.trim();
    setChatText("");
    setChatLoading(true);
    try {
      await fetch("/api/delivery-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          orderId: chatOrderId,
          from: rider.name,
          fromRole: "rider",
          text,
        }),
      });
      // Notify admin via push
      fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          tenantSlug,
          role: "admin",
          title: `Message from ${rider.name}`,
          body: text,
          data: { url: `/c/${tenantSlug}`, tag: "rider-chat" },
        }),
      }).catch(() => {});
      await fetchChatMessages(chatOrderId);
    } catch (_) {}
    finally { setChatLoading(false); }
  };

  useEffect(() => {
    if (rider && isOnline) {
      // First load — populate knownOrderIds without triggering siren
      fetchOrders(true);
      // Subsequent polls will detect NEW orders and fire siren cross-device
      const interval = setInterval(() => fetchOrders(false), 10000);

      // BroadcastChannel for same-browser instant notification (faster than polling)
      let bc: BroadcastChannel | null = null;
      try {
        bc = new BroadcastChannel("aether-live-order-processing");
        bc.onmessage = (event) => {
          const { type, data: payload } = event.data;
          if (type === "ORDER_ASSIGNED") {
            const p = payload?.data || payload;
            if (rider && p?.deliveryBoyId === rider.id) {
              setIncomingOrder({ ...p, _receivedAt: Date.now() });
              startSiren();
              fetchOrders(false);
            }
          }
        };
      } catch (_) {}

      return () => {
        clearInterval(interval);
        bc?.close();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider, isOnline]);

  // ── audio ─────────────────────────────────────────────────────────────────

  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=emergency-alarm-with-reverb-29431.mp3"
      );
      audioRef.current.loop = true;
    }
  };

  const initAudioAndGoOnline = () => {
    initAudio();
    audioRef.current!.play()
      .then(() => { audioRef.current!.pause(); setIsOnline(true); })
      .catch(() => setIsOnline(true));
  };

  const startSiren = () => {
    initAudio();
    audioRef.current?.play().catch(() => {});
    // Auto-accept countdown
    setSirenCountdown(15);
    if (sirenCountdownRef.current) clearInterval(sirenCountdownRef.current);
    sirenCountdownRef.current = setInterval(() => {
      setSirenCountdown(prev => {
        if (prev <= 1) {
          clearInterval(sirenCountdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSiren = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (sirenCountdownRef.current) clearInterval(sirenCountdownRef.current);
  };

  // auto-accept when countdown hits 0
  useEffect(() => {
    if (incomingOrder && sirenCountdown === 0) {
      acceptOrder();
    }
  }, [sirenCountdown, incomingOrder]);

  // ── actions ───────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`/api/ecom/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", tenantSlug, phone, password })
      });
      const data = await res.json();
      if (data.success && data.rider) {
        setRider(data.rider);
        localStorage.setItem(`aether-rider-${tenantSlug}`, JSON.stringify(data.rider));
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch (_) {
      setLoginError("Failed to connect to server");
    }
  };

  const handleLogout = () => {
    stopSiren();
    setRider(null);
    setIsOnline(false);
    setOrders([]);
    setOrderHistory([]);
    localStorage.removeItem(`aether-rider-${tenantSlug}`);
    setIsTrayOpen(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const broadcastOrderUpdate = (orderId: string, type: string) => {
    try {
      const ch = new BroadcastChannel("aether-live-order-processing");
      ch.postMessage({ type, data: { orderId, deliveryBoyName: rider.name, deliveryBoyPhone: rider.phone } });
      ch.close();
    } catch (_) {}
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/ecom/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", tenantSlug, orderId, status })
      });
      const data = await res.json();
      if (data.success) {
        if (status === "Picked Up") broadcastOrderUpdate(orderId, "DELIVERY_PICKED_UP");
        if (status === "Delivered") broadcastOrderUpdate(orderId, "DELIVERY_COMPLETED");
        fetchOrders();
      }
    } catch (_) {}
  };

  const acceptOrder = () => {
    stopSiren();
    if (incomingOrder?.orderId) {
      knownOrderIdsRef.current.add(incomingOrder.orderId);
    }
    setIncomingOrder(null);
    fetchOrders(true);
  };

  const extendDeliveryTime = async (orderId: string, extraMinutes: number) => {
    setExtendLoading(true);
    try {
      const res = await fetch(`/api/ecom/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extend_time", tenantSlug, orderId, extraMinutes })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId
          ? { ...o, deliveryDeadlineMinutes: data.newDeadlineMinutes }
          : o
        ));
        setExtendOrder(null);
      }
    } catch (_) {}
    finally { setExtendLoading(false); }
  };

  const openHistoryTray = () => {
    setTrayTab("history");
    setIsTrayOpen(true);
    fetchHistory();
  };

  // ── render guards ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const primaryColor = storeData?.primaryColor || "#3b82f6";
  const logo = storeData?.brandLogo || "";
  const storeName = storeData?.name || "Store";
  const activeOrders = orders.filter(o => o.deliveryStatus !== "Delivered" && o.deliveryStatus !== "delivered");

  // ── login screen ──────────────────────────────────────────────────────────

  if (!rider) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex flex-col p-6 items-center justify-center font-sans max-w-md mx-auto">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            {logo ? (
              <img loading="lazy" src={logo} alt="Logo" className="h-20 w-auto mx-auto mb-4 rounded-xl" />
            ) : (
              <div className="h-20 w-20 mx-auto rounded-3xl mb-4 flex items-center justify-center text-3xl font-black text-white shadow-2xl" style={{ backgroundColor: primaryColor }}>
                {storeName.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl font-black text-white tracking-tight">Rider App</h1>
            <p className="text-sm text-gray-400 mt-2">Login to start delivering for {storeName}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Phone number or ID" value={phone} onChange={e => setPhone(e.target.value)} required
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white transition-colors font-medium" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-white transition-colors font-medium" />
            {loginError && <p className="text-red-400 text-sm text-center font-bold">{loginError}</p>}
            <button type="submit" className="w-full py-4 text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl transition-transform active:scale-95" style={{ backgroundColor: primaryColor }}>
              Sign In
            </button>
          </form>

          {/* PWA Install on login screen */}
          {isInstallable && !isInstalled && (
            <button onClick={handleInstallClick}
              className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl text-white/70 text-sm font-bold hover:bg-white/10 transition">
              <Download className="w-4 h-4" /> Install App on this Device
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── main dashboard ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#090b14] flex flex-col font-sans max-w-md mx-auto relative overflow-hidden shadow-2xl text-white">

      {/* Header */}
      <header className="px-5 h-16 flex items-center justify-between text-white shadow-md z-20 backdrop-blur-xl bg-[#0b0e17]/90 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => { setTrayTab("profile"); setIsTrayOpen(true); }} className="p-2 -ml-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition">
            <Menu className="w-6 h-6" />
          </button>
          {logo ? (
            <img loading="lazy" src={logo} alt="Logo" className="h-8 w-auto bg-white p-1 rounded-lg" />
          ) : (
            <span className="font-black text-lg tracking-tight">{storeName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isInstallable && !isInstalled && (
            <button onClick={handleInstallClick} className="h-8 px-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg flex items-center gap-1.5 transition text-xs font-bold text-white">
              <Download className="w-3.5 h-3.5" /> Install
            </button>
          )}
          <button onClick={openHistoryTray} className="h-8 px-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition">
            <History className="w-3.5 h-3.5" />
          </button>
          {gpsActive && (
            <div title="GPS tracking active" className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 px-2 py-1.5 rounded-lg text-[10px] font-black text-sky-400">
              <Satellite className="w-3 h-3" />
            </div>
          )}
          {pushEnabled && (
            <div title="Push notifications active" className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2 py-1.5 rounded-lg text-[10px] font-black text-violet-400">
              <Bell className="w-3 h-3" />
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-white/5 uppercase" style={{ color: isOnline ? "#10B981" : "#6B7280" }}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-24">
        {!isOnline ? (
          // Go-online CTA
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-8 bg-[#0b0e17] border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
            <div className="h-24 w-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <Truck className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Start Your Shift</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[250px]">Go online to receive live orders and enable audio alerts.</p>
            <button onClick={initAudioAndGoOnline}
              className="w-full text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl transition-transform hover:-translate-y-1 active:scale-95"
              style={{ backgroundColor: primaryColor }}>
              Go Online Now
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 mt-1">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Active Assignments ({activeOrders.length})
              </h2>
              {activeOrders.length === 0 && (
                <span className="text-[10px] text-gray-600 font-medium">Waiting for orders...</span>
              )}
            </div>

            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[#0b0e17] border border-white/5 rounded-[2rem] border-dashed">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <Package className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-black text-white">No active orders</h3>
                <p className="text-gray-500 mt-2 text-xs font-medium">Wait for new assignments from {storeName}.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {activeOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    storeName={storeName}
                    primaryColor={primaryColor}
                    onPickUp={() => updateOrderStatus(order.id, "Picked Up")}
                    onDeliver={() => updateOrderStatus(order.id, "Delivered")}
                    onMap={() => setActiveMapOrder(order)}
                    onExtend={() => setExtendOrder(order)}
                    onChat={() => openChat(order.id)}
                    unreadCount={unreadCounts[order.id] || 0}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Incoming Order Siren Modal ── */}
      <AnimatePresence>
        {incomingOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 80 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 80 }}
              className="bg-[#0b0e17] border border-white/20 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative">

              {/* pulsing top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 animate-pulse" style={{ backgroundColor: primaryColor }} />

              <div className="p-8 flex flex-col items-center text-center relative" style={{ background: `linear-gradient(to bottom, ${primaryColor}25, transparent)` }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="h-20 w-20 rounded-full flex items-center justify-center mb-5 shadow-2xl text-black"
                  style={{ backgroundColor: primaryColor }}>
                  <Bell className="h-10 w-10" />
                </motion.div>
                <h2 className="text-3xl font-black text-white tracking-tighter">NEW ORDER!</h2>
                <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>Assigned to you</p>

                {/* auto-accept ring */}
                <div className="mt-4 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-xs font-black">Auto-accepting in {sirenCountdown}s</span>
                </div>
              </div>

              <div className="px-6 pb-6 flex flex-col gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500 uppercase tracking-widest font-black mb-1">Order</div>
                    <div className="text-white font-mono font-bold">
                      #{(incomingOrder.orderId || incomingOrder.id)?.slice(-6).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 uppercase tracking-widest font-black mb-1">Customer</div>
                    <div className="text-white font-bold truncate">
                      {incomingOrder.buyerName || incomingOrder.customer?.name || "Customer"}
                    </div>
                  </div>
                  {incomingOrder.prepTimeMinutes && (
                    <div className="col-span-2">
                      <div className="text-gray-500 uppercase tracking-widest font-black mb-1">Est. Delivery</div>
                      <div className="text-emerald-400 font-bold">{incomingOrder.prepTimeMinutes} minutes</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={acceptOrder}
                  className="w-full text-black font-black text-sm uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95"
                  style={{ backgroundColor: primaryColor }}>
                  <Check className="h-5 w-5" /> Accept Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Extend Time Modal ── */}
      <AnimatePresence>
        {extendOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="bg-[#0f1220] border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Need More Time?</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Order #{extendOrder.id?.slice(-6).toUpperCase()}</p>
                  </div>
                  <button onClick={() => setExtendOrder(null)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">Select how much extra time you need. The store will be notified.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 15, 20].map(mins => (
                    <button key={mins} disabled={extendLoading}
                      onClick={() => extendDeliveryTime(extendOrder.id, mins)}
                      className="flex flex-col items-center justify-center py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition disabled:opacity-40 font-black text-white">
                      <Plus className="w-4 h-4 mb-1 text-gray-400" />
                      <span className="text-xl">{mins}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">min</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Side Tray ── */}
      <AnimatePresence>
        {isTrayOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTrayOpen(false)}
              className="absolute inset-0 bg-black/60 z-30 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[85%] bg-[#0b0e17] border-r border-white/10 z-40 shadow-2xl flex flex-col">

              {/* Tray tab bar */}
              <div className="flex border-b border-white/5 shrink-0">
                <button onClick={() => setTrayTab("profile")} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition ${trayTab === "profile" ? "text-white border-b-2" : "text-gray-500"}`} style={{ borderColor: trayTab === "profile" ? primaryColor : "transparent" }}>
                  Profile
                </button>
                <button onClick={() => { setTrayTab("history"); fetchHistory(); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition ${trayTab === "history" ? "text-white border-b-2" : "text-gray-500"}`} style={{ borderColor: trayTab === "history" ? primaryColor : "transparent" }}>
                  History
                </button>
                <button onClick={() => setIsTrayOpen(false)} className="px-4 text-gray-500 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {trayTab === "profile" ? (
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-6 border-b border-white/5">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shadow-xl mb-4 overflow-hidden border-2 border-white/10">
                      {rider.avatar ? (
                        <img loading="lazy" src={rider.avatar} alt="Rider" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-black text-white">{rider.name?.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white">{rider.name}</h3>
                    <p className="text-gray-400 text-sm font-medium mt-1">{rider.phone}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                      {rider.vehicle && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/5">
                          {rider.vehicle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-4 flex flex-col gap-2">
                    {isInstallable && !isInstalled && (
                      <button onClick={handleInstallClick} className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-left transition hover:bg-white/10 active:scale-95">
                        <Download className="w-5 h-5" style={{ color: primaryColor }} />
                        <div>
                          <div className="text-sm font-black">Install App</div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Add to home screen for siren alerts</div>
                        </div>
                      </button>
                    )}
                    <button onClick={openHistoryTray} className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 text-white font-bold text-left transition">
                      <History className="w-5 h-5 text-gray-500" /> Delivery History
                    </button>
                    <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 text-white font-bold text-left transition">
                      <MessageSquare className="w-5 h-5 text-gray-500" /> Support Chat
                    </button>
                  </div>

                  <div className="p-6">
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold active:bg-red-500/20 transition uppercase tracking-widest text-xs">
                      <LogOut className="w-4 h-4" /> Logout Shift
                    </button>
                  </div>
                </div>
              ) : (
                // History tab
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest px-1 pt-2">
                    {orderHistory.length} deliveries completed
                  </p>
                  {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    </div>
                  ) : orderHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <History className="w-12 h-12 text-gray-700 mb-4" />
                      <p className="text-gray-500 text-sm font-medium">No completed deliveries yet</p>
                    </div>
                  ) : (
                    orderHistory.map(order => (
                      <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-0.5">
                            #{order.id?.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-white font-bold text-sm truncate">
                            {order.buyerName || order.customer?.name || "Customer"}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5 truncate">
                            {order.shippingAddress?.street || order.shippingAddress || "—"}
                          </div>
                          <div className="text-gray-600 text-[10px] mt-1.5 font-medium">
                            {order.createdAt ? format(new Date(order.createdAt), "dd MMM, h:mm a") : ""}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="text-emerald-400 font-black text-sm">
                            ₹{order.total || ((order.amountCents || 0) / 100).toFixed(2)}
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            Delivered
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Chat Drawer ── */}
      <AnimatePresence>
        {chatOrderId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" onClick={() => setChatOrderId(null)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[100] max-w-md mx-auto bg-[#0c0e1a] border border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
              style={{ height: "75vh" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
                <div>
                  <h3 className="text-white font-black">Chat with Store</h3>
                  <p className="text-gray-500 text-[10px] font-medium mt-0.5">
                    Order #{chatOrderId.slice(-6).toUpperCase()}
                  </p>
                </div>
                <button onClick={() => setChatOrderId(null)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
                    <MessageSquare className="w-10 h-10" />
                    <p className="text-sm font-medium">No messages yet</p>
                  </div>
                )}
                {chatMessages.map((msg: any) => {
                  const isMe = msg.fromRole === "rider";
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium ${isMe ? "rounded-br-sm text-white" : "bg-white/[0.07] border border-white/[0.09] text-white rounded-bl-sm"}`}
                        style={isMe ? { backgroundColor: primaryColor } : {}}>
                        {msg.text}
                      </div>
                      <span className="text-gray-600 text-[9px]">
                        {msg.fromRole === "admin" ? "Store" : "You"} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-6 pt-3 border-t border-white/[0.07] shrink-0 flex gap-3">
                <input
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                  placeholder="Type a message…"
                  className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatText.trim() || chatLoading}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition active:scale-95 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Map Modal ── */}
      <AnimatePresence>
        {activeMapOrder && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#0b0e17]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl shrink-0">
              <div className="flex flex-col">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Navigation</span>
                <span className="text-sm font-black text-white truncate max-w-[220px]">
                  {activeMapOrder.shippingAddress?.street || activeMapOrder.shippingAddress || "Unknown Address"}
                </span>
              </div>
              <button onClick={() => setActiveMapOrder(null)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full bg-[#111422] relative">
              <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent((activeMapOrder.shippingAddress?.street || activeMapOrder.shippingAddress || "") + " " + (activeMapOrder.shippingAddress?.city || ""))}&t=&z=15&ie=UTF8&iwloc=&output=embed`} />
              <div className="absolute bottom-6 left-0 right-0 px-5 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl pointer-events-auto">
                  <div className="text-white font-bold">{activeMapOrder.buyerName || "Customer"}</div>
                  <div className="text-gray-400 text-xs">
                    {activeMapOrder.shippingAddress?.street || activeMapOrder.shippingAddress}
                  </div>
                  <a href={`tel:${activeMapOrder.buyerPhone || activeMapOrder.customer?.phone}`}
                    className="mt-1 w-full py-3 bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2">
                    <PhoneCall className="w-4 h-4" /> Call Customer
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Order Card (extracted to keep JSX readable) ───────────────────────────

function OrderCard({ order, storeName, primaryColor, onPickUp, onDeliver, onMap, onExtend, onChat, unreadCount }: {
  order: any;
  storeName: string;
  primaryColor: string;
  onPickUp: () => void;
  onDeliver: () => void;
  onMap: () => void;
  onExtend: () => void;
  onChat: () => void;
  unreadCount: number;
}) {
  const isPending = !order.deliveryStatus || order.deliveryStatus === "Pending" || order.deliveryStatus === "assigned";
  const isPickedUp = order.deliveryStatus === "Picked Up" || order.deliveryStatus === "picked_up" || order.deliveryStatus === "On the Way";
  const hasDeadline = !!(order.assignedAt || order.createdAt) && !!(order.deliveryDeadlineMinutes || order.prepTimeMinutes);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0b0e17] rounded-[2rem] p-5 shadow-xl border border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-10" style={{ backgroundColor: primaryColor }} />

      {/* Top row: order id + amount */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
            ORDER #{order.id?.slice(-6).toUpperCase()}
          </div>
          <div className="text-xl font-black text-white">{order.customer?.name || order.buyerName || "Customer"}</div>
          {/* Order date + time */}
          <div className="text-[10px] text-gray-600 font-medium mt-0.5">
            {order.createdAt ? format(new Date(order.createdAt), "dd MMM, h:mm a") : ""}
            {order.assignedAt && order.assignedAt !== order.createdAt
              ? ` · Assigned ${formatDistanceToNow(new Date(order.assignedAt), { addSuffix: true })}`
              : ""}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/10 px-4 py-1.5 rounded-xl text-sm font-black border border-white/5 text-emerald-400">
            ₹{order.total || ((order.amountCents || 0) / 100).toFixed(2)}
          </div>
          {hasDeadline && <CountdownBadge order={order} />}
        </div>
      </div>

      {/* Route */}
      <div className="flex flex-col gap-3 relative z-10 mb-5 pl-2">
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-white/10 rounded-full" />
        <div className="flex items-start gap-4 ml-2">
          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#0b0e17] relative z-10 shrink-0">
            <MapPin className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Store Pickup</div>
            <div className="text-white font-bold text-sm">{storeName}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 ml-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center border-2 border-[#0b0e17] relative z-10 shrink-0" style={{ backgroundColor: primaryColor }}>
            <Navigation className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Customer Drop-off</div>
            <div className="text-white text-sm mt-0.5 leading-snug">{order.shippingAddress?.street || order.shippingAddress || "No address provided"}</div>
            {order.shippingAddress?.city && <div className="text-gray-400 text-xs">{order.shippingAddress.city}</div>}
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex gap-2 mb-4 relative z-10">
        <a href={`tel:${order.customer?.phone || order.buyerPhone || "#"}`}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-500/20 active:bg-emerald-500/20 transition">
          <PhoneCall className="w-3.5 h-3.5" /> Call
        </a>
        <button onClick={onMap}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-white/10 active:bg-white/10 transition">
          <Map className="w-3.5 h-3.5" /> Map
        </button>
        <button onClick={onExtend} title="Need more time?"
          className="flex items-center justify-center px-3 py-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 active:bg-amber-500/20 transition">
          <Timer className="w-3.5 h-3.5" />
        </button>
        <button onClick={onChat} title="Chat with store"
          className="relative flex items-center justify-center px-3 py-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 active:bg-violet-500/20 transition">
          <MessageSquare className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Primary CTA */}
      <div className="border-t border-white/10 pt-4 relative z-10">
        {isPending && (
          <button onClick={onPickUp}
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition flex items-center justify-center gap-2">
            <Package className="w-4 h-4" /> Pick Up Order
          </button>
        )}
        {isPickedUp && (
          <button onClick={onDeliver}
            className="w-full py-4 text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px ${primaryColor}40` }}>
            <CheckCircle2 className="w-4 h-4" /> Mark Delivered
          </button>
        )}
      </div>
    </motion.div>
  );
}
