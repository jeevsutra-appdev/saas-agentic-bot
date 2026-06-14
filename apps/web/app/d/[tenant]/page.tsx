"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Navigation, CheckCircle2, AlertTriangle, Phone, ExternalLink, RefreshCw, X, Download, MapPin, Map, PhoneCall, Check } from "lucide-react";

export default function DeliveryApp() {
  const { tenant } = useParams() as { tenant: string };
  const [isClient, setIsClient] = useState(false);

  // Auth & Shift State
  const [rider, setRider] = useState<any>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // App State
  const [stats, setStats] = useState({ pendingCount: 0, todaysDeliveries: 0, cancelledCount: 0, orderValueToday: 0 });
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    const savedRider = localStorage.getItem(`rider_${tenant}`);
    if (savedRider) {
      setRider(JSON.parse(savedRider));
    }

    // Handle PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, [tenant]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (rider && isOnline) {
      fetchDashboard();
      
      const bc = new BroadcastChannel(`tenant_updates_${tenant}`);
      bc.onmessage = (event) => {
        if (event.data.type === "ORDER_ACCEPTED") {
          // If the order is assigned to me!
          if (event.data.payload.deliveryBoyId === rider.id || event.data.payload.deliveryBoyName === rider.name) {
            setIncomingOrder(event.data.payload);
            playSiren();
            fetchDashboard();
          }
        }
      };
      return () => bc.close();
    }
  }, [rider, isOnline]);

  const initAudioAndGoOnline = () => {
    // Explicit user interaction required by browsers to allow audio playback
    if (!audioRef.current) {
      audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=emergency-alarm-with-reverb-29431.mp3");
      audioRef.current.loop = true;
    }
    // Play and immediately pause to unlock the audio context
    audioRef.current.play().then(() => {
      audioRef.current?.pause();
      setIsOnline(true);
    }).catch(e => {
      console.error("Audio unlock failed", e);
      setIsOnline(true); // Go online anyway
    });
  };

  const playSiren = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play error", e));
    }
  };

  const stopSiren = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", tenantSlug: tenant, id: loginId, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setRider(data.rider);
        localStorage.setItem(`rider_${tenant}`, JSON.stringify(data.rider));
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (e) {
      setLoginError("Network error. Try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`rider_${tenant}`);
    setRider(null);
    setIsOnline(false);
  };

  const fetchDashboard = async () => {
    if (!rider) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard", tenantSlug: tenant, id: rider.id })
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPendingOrders(data.pendingOrders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const broadcastOrderUpdate = (orderId: string, type: string) => {
    try {
      const channel = new BroadcastChannel("aether-live-order-processing");
      channel.postMessage({
        type: type,
        data: {
          orderId,
          deliveryBoyName: rider.name,
          deliveryBoyPhone: "+919851383582" // Simulated phone
        }
      });
      channel.close();
    } catch(e) {}
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", tenantSlug: tenant, orderId, riderId: rider.id, status })
      });
      const data = await res.json();
      if (data.success) {
        if (status === "picked_up") broadcastOrderUpdate(orderId, "DELIVERY_PICKED_UP");
        if (status === "delivered") broadcastOrderUpdate(orderId, "DELIVERY_COMPLETED");
        fetchDashboard();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isClient) return null;

  if (!rider) {
    return (
      <div className="min-h-screen bg-[#0d1220] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col items-center">
          <div className="h-20 w-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center mb-6">
            <Bike className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Delivery Partner</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Sign in with your Rider ID and Password to start delivering.</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rider ID</label>
              <input
                type="text"
                required
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="dboy_123456"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl mt-2 transition"
            >
              {isLoggingIn ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b14] pb-24 font-sans selection:bg-emerald-500/30 text-white">
      {/* Premium Header */}
      <header className="bg-[#0b0e17]/90 border-b border-white/5 sticky top-0 z-20 backdrop-blur-xl shadow-lg">
        <div className="max-w-md mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {rider.avatarUrl ? (
              <img loading="lazy" src={rider.avatarUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {rider.vehicle === "scooter" ? "🛵" : rider.vehicle === "car" ? "🚗" : rider.vehicle === "van" ? "🚐" : "🚲"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-black text-white text-base tracking-tight">{rider.name}</span>
              <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${isOnline ? 'text-emerald-400' : 'text-gray-500'}`}>
                {isOnline ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Active Shift
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-gray-500 inline-block"></span>
                    Offline
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isInstallable && (
              <button onClick={handleInstallClick} className="h-10 px-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex items-center gap-2 transition-colors text-xs font-bold">
                <Download className="w-4 h-4" /> Install App
              </button>
            )}
            <button onClick={handleLogout} className="h-10 px-4 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 font-bold transition">Exit</button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col gap-6 mt-2">
        {!isOnline ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 p-8 bg-[#0b0e17] border border-emerald-500/30 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="h-24 w-24 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <Bike className="h-12 w-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Ready to Ride?</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[250px]">Go online to start receiving live orders. Ensure your vehicle is ready.</p>
            <button onClick={initAudioAndGoOnline} className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl text-lg uppercase tracking-widest shadow-[0_10px_40px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:-translate-y-1 transition-all">
              GO ONLINE
            </button>
          </motion.div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b0e17] border border-white/5 rounded-3xl p-5 flex flex-col gap-1 shadow-lg">
                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Deliveries</span>
                <span className="text-3xl font-black text-white">{stats.todaysDeliveries}</span>
              </div>
              <div className="bg-[#0b0e17] border border-white/5 rounded-3xl p-5 flex flex-col gap-1 shadow-lg">
                <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Earnings</span>
                <span className="text-3xl font-black text-emerald-400">${stats.orderValueToday.toFixed(2)}</span>
              </div>
              <div className="col-span-2 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-5 flex items-center justify-between shadow-xl mt-2 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>
                <div className="flex flex-col gap-1 relative z-10">
                  <span className="text-indigo-400 text-[10px] uppercase font-black tracking-widest">Active Orders</span>
                  <span className="text-3xl font-black text-white flex items-center gap-3">
                    {stats.pendingCount}
                    {stats.pendingCount > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
                  </span>
                </div>
                <button onClick={fetchDashboard} className="relative z-10 h-14 w-14 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95">
                  <RefreshCw className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Premium Pending Orders List */}
            <div className="mt-4">
              <h2 className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-widest pl-2">Current Assignments</h2>
              <div className="flex flex-col gap-5">
                {pendingOrders.length === 0 ? (
                  <div className="bg-[#0b0e17] border border-white/5 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg">
                    <Map className="h-12 w-12 text-white/10 mb-4" />
                    <p className="text-white text-base font-bold">Waiting for orders</p>
                    <p className="text-gray-500 text-xs mt-1">New tasks will appear here instantly.</p>
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={order.id} className="bg-[#0b0e17] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="p-6 border-b border-white/5 flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</span>
                            <span className="text-white font-black text-lg font-mono">#{order.id.substring(6, 12).toUpperCase()}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Payout</span>
                            <span className="text-emerald-400 font-black text-xl">${((order.amountCents || 0)/100 * 0.1).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col gap-6 relative z-10">
                        {/* Route Info */}
                        <div className="flex flex-col gap-4 relative">
                          <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-white/10"></div>
                          
                          <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border-4 border-[#0b0e17] relative z-10">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pickup</span>
                              <span className="text-white font-bold text-sm">Central Kitchen HQ</span>
                              <span className="text-gray-500 text-xs">Sector 4, Main Boulevard</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border-4 border-[#0b0e17] relative z-10">
                              <Navigation className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dropoff</span>
                              <span className="text-white font-bold text-sm">{order.buyerName}</span>
                              <span className="text-gray-400 text-xs mt-1 leading-snug">{order.shippingAddress || "No address provided"}</span>
                            </div>
                            <a href={`tel:${order.buyerPhone || "000"}`} className="ml-auto mt-2 h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 border border-white/10">
                              <PhoneCall className="h-4 w-4" />
                            </a>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Order Items</span>
                          <span className="text-white text-xs font-medium">Multiple items including main course & beverages. Check ticket at kitchen.</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-2 flex items-center gap-3">
                          {order.deliveryStatus === "picked_up" || order.status === "out_for_delivery" ? (
                            <button 
                              onClick={() => updateOrderStatus(order.id, "delivered")}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4.5 rounded-2xl text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                            >
                              <CheckCircle2 className="h-5 w-5" /> Confirm Delivery
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateOrderStatus(order.id, "picked_up")}
                              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4.5 rounded-2xl text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
                            >
                              <Navigation className="h-5 w-5" /> Picked Up (Out for Delivery)
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Incoming Order Premium Modal */}
      <AnimatePresence>
        {incomingOrder && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="bg-[#0b0e17] border border-emerald-500/30 rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(16,185,129,0.3)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 animate-pulse"></div>
              
              <div className="p-8 flex flex-col items-center text-center relative z-10 bg-gradient-to-b from-emerald-500/10 to-transparent">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-20 w-20 bg-emerald-500 text-black rounded-full flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.6)] relative z-10"
                >
                  <AlertTriangle className="h-10 w-10" />
                </motion.div>
                
                <h2 className="text-3xl font-black text-white tracking-tighter">NEW RIDE</h2>
                <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mt-1">Assigned to you</p>
              </div>
              
              <div className="p-6 pt-0 flex flex-col gap-5">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Order ID</span>
                    <span className="text-white font-mono font-bold text-base">#{incomingOrder.orderId?.substring(6, 12).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Customer</span>
                    <span className="text-white font-bold text-base">{incomingOrder.buyerName}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => { stopSiren(); setIncomingOrder(null); fetchDashboard(); }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-transform active:scale-95 mt-2"
                >
                  <Check className="h-5 w-5" /> Accept Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
