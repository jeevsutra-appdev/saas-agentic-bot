"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, X, Search, Star, Clock, Flame, ChevronRight,
  Plus, Minus, CheckCircle2, Bike, MapPin, Phone, CreditCard,
  ShoppingBag, ArrowLeft, Truck, Package, Tag, Zap, Heart
} from "lucide-react";

interface Props {
  store: any;
  tenantSlug: string;
}

export default function FoodEcomStore({ store, tenantSlug }: Props) {
  const isFood = store.storeType === "food";
  const primaryHex = store.primaryColor || (isFood ? "#f97316" : "#6366f1");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "pay" | "done">("cart");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<any | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/ecom/settings?tenantSlug=${tenantSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d.products) setProducts(d.products.filter((p: any) => p.isActive !== false));
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});
  }, [tenantSlug]);

  // BroadcastChannel for live order updates
  useEffect(() => {
    if (!activeOrderId) return;
    const channel = new BroadcastChannel("aether-live-order-processing");
    channel.onmessage = (e) => {
      const { type, data } = e.data;
      if (data?.orderId === activeOrderId) {
        if (type === "ORDER_ACCEPTED") {
          setOrderPlaced((prev: any) => prev ? { ...prev, status: "accepted", riderName: data.deliveryBoyName, riderPhone: data.deliveryBoyPhone, prepTime: data.prepTimeMinutes } : prev);
        } else if (type === "DELIVERY_PICKED_UP") {
          setOrderPlaced((prev: any) => prev ? { ...prev, status: "out_for_delivery", riderName: data.deliveryBoyName, riderPhone: data.deliveryBoyPhone } : prev);
        } else if (type === "DELIVERY_COMPLETED") {
          setOrderPlaced((prev: any) => prev ? { ...prev, status: "delivered" } : prev);
        }
      }
    };
    return () => channel.close();
  }, [activeOrderId]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing?.qty === 1) return prev.filter(i => i.id !== productId);
      return prev.map(i => i.id === productId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const currency = store.settings?.currency || "৳";

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = async () => {
    if (!buyerName || !buyerPhone || cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const res = await fetch("/api/ecom/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          storeId: store.id,
          buyerName,
          buyerPhone,
          deliveryAddress: buyerAddress,
          amountCents: Math.round(cartTotal * 100),
          paymentMethod: "cod",
          itemsJson: JSON.stringify(cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty, image: i.image }))),
          status: "pending",
          source: "online"
        })
      });
      const data = await res.json();
      if (data.success && data.order) {
        const channel = new BroadcastChannel("aether-live-order-processing");
        channel.postMessage({ type: "NEW_ORDER", data: { ...data.order, buyerName, buyerPhone, buyerEmail: "", deliveryAddress: buyerAddress } });
        channel.close();
        setActiveOrderId(data.order.id);
        setOrderPlaced(data.order);
        setCheckoutStep("done");
        setCart([]);
      }
    } catch (e) {}
    finally { setIsPlacingOrder(false); }
  };

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: "✅" },
    { key: "accepted", label: "Accepted", icon: "👨‍🍳" },
    { key: "out_for_delivery", label: "On the Way", icon: "🛵" },
    { key: "delivered", label: "Delivered", icon: "📦" }
  ];
  const currentStatusIdx = statusSteps.findIndex(s => s.key === orderPlaced?.status) ?? 0;

  return (
    <div className="min-h-screen bg-[#02040A] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#02040A]/95 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {(store.brandLogo || store.image) && (
              <img
                src={store.brandLogo || store.image}
                alt={store.name}
                className="rounded-xl object-contain shrink-0"
                style={{ height: store.brandLogoHeight || 36, width: "auto", maxWidth: 80 }}
              />
            )}
            <div className="min-w-0">
              <h1 className="text-white font-black text-sm truncate">{store.name}</h1>
              {store.description && <p className="text-gray-500 text-[10px] truncate">{store.description}</p>}
            </div>
          </div>
          <button
            onClick={() => { setShowCart(true); setCheckoutStep("cart"); }}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-white font-bold text-xs cursor-pointer shrink-0"
            style={{ background: primaryHex + "20", border: `1px solid ${primaryHex}40` }}
          >
            <ShoppingCart className="h-4 w-4" style={{ color: primaryHex }} />
            <span style={{ color: primaryHex }}>{cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Cart"}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-white text-[9px] font-black flex items-center justify-center" style={{ background: primaryHex }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isFood ? "Search dishes..." : "Search products..."}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Hero banner */}
      {store.settings?.heroImage && (
        <div className="relative h-40 overflow-hidden">
          <img src={store.settings.heroImage} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#02040A]" />
        </div>
      )}

      {/* Store info chips */}
      {isFood && (
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-bold">4.8</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 px-3 py-1.5 rounded-full shrink-0">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-gray-300 text-xs">{store.settings?.estimatedDeliveryMins || 30} mins</span>
          </div>
          {store.settings?.deliveryFee !== undefined && (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 px-3 py-1.5 rounded-full shrink-0">
              <Bike className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300 text-xs">{store.settings.deliveryFee === 0 ? "Free delivery" : `${currency}${store.settings.deliveryFee} delivery`}</span>
            </div>
          )}
          {store.settings?.minOrderAmount && (
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/8 px-3 py-1.5 rounded-full shrink-0">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300 text-xs">Min {currency}{store.settings.minOrderAmount}</span>
            </div>
          )}
        </div>
      )}

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${!selectedCategory ? "text-white border-transparent" : "text-gray-400 border-white/10 hover:text-white"}`}
            style={!selectedCategory ? { background: primaryHex, borderColor: primaryHex } : {}}
          >All</button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${selectedCategory === cat.id ? "text-white border-transparent" : "text-gray-400 border-white/10 hover:text-white"}`}
              style={selectedCategory === cat.id ? { background: primaryHex, borderColor: primaryHex } : {}}
            >{cat.name}</button>
          ))}
        </div>
      )}

      {/* Products grid */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl opacity-30">{isFood ? "🍽️" : "📦"}</div>
            <p className="text-gray-500 text-sm">{searchQuery ? `No results for "${searchQuery}"` : "No items available"}</p>
          </div>
        ) : (
          <div className={isFood ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}>
            {filteredProducts.map((product: any) => {
              const qty = cart.find(i => i.id === product.id)?.qty || 0;
              const liked = wishlist.has(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br from-[#0d1220] to-[#090c16] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition ${isFood ? "flex gap-0" : "flex flex-col"}`}
                >
                  {isFood ? (
                    // Food card — horizontal layout
                    <div className="flex gap-0 w-full">
                      <div className="flex-1 p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-white font-bold text-sm leading-tight flex-1">{product.name}</h3>
                          <button onClick={() => setWishlist(prev => { const n = new Set(prev); liked ? n.delete(product.id) : n.add(product.id); return n; })} className="cursor-pointer shrink-0">
                            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                          </button>
                        </div>
                        {product.description && <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <p className="font-black text-base" style={{ color: primaryHex }}>{currency}{product.price}</p>
                          {qty === 0 ? (
                            <button onClick={() => addToCart(product)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs text-white cursor-pointer" style={{ background: primaryHex }}>
                              <Plus className="h-3 w-3" /> Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(product.id)} className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-white font-black text-sm w-5 text-center">{qty}</span>
                              <button onClick={() => addToCart(product)} className="h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer text-white" style={{ background: primaryHex }}>
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {product.image && (
                        <div className="relative w-28 shrink-0">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    // Ecom card — vertical layout
                    <div className="flex flex-col">
                      {product.image ? (
                        <div className="relative h-40 overflow-hidden">
                          <img src={product.image} className="w-full h-full object-cover" />
                          <button onClick={() => setWishlist(prev => { const n = new Set(prev); liked ? n.delete(product.id) : n.add(product.id); return n; })} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center text-4xl bg-gradient-to-br from-indigo-900/20 to-purple-900/10">🛍️</div>
                      )}
                      <div className="p-3 flex flex-col gap-2">
                        <h3 className="text-white font-bold text-xs leading-tight line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="font-black text-sm" style={{ color: primaryHex }}>{currency}{product.price}</p>
                          {qty === 0 ? (
                            <button onClick={() => addToCart(product)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs text-white cursor-pointer" style={{ background: primaryHex }}>
                              <Plus className="h-3 w-3" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => removeFromCart(product.id)} className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer">
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="text-white font-black text-xs w-4 text-center">{qty}</span>
                              <button onClick={() => addToCart(product)} className="h-6 w-6 rounded-lg flex items-center justify-center cursor-pointer text-white" style={{ background: primaryHex }}>
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky cart bar */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.button
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            onClick={() => { setShowCart(true); setCheckoutStep("cart"); }}
            className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto z-50 py-4 rounded-2xl text-white font-black text-sm flex items-center justify-between px-5 cursor-pointer shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${primaryHex}, ${primaryHex}cc)`, boxShadow: `0 0 40px ${primaryHex}50` }}
          >
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">{cartCount}</span>
            <span>{isFood ? "View Order" : "View Cart"}</span>
            <span className="font-black">{currency}{cartTotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart / Checkout Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(2,4,10,0.85)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-[#0a0d18] border-t border-white/10 rounded-t-[2rem] max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                  {checkoutStep !== "cart" && checkoutStep !== "done" && (
                    <button onClick={() => setCheckoutStep(checkoutStep === "pay" ? "address" : "cart")} className="mr-1 cursor-pointer">
                      <ArrowLeft className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  <h2 className="text-white font-black text-lg">
                    {checkoutStep === "cart" ? (isFood ? "Your Order" : "Cart") : checkoutStep === "address" ? "Delivery Details" : checkoutStep === "pay" ? "Payment" : "Order Placed!"}
                  </h2>
                </div>
                <button onClick={() => setShowCart(false)} className="cursor-pointer text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4">

                {/* STEP: Cart */}
                {checkoutStep === "cart" && (
                  <div className="flex flex-col gap-3">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center py-12 gap-3">
                        <div className="text-5xl opacity-30">🛒</div>
                        <p className="text-gray-500 text-sm">Your cart is empty</p>
                      </div>
                    ) : (
                      <>
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3">
                            {item.image && <img src={item.image} className="h-12 w-12 rounded-xl object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm truncate">{item.name}</p>
                              <p className="font-bold text-sm mt-0.5" style={{ color: primaryHex }}>{currency}{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => removeFromCart(item.id)} className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-white font-black text-sm w-5 text-center">{item.qty}</span>
                              <button onClick={() => addToCart(item)} className="h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer text-white" style={{ background: primaryHex }}>
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 flex flex-col gap-2 mt-2">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span>{currency}{cartTotal.toFixed(2)}</span>
                          </div>
                          {isFood && store.settings?.deliveryFee !== undefined && (
                            <div className="flex justify-between text-sm text-gray-400">
                              <span>Delivery</span>
                              <span>{store.settings.deliveryFee === 0 ? "Free" : `${currency}${store.settings.deliveryFee}`}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-white text-base border-t border-white/8 pt-2 mt-1">
                            <span>Total</span>
                            <span style={{ color: primaryHex }}>{currency}{(cartTotal + (isFood ? (store.settings?.deliveryFee || 0) : 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP: Address */}
                {checkoutStep === "address" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Your Name *</label>
                      <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Full name" className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30" />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Phone *</label>
                      <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="+880 1234 567890" className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30" />
                    </div>
                    {isFood && (
                      <div>
                        <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1.5 block">Delivery Address *</label>
                        <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="House, street, area..." rows={3} className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none" />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP: Pay */}
                {checkoutStep === "pay" && (
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-400 text-sm">Choose payment method</p>
                    {[
                      { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when you receive" },
                      { id: "bkash", label: "bKash", icon: "💳", desc: "Mobile banking" },
                      { id: "card", label: "Card", icon: "💳", desc: "Visa / Mastercard" }
                    ].map(m => (
                      <div key={m.id} className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition">
                        <span className="text-2xl">{m.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{m.label}</p>
                          <p className="text-gray-500 text-xs">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP: Done */}
                {checkoutStep === "done" && orderPlaced && (
                  <div className="flex flex-col items-center text-center gap-5 py-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-6xl">
                      {orderPlaced.status === "delivered" ? "📦" : "🎉"}
                    </motion.div>
                    <div>
                      <h3 className="text-white font-black text-xl">
                        {orderPlaced.status === "delivered" ? "Delivered!" : "Order Placed!"}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">#{orderPlaced.id?.substring(6, 14).toUpperCase()}</p>
                    </div>

                    {/* Status steps */}
                    <div className="w-full flex items-center justify-between gap-1">
                      {statusSteps.map((step, i) => (
                        <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm border-2 ${i <= currentStatusIdx ? "border-transparent" : "border-white/15 bg-white/5"}`}
                            style={i <= currentStatusIdx ? { background: primaryHex } : {}}
                          >
                            {i <= currentStatusIdx ? "✓" : step.icon}
                          </div>
                          <p className={`text-[9px] font-bold ${i <= currentStatusIdx ? "text-white" : "text-gray-600"}`}>{step.label}</p>
                          {i < statusSteps.length - 1 && (
                            <div className={`absolute ml-16 h-0.5 w-8 ${i < currentStatusIdx ? "" : "bg-white/10"}`} style={i < currentStatusIdx ? { background: primaryHex } : {}} />
                          )}
                        </div>
                      ))}
                    </div>

                    {orderPlaced.riderName && (
                      <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <div className="text-3xl">🏍️</div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] text-indigo-300 font-bold uppercase">Your Rider</p>
                          <p className="text-white font-black text-base">{orderPlaced.riderName}</p>
                          <p className="text-gray-400 text-xs">{orderPlaced.riderPhone}</p>
                        </div>
                        {orderPlaced.riderPhone && (
                          <a href={`tel:${orderPlaced.riderPhone}`} className="h-9 w-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-indigo-400" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="px-5 pb-6 pt-3 border-t border-white/8 shrink-0">
                {checkoutStep === "cart" && cart.length > 0 && (
                  <button onClick={() => setCheckoutStep("address")} className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer flex items-center justify-between px-5" style={{ background: primaryHex }}>
                    <span>Proceed</span>
                    <span>{currency}{cartTotal.toFixed(2)}</span>
                  </button>
                )}
                {checkoutStep === "address" && (
                  <button
                    disabled={!buyerName || !buyerPhone}
                    onClick={() => setCheckoutStep("pay")}
                    className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer disabled:opacity-50"
                    style={{ background: primaryHex }}
                  >
                    Continue to Payment →
                  </button>
                )}
                {checkoutStep === "pay" && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-4 rounded-2xl text-white font-black text-base cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                    style={{ background: primaryHex }}
                  >
                    {isPlacingOrder ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <><Zap className="h-5 w-5" /> Place Order</>
                    )}
                  </button>
                )}
                {checkoutStep === "done" && (
                  <button onClick={() => setShowCart(false)} className="w-full py-4 rounded-2xl text-white font-bold text-sm cursor-pointer bg-white/10 border border-white/15 hover:bg-white/15 transition">
                    Continue Shopping
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
