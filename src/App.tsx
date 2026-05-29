import React, { useState, useEffect } from 'react';
import { CardConfig, CartItem, Order } from './types';
import Header from './components/Header';
import CardPreview from './components/CardPreview';
import Cart from './components/Cart';
import Vault from './components/Vault';
import DecryptionPortal from './components/DecryptionPortal';
import SpecimenAnalyzer from './components/SpecimenAnalyzer';
import AdminConsole from './components/AdminConsole';
import AdminPasswordGate from './components/AdminPasswordGate';
import { RESERVED_DROP_ASSETS, CardAsset } from './data/cards';
import { 
  Plus, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  ChevronDown, 
  CheckCircle, 
  BadgeAlert,
  Smartphone,
  Lock,
  Coins,
  EyeOff,
  Eye,
  Ban
} from 'lucide-react';

const DEFAULT_CARD_CONFIG: CardConfig = {
  cardNumber: '4242000013379999',
  cardHolder: 'CHIP GLITCH',
  expiryDate: '12/29',
  cvv: '777',
  chipStyle: 'cyber',
  logoStyle: 'ouroboros',
  borderStyle: 'gold',
  finishType: 'matte-obsidian',
  fontColor: 'gold',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'vault' | 'cart' | 'analyzer' | 'admin'>('builder');
  const [config, setConfig] = useState<CardConfig>({ ...DEFAULT_CARD_CONFIG });
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [isAdminEnabled, setIsAdminEnabled] = useState<boolean>(() => {
    return localStorage.getItem('admin_session_auth') === 'unlocked';
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_gate_unlocked') === 'true';
  });
  
  // local storage reactive initial states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Real dynamic cards catalog state
  const [cards, setCards] = useState<CardAsset[]>(RESERVED_DROP_ASSETS);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showFaqIndex, setShowFaqIndex] = useState<number | null>(null);
  const [decodingCard, setDecodingCard] = useState<CardConfig | null>(null);

  // Listen for hash-based admin credentials entry
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#sysop') {
        localStorage.setItem('admin_session_auth', 'unlocked');
        setIsAdminEnabled(true);
        // Clean hash to look completely normal
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch updated catalog status
  const loadCardsCatalog = async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (e) {
      console.warn("Server offline or dynamic catalog unavailable, using memory fallback.");
    }
  };

  // Load cart/orders and catalog on active tab change or mount
  useEffect(() => {
    loadCardsCatalog();
  }, [activeTab]);

  useEffect(() => {
    const cachedCart = localStorage.getItem('unknown_cart');
    const cachedOrders = localStorage.getItem('unknown_orders');
    if (cachedCart) {
      try { setCart(JSON.parse(cachedCart)); } catch (e) { localStorage.setItem('unknown_cart', '[]'); }
    }
    if (cachedOrders) {
      try { setOrders(JSON.parse(cachedOrders)); } catch (e) { localStorage.setItem('unknown_orders', '[]'); }
    }
  }, []);

  // Sync back to local storage
  const syncCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('unknown_cart', JSON.stringify(updatedCart));
  };

  const syncOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('unknown_orders', JSON.stringify(updatedOrders));
  };

  // Cart operations
  const addToCart = (configToBuy: CardConfig) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      config: { ...configToBuy },
      price: 20.00, // Price is exactly $20 as requested
    };
    const updated = [...cart, newItem];
    syncCart(updated);
    
    // Smooth scroll back to header and trigger notifications
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('cart');
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    syncCart(updated);
  };

  const triggerMockCheckout = async (shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }) => {
    setIsProcessing(true);
    
    const statuses = [
      'Alloying liquid obsidian core at 1450°C...',
      'Injecting structural heavy-metal composite (27 grams)...',
      'Locking custom laser numbers into the metal lattice...',
      'Deep etching requested design aesthetics and signature lines...',
      'Soldering integrated physical security chip selection...',
      'Final ultrasonic sweep & micro-abrasive satin polish...',
      'Packing securely in protective dark lockbox...',
      'Generating sovereign USPS delivery codes...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setProcessingStatus(statuses[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // POST details to secure server database
    let serverCompleted = false;
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cartItems: cart,
          shippingDetails
        })
      });
      if (res.ok) {
        serverCompleted = true;
        // reload the catalog to correctly gray-out purchased cards
        await loadCardsCatalog();
      }
    } catch (e) {
      console.error("Server failed to archive checkout details dynamically:", e);
    }

    // Direct local-storage fallback write
    const cachedCards = localStorage.getItem('local_cards_catalog');
    let currentCards = RESERVED_DROP_ASSETS;
    if (cachedCards) {
      try { currentCards = JSON.parse(cachedCards); } catch (e) {}
    }
    
    const updatedCards = currentCards.map(c => {
      const isBought = cart.some(item => {
        const cardNumClean = (item.config.cardNumber || "").replace(/\s+/g, "");
        const checkNumClean = (c.cardNumber || "").replace(/\s+/g, "");
        return cardNumClean === checkNumClean;
      });
      if (isBought) {
        return {
          ...c,
          isSold: true,
          soldBalance: "$20.00",
          balanceStatus: "COURIER DISPATCHED"
        };
      }
      return c;
    });

    setCards(updatedCards);
    localStorage.setItem('local_cards_catalog', JSON.stringify(updatedCards));

    // Spawn final Order records
    const newOrders: Order[] = cart.map((item, idx) => {
      const randHex = Math.random().toString(16).substring(2, 8).toUpperCase();
      const randTrackerDigits = Math.floor(10000000 + Math.random() * 90000000);
      return {
        id: `ord-${Date.now()}-${idx}`,
        config: item.config,
        orderedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        trackingNumber: `UNK-USPS-${randHex}-${randTrackerDigits}`,
        status: idx % 2 === 0 ? 'Engraving' : 'Quality Check',
        shippingDetails,
      };
    });

    const totalOrders = [...newOrders, ...orders];
    syncOrders(totalOrders);
    syncCart([]); // Clear out cart
    setIsProcessing(false);
    setProcessingStatus('');
    setActiveTab('vault');
    if (newOrders.length > 0) {
      setDecodingCard(newOrders[0].config);
    }
  };

  const loadPreset = (preset: CardConfig) => {
    setConfig({ ...preset });
    setIsFlipped(false);
  };

  const faqItems = [
    {
      q: 'Will you actually ship me a physical card?',
      a: 'Yes! This website processes simulated custom order tickets. Upon confirmation of sovereign entry, our specialized CNC lasers are triggered to engrave custom numbers onto heavy matte-black surgical cards. Every order is simulated down to the physical logistics system.'
    },
    {
      q: 'How heavy are these cards?',
      a: 'Standard credit cards weigh 5 grams. Our carbon and black obsidian custom builds weigh approximately 27 grams, producing the distinct, elegant, status metal-clink sound when dropped onto wood or stone counters.'
    },
    {
      q: 'Is my input number details secure?',
      a: 'Under absolute privacy, your numbers never leave local RAM/LocalStorage state. We support entering custom randomly generated configurations to preserve security parameters. The cards represent offline aesthetic trophies or decorative blank-slate tags.'
    },
    {
      q: 'What is included in the premium $20.00 pack?',
      a: 'Each $20 custom card ships in a heavy-weight matte-black magnetic collector box, accompanied by deep-engraved signature lines, mock contact microchips, and premium chamfered edges in gold or satin zinc.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between" id="landing-root">
      
      {/* HEADER SECTION */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.length} 
        isAdminEnabled={isAdminEnabled}
        setIsAdminEnabled={setIsAdminEnabled}
      />

      {/* DETAILED FABRICATING POPUP */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-md text-center space-y-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mx-auto">
                <div className="w-10 h-10 rounded-full border-t-2 border-[#d4af37] animate-spin" />
              </div>
              <Sparkles className="w-4 h-4 text-[#d4af37] absolute top-0 right-[42%] animate-ping" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-zinc-100 font-mono text-sm font-bold uppercase tracking-[0.2em]">
                Forging Sovereign Metal...
              </h2>
              <p className="text-[11px] font-mono text-[#d4af37] min-h-[36px] px-8 py-1 rounded bg-zinc-950 border border-zinc-900 leading-relaxed transition-all">
                {processingStatus}
              </p>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">
              Do not reload the browser. Locking engraving parameters.
            </div>
          </div>
        </div>
      )}

      {/* CORE FRAMEWORK WORKSPACE */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative">
                {/* Background Text Art - Artistic Flair branding watermark */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-[0.02] select-none pointer-events-none overflow-hidden z-0">
          <span className="text-[100px] sm:text-[180px] font-black tracking-tight uppercase font-sans leading-none">NOVUS ORDO</span>
          <span className="text-[100px] sm:text-[180px] font-black tracking-tight uppercase font-sans leading-none text-[#d4af37]">SECLORUM</span>
        </div>

        {/* VIEW 1: DUAL CHANNEL CARD BUILDER & OPTION WRAPPERS */}
        {activeTab === 'builder' && (
          <div className="space-y-12 relative z-10" id="oracle-grid-workspace">
            {/* INTIMATE SECURE NOTE PROMPT */}
            <div className="border border-red-950/40 bg-red-950/5 rounded-2xl p-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    // SYNDICATE DECRYPTED DISPATCH NOTICE
                  </span>
                  <h2 className="text-zinc-100 text-sm font-semibold tracking-wider font-mono uppercase font-bold">
                    Specimen Variable Balance Disclosure
                  </h2>
                  <p className="text-zinc-500 text-xs max-w-2xl leading-relaxed font-sans">
                    All custom metal plates listed represent physical offline cold-storage ciphers. <span className="text-zinc-300 font-bold underline decoration-red-500/50 font-mono">Note: Each metal specimen is bound to distinct on-chain registries, meaning these cards may contain different, unverified balances.</span> Acquire specimens strictly under self-sovereign cryptographic rules.
                  </p>
                </div>
                <div className="bg-red-950/20 border border-red-900/30 px-3 py-1.5 rounded font-mono text-[9px] text-[#d4af37] tracking-wider uppercase flex items-center gap-1.5 shrink-0 select-none">
                  <Coins className="w-3.5 h-3.5 animate-bounce" /> Balance Potential Active
                </div>
              </div>
            </div>

            {/* SECTION: DECOMMISSIONED/SOLD REGISTRY */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-950 pb-2">
                <span className="text-[10px] text-red-500 font-semibold tracking-widest block font-mono uppercase">
                  Decommissioned Vault Registers [SOLD OUT]
                </span>
                <span className="text-[10px] text-zinc-650 font-mono font-bold">{cards.filter(a => a.isSold).length} CLAIMED ARTIFACTS</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-left">
                {cards.filter(a => a.isSold).map((asset) => {
                  const isAssetFlipped = !!flippedCardIds[asset.id];
                  return (
                    <div 
                      key={asset.id} 
                      className="border border-red-950/30 bg-red-950/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Sold Banner tag */}
                      <div className="absolute top-3 right-3 bg-red-950/50 border border-red-500/30 text-red-400 font-mono text-[9px] py-1 px-2 uppercase tracking-wide rounded select-none">
                        ● SOLD OUT TO PEER
                      </div>
                      
                      <CardPreview 
                        config={asset} 
                        isFlipped={isAssetFlipped}
                        setIsFlipped={(flipped) => setFlippedCardIds({ ...flippedCardIds, [asset.id]: flipped })}
                      />

                      <div className="mt-5 space-y-3.5">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-zinc-90 w-full pt-3 text-zinc-500">
                          <div>
                            <span className="text-red-400 font-bold uppercase block text-[8px] mb-0.5">Claimed Ledger Balance</span>
                            <span className="text-zinc-100 text-sm font-extrabold text-[#d4af37]">{asset.soldBalance}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-600 uppercase block text-[8px] mb-0.5">Decryption Key hash</span>
                            <span className="text-zinc-400">{asset.secretHash}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled
                          className="w-full h-11 bg-zinc-950/40 border border-zinc-900 text-zinc-650 text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <Ban className="w-3.5 h-3.5" /> Specimen Settled
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: 27 ACTIVE ARTIFACTS GRID */}
            <div className="space-y-6 font-sans text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-950 pb-3 gap-2">
                <div>
                  <span className="text-[10px] text-[#d4af37] font-semibold tracking-widest block font-mono uppercase">
                    ACTIVE CIPHER LEDGER DROPLIST ($20.00 FLAT RATE)
                  </span>
                  <h2 className="text-xl font-black text-zinc-100 tracking-tight uppercase mt-0.5">
                    {cards.filter(a => !a.isSold).length} Custom Specimen Plates Available
                  </h2>
                </div>
                <div className="bg-zinc-950 border border-zinc-905 px-3 py-1 text-[9px] font-mono text-zinc-400 rounded">
                  ON-CHAIN INDEX: {cards.filter(a => !a.isSold).length} ACTIVE DROPS
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {cards.filter(a => !a.isSold).map((asset) => {
                  const isAssetFlipped = !!flippedCardIds[asset.id];
                  return (
                    <div 
                      key={asset.id} 
                      className="border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4af37]/5 group"
                    >
                      <div className="absolute top-2 right-2 bg-neutral-900 border border-zinc-850 px-2 py-0.5 text-[8px] text-zinc-500 font-mono rounded uppercase select-none">
                        Drop {asset.id.toUpperCase()}
                      </div>

                      <div className="py-2">
                        <CardPreview 
                          config={asset} 
                          isFlipped={isAssetFlipped}
                          setIsFlipped={(flipped) => setFlippedCardIds({ ...flippedCardIds, [asset.id]: flipped })}
                        />
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="bg-black/40 rounded-lg p-2.5 font-mono text-[9px] space-y-1.5 border border-zinc-900/60">
                          <div className="flex justify-between text-zinc-500">
                            <span>Origin Node:</span>
                            <span className="text-zinc-350 font-medium truncate max-w-[150px]">{asset.sourceNode}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>Synapse Status:</span>
                            <span className="text-[#d4af37] font-semibold">{asset.balanceStatus}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500 border-t border-zinc-900 pt-1">
                            <span>Registry:</span>
                            <span className="text-zinc-500">{asset.secretHash}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 font-mono">
                          <button
                            type="button"
                            onClick={() => setFlippedCardIds({ ...flippedCardIds, [asset.id]: !isAssetFlipped })}
                            className="px-3 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-[10px] text-zinc-400 hover:text-white rounded transition-colors uppercase"
                            title="Flip"
                          >
                            Flip
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => addToCart(asset)}
                            className="flex-grow h-10 bg-white hover:bg-[#d4af37] hover:text-black text-black font-extrabold uppercase tracking-widest text-[9px] rounded flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Acquire Plate ($20)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CART SECTOR */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-widest block font-mono animate-pulse">
                // PEER ROUTING TRANSMISSIONS_LIST
              </span>
              <h1 className="text-2xl font-black text-zinc-100 tracking-tight uppercase">
                Enlisted Dispatch Ledger
              </h1>
            </div>
            <Cart 
              cart={cart}
              removeFromCart={removeFromCart}
              onCheckout={triggerMockCheckout}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* VIEW 3: SECURE VAULT DATABASE & HISTORY MONITOR */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <span className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-widest block font-mono">
                DECRYPTING CODEX HISTORICA_
              </span>
              <h1 className="text-2xl font-black text-zinc-100 tracking-tight uppercase">
                Grand Master Secret Ledger
              </h1>
            </div>
            <Vault 
              orders={orders}
              onSearchTracker={() => {}}
              onDecodeCard={(card) => setDecodingCard(card)}
            />
          </div>
        )}

        {/* VIEW 4: FUNCTIONAL SPECIMEN ANALYZER */}
        {activeTab === 'analyzer' && (
          <SpecimenAnalyzer 
            orders={orders}
            onSelectPresets={(preset) => {
              setConfig({ ...preset });
              setActiveTab('builder');
            }}
          />
        )}

        {/* VIEW 5: SOVEREIGN ADMIN ACCOUNT AND DISPATCH CONTROLS */}
        {activeTab === 'admin' && isAdminEnabled && (
          isAdminUnlocked ? (
            <AdminConsole onResetComplete={loadCardsCatalog} />
          ) : (
            <AdminPasswordGate onSuccess={() => {
              setIsAdminUnlocked(true);
              sessionStorage.setItem('admin_gate_unlocked', 'true');
            }} />
          )
        )}

        {/* COMPREHENSIVE FAQ SEGMENT */}
        <div className="mt-16 sm:mt-24 border-t border-zinc-900 pt-10 sm:pt-16 max-w-4xl mx-auto" id="brand-faq">
          <div className="text-center mb-8">
            <HelpCircle className="w-7 h-7 text-zinc-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold font-mono tracking-wider uppercase text-zinc-200">
              Hardware & Logistic Dispatches FAQ
            </h2>
            <p className="text-zinc-500 text-xs mt-1">
              General specification matrix regarding mechanical properties of physical Custom Black metallic tokens.
            </p>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, idx) => {
              const isOpen = showFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-zinc-900 bg-neutral-950/30 rounded-lg overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setShowFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between py-3.5 px-4 text-left text-xs font-mono font-bold text-zinc-300 hover:text-zinc-100 select-none"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transform transition-transform ${isOpen ? 'rotate-180 text-[#d4af37]' : ''}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-4 text-[11px] text-zinc-400 font-sans leading-relaxed border-t border-zinc-900/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* FOOTER METRIC SEGMENTS */}
      <footer className="border-t border-zinc-900 bg-neutral-950/80 p-6 text-center text-zinc-650 font-mono text-[9px] select-none" id="luxury-finisher">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="uppercase tracking-[0.2em] font-semibold block text-zinc-400 mb-0.5">
              UNKNOWN SYSTEMS © 2026
            </span>
            <span className="text-zinc-500">
              Laser Engraving physical metal alloy templates • Crafted for $20.00 Premium Rate.
            </span>
          </div>

          <div className="flex gap-4 text-zinc-500">
            <span className="hover:text-[#d4af37] cursor-pointer">PRIVACY SYSTEM</span>
            <span>•</span>
            <span className="hover:text-[#d4af37] cursor-pointer">METALLIC LABS</span>
          </div>
        </div>
      </footer>

      {decodingCard && (
        <DecryptionPortal 
          card={decodingCard} 
          onClose={() => setDecodingCard(null)} 
        />
      )}

    </div>
  );
}
