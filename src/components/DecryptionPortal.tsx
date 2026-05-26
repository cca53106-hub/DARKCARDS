import React, { useState, useEffect } from 'react';
import { CardConfig } from '../types';
import { 
  X, 
  Cpu, 
  Terminal, 
  Unlock, 
  Coins, 
  Wallet, 
  ArrowRight,
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Gift,
  CheckCircle2,
  Lock,
  Timer
} from 'lucide-react';
import CardPreview from './CardPreview';

interface DecryptionPortalProps {
  card: CardConfig;
  onClose: () => void;
}

type WithdrawalMethod = 'binance' | 'paypal' | 'btc' | 'visa' | 'pubg' | 'freefire';

export default function DecryptionPortal({ card, onClose }: DecryptionPortalProps) {
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptionStage, setDecryptionStage] = useState<'scanning' | 'ready' | 'withdrawing' | 'withdrawn'>('scanning');
  const [logs, setLogs] = useState<string[]>([]);
  const [discoveredBalance, setDiscoveredBalance] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>('binance');
  const [withdrawalAccount, setWithdrawalAccount] = useState('');
  const [withdrawalProgress, setWithdrawalProgress] = useState(0);
  const [withdrawalLogs, setWithdrawalLogs] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Custom user-defined withdrawal states
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [lastWithdrawnAmount, setLastWithdrawnAmount] = useState<number>(0);
  const [inputError, setInputError] = useState<string>('');
  const [etaSeconds, setEtaSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Dynamic server approval status states
  const [serverStatus, setServerStatus] = useState<'pending' | 'approved' | 'declined' | null>(null);
  const [serverExcuse, setServerExcuse] = useState<string>('');

  // Generate a realistic high-value jackpot for a fun experience using localStorage to save adjustments, capped under $5000
  useEffect(() => {
    const key = `card_balance_${card.cardNumber}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      let val = isNaN(parsed) ? 0 : parsed;
      if (val > 5000) {
        val = 4950; // Cap to maximum 4950
        localStorage.setItem(key, val.toString());
      }
      setDiscoveredBalance(val);
      setWithdrawalAmount(val.toString());
    } else {
      // Generate balance based on card holder or random seed, strictly under $5,000
      const seed = card.cardHolder.length + (parseInt(card.cardNumber.slice(-4)) || 5);
      const min = 1500;
      const max = 4950;
      const balance = min + ((seed * 313) % (max - min));
      setDiscoveredBalance(balance);
      setWithdrawalAmount(balance.toString());
      localStorage.setItem(key, balance.toString());
    }
  }, [card]);

  // Poll the server for withdrawal status and 48hr timer updates
  useEffect(() => {
    const checkWithdrawalStatus = async () => {
      let isFetchedFromApi = false;
      try {
        const res = await fetch(`/api/withdrawals/${encodeURIComponent(card.cardNumber)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.withdrawal) {
            isFetchedFromApi = true;
            const wt = data.withdrawal;
            setServerStatus(wt.status);
            setServerExcuse(wt.excuse || '');
            setEtaSeconds(wt.etaSeconds);
            setTimerActive(wt.status === 'pending' && wt.etaSeconds > 0);
            
            // Elevate client to withdrawn view immediately if record is verified on the backend
            if (decryptionStage === 'scanning' || decryptionStage === 'ready') {
              setDecryptionStage('withdrawn');
              setWithdrawalAccount(wt.account || '');
              setSelectedMethod(wt.method || 'binance');
              setLastWithdrawnAmount(wt.amount || 0);
            }
          }
        }
      } catch (e) {
        console.warn("[TELEMETRY] Failed to fetch withdrawal details from database, utilizing local cache fallback.");
      }

      // If API failed or is offline/not found (like on pure static Vercel), fallback to client-side localStorage state
      if (!isFetchedFromApi) {
        const savedWtsStr = localStorage.getItem('local_withdrawals');
        if (savedWtsStr) {
          try {
            const savedWts = JSON.parse(savedWtsStr);
            const cardNumClean = card.cardNumber.replace(/\s+/g, '');
            const wt = savedWts.find((w: any) => w.cardNumber.replace(/\s+/g, '') === cardNumClean);
            if (wt) {
              setServerStatus(wt.status);
              setServerExcuse(wt.excuse || '');
              const now = Date.now();
              const remaining = Math.max(0, Math.floor((wt.etaTarget - now) / 1000));
              setEtaSeconds(remaining);
              setTimerActive(wt.status === 'pending' && remaining > 0);
              
              if (decryptionStage === 'scanning' || decryptionStage === 'ready') {
                setDecryptionStage('withdrawn');
                setWithdrawalAccount(wt.account || '');
                setSelectedMethod(wt.method || 'binance');
                setLastWithdrawnAmount(wt.amount || 0);
              }
            }
          } catch (e) {
            console.error("Local withdrawal cache read failed:", e);
          }
        }
      }
    };

    checkWithdrawalStatus();
    const pollInterval = setInterval(checkWithdrawalStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [card.cardNumber, decryptionStage]);

  // Decode logs typing animation loop
  useEffect(() => {
    if (decryptionStage !== 'scanning') return;

    const logList = [
      `[CRITICAL] Initialized sub-harmonic decryption socket...`,
      `[CONNECT] Connecting to decentralized node: Berlin Railway Junction...`,
      `[SECURITY] Bypass secure sandbox protocols initiated (1024-bit key)`,
      `[METRIC] Target physical plate: Master Artifact ID [${card.cardNumber.slice(0,4)}...]`,
      `[SCANNER] Reading magnetic stripe sector hashes...`,
      `[DECODE] Extracting raw chip microcode sequences...`,
      `[LEDGER] Querying decentralized master blocks for unlogged coordinate balances...`,
      `[VERIFY] Intersecting cryptographic signatures with on-chain nodes...`,
      `[ALERT] Cryptographic balance leak found! Extracting values...`,
      `[SUCCESS] Decoding matrix completed. Ready for sovereign extraction.`,
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logList.length) {
        setLogs(prev => [...prev, logList[currentLogIndex]]);
        setDecryptionProgress(Math.floor(((currentLogIndex + 1) / logList.length) * 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDecryptionStage('ready');
        }, 800);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [decryptionStage, card]);

  // Active countdown effect for pending withdraw timer
  useEffect(() => {
    if (!timerActive || etaSeconds <= 0) return;
    const interval = setInterval(() => {
      setEtaSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, etaSeconds]);

  const formatTimer = (secs: number) => {
    if (secs <= 0) return "TIME ELAPSED";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // Simulation of withdrawal logs sequence
  const startMockWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAccount.trim()) return;

    // The extraction amount is dynamically decided by the administrator prior to approval status release
    const amountToWithdraw = 0;

    setInputError('');
    setLastWithdrawnAmount(0);

    setDecryptionStage('withdrawing');
    setWithdrawalProgress(0);
    setWithdrawalLogs([]);

    const methodLabels: Record<WithdrawalMethod, string> = {
      binance: 'Binance Pay Instant Escrow',
      paypal: 'PayPal Merchant Gateway Proxy',
      btc: 'Mainnet Bitcoin Ledger SegWit',
      visa: 'Visa Plus Card Gateway Direct',
      pubg: 'PUBG Mobile UC Official Top-Up',
      freefire: 'Garena Free Fire Diamonds Top-Up'
    };

    const isGaming = selectedMethod === 'pubg' || selectedMethod === 'freefire';
    const amountLabel = "[Awaiting Administrator Audit Release Balance]";

    const wLogs = [
      `[INIT] Routing withdrawal request for ${amountLabel} value...`,
      `[GATEWAY] Contacting custom secure target gateway: ${methodLabels[selectedMethod]}`,
      isGaming 
        ? `[SECURITY] Verified Game character Player UID designated: ${withdrawalAccount}`
        : `[SECURITY] Account designated: ${withdrawalAccount}`,
      `[PROXY] Bypassing localized centralized tax reporting nodes via TR-9 onion relay...`,
      isGaming
        ? `[CONTRACT] Securing specialized digital item API token voucher codes...`
        : `[CONTRACT] Signing decentralized cash payload using 12-of-16 multisig keys...`,
      `[LEDGER] Broadcast transaction sequence initiated to mempool...`,
      `[ALERT] Reversible protocol matching approved by verification bot...`,
      isGaming
        ? `[VERIFY] Syncing global game distributor delivery nodes...`
        : `[VERIFY] Syncing secondary secure deposit channels...`,
      `[COMPLETED] Transfer registered in queue sequence successfully.`
    ];

    let index = 0;
    const timer = setInterval(() => {
      if (index < wLogs.length) {
        setWithdrawalLogs(prev => [...prev, wLogs[index]]);
        setWithdrawalProgress(Math.floor(((index + 1) / wLogs.length) * 100));
        index++;
      } else {
        clearInterval(timer);
        
        // Standard client-side state logging for instant backup
        const localWithdrawalData = {
          id: `wth-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cardNumber: card.cardNumber,
          cardHolder: card.cardHolder || "Anonymous Peer",
          amount: amountToWithdraw,
          method: selectedMethod,
          account: withdrawalAccount,
          status: 'pending',
          excuse: null,
          etaTarget: Date.now() + 48 * 60 * 60 * 1000,
          createdAt: new Date().toISOString()
        };

        const savedWtsStr = localStorage.getItem('local_withdrawals');
        let savedWts = [];
        if (savedWtsStr) {
          try { savedWts = JSON.parse(savedWtsStr); } catch (e) {}
        }
        savedWts = savedWts.filter((w: any) => w.cardNumber.replace(/\s+/g, '') !== card.cardNumber.replace(/\s+/g, ''));
        savedWts.push(localWithdrawalData);
        localStorage.setItem('local_withdrawals', JSON.stringify(savedWts));

        // POST request to target Server's withdrawal dispatch API
        fetch('/api/withdrawals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cardNumber: card.cardNumber,
            cardHolder: card.cardHolder,
            amount: amountToWithdraw,
            method: selectedMethod,
            account: withdrawalAccount
          })
        })
        .then(async (res) => {
          if (!res.ok) throw new Error("Verification sync failed");
          const resJson = await res.json();
          setDecryptionStage('withdrawn');
          setEtaSeconds(48 * 60 * 60); // 48Hrs fallback timer
          setTimerActive(true);
          setServerStatus('pending');
        })
        .catch(err => {
          console.error("[DECRYPT] Server transaction initialization error:", err);
          // Fallback grace mode
          setDecryptionStage('withdrawn');
          setEtaSeconds(48 * 60 * 60);
          setTimerActive(true);
          setServerStatus('pending');
        });
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto py-6 px-4 md:py-12 flex justify-center items-start sm:items-center" id="decryption-portal-view">
      <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded-3xl p-5 md:p-8 relative overflow-hidden my-auto">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#d4af37] animate-spin" />
            <div>
              <span className="text-[10px] text-zinc-500 font-mono block tracking-widest uppercase">
                // SYSTEM CORE DECRYPTION LABORATORY v3.4
              </span>
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Deciphering Lab: Specimen {card.cardHolder || 'Anonymous'}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
            title="Disconnect Room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT PANEL: 3D CARD ROTATOR LAB VIEW */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-4">
            
            <div className="text-center">
              <span className="text-[9px] text-[#d4af37] font-semibold tracking-wider block font-mono uppercase mb-1">
                {decryptionStage === 'scanning' ? '● CURRENT STATE: HIGH ROTATIONAL SCANNING' : '🔓 DECRYPTED PHYSICAL SPECIMEN'}
              </span>
              <p className="text-[10px] text-zinc-500 max-w-xs font-mono">
                Observe the active sub-atomic coordinate structures of the metallic plate below.
              </p>
            </div>

            {/* THE AWESOME 3D ROTATION CANVAS */}
            <div className="relative p-6 bg-black/45 rounded-3xl border border-zinc-900/80 shadow-2xl w-full flex justify-center items-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
              
              {/* Continuous rotating wrapper class if scanning, or allows interactive flip */}
              <div className={`w-full max-w-sm transform-gpu ${
                decryptionStage === 'scanning' ? 'animate-spin-3d' : 'hover:scale-[1.02] transition-transform'
              }`}>
                {/* Embedded style in the rotation portal for gorgeous 3D continuous loop */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes spin3D {
                    0% { transform: rotateY(0deg) rotateX(12deg) rotateZ(1deg); }
                    50% { transform: rotateY(180deg) rotateX(-8deg) rotateZ(-1deg); }
                    100% { transform: rotateY(360deg) rotateX(12deg) rotateZ(1deg); }
                  }
                  .animate-spin-3d {
                    animation: spin3D 8s linear infinite;
                    transform-style: preserve-3d;
                    perspective: 1000px;
                  }
                `}} />
                
                <CardPreview 
                  config={card} 
                  isFlipped={isFlipped}
                  setIsFlipped={setIsFlipped}
                />
              </div>

              {/* Scanning neon grid laser line overlay */}
              {decryptionStage === 'scanning' && (
                <div className="absolute left-0 right-0 h-[2px] bg-red-500/70 shadow-[0_0_15px_#ef4444] top-0 animate-scanner-laser pointer-events-none" />
              )}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scannerLaser {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                .animate-scanner-laser {
                  animation: scannerLaser 3s infinite ease-in-out;
                }
              `}} />
            </div>

            {/* Static Balance Display Card */}
            {decryptionStage !== 'scanning' && (
              <div className="w-full bg-gradient-to-r from-neutral-900 to-black border border-[#d4af37]/30 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest block uppercase mb-1">
                  🎉 DISCOVERED LEDGER REVENUE BALANCE
                </span>
                <span className="text-3xl font-black font-mono text-zinc-100 tracking-tight">
                  ${discoveredBalance.toLocaleString()}.00 <span className="text-[#d4af37] text-sm">USD</span>
                </span>
                <div className="text-[9px] text-zinc-500 font-mono mt-1">
                  Decrypted Signature Key Hash: <span className="text-zinc-300">{(card as any).secretHash || `SECURE_0x${card.cardNumber.slice(0, 4)}F${card.cvv}D`}</span>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: SCROLLING MATRIX LOGS OR DECENTRALIZED WITHDRAWAL OPTIONS */}
          <div className="lg:col-span-6 text-left h-full">
            
            {/* PANEL SWITCHES */}
            {decryptionStage === 'scanning' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/50 border border-zinc-900 p-3 rounded-xl font-mono text-xs">
                  <span className="text-zinc-400 animate-pulse uppercase">Decrypting Array...</span>
                  <span className="text-[#d4af37] font-bold">{decryptionProgress}% Complete</span>
                </div>

                {/* MATRIX TERMINAL LOGS SCREEN */}
                <div className="bg-black border border-zinc-900/80 rounded-2xl p-4 h-80 overflow-y-auto font-mono text-[10px] space-y-2 text-zinc-400 select-none">
                  <div className="text-zinc-650 mb-2 border-b border-zinc-950 pb-1 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-red-500" /> ACTIVE DECRYPT_LOG CONNECTIONS
                  </div>
                  {logs.map((log, i) => (
                    <div key={i} className={`leading-normal ${(log || '').includes('[SUCCESS]') ? 'text-emerald-400' : (log || '').includes('[ALERT]') ? 'text-[#d4af37]' : 'text-zinc-450'}`}>
                      {log}
                    </div>
                  ))}
                  {/* Blinking CLI Cursor */}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-[#d4af37] animate-pulse" />
                    <span className="text-zinc-600 text-[8px] italic">Processing block arrays...</span>
                  </div>
                </div>

                <div className="bg-yellow-950/20 border border-yellow-500/20 p-4 rounded-2xl flex gap-3 text-zinc-500 text-[10px] leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-[#d4af37] shrink-0 animate-bounce" />
                  <div>
                    <strong className="text-zinc-300 block mb-0.5">ESTIMATED DECRYPTION STRENGTH:</strong>
                    Do not disconnect the laboratory session. Our neural bypass system is indexing standard unallocated coordinate records on the on-chain registry associated with this plate.
                  </div>
                </div>
              </div>
            )}

            {/* DEVIATION STAGE: READY FOR WITHDRAWAL */}
            {decryptionStage === 'ready' && (
              <div className="space-y-4 animate-fade-in">
                
                <div className="border border-emerald-950/60 bg-emerald-950/5 rounded-2xl p-4 text-zinc-300 text-xs flex gap-3 items-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white block uppercase text-[10px] tracking-wider font-mono">Decryption Successful</strong>
                    Revenue balance is ready for off-chain release transfer. Choose your secure withdrawal portal below.
                  </div>
                </div>

                <form onSubmit={startMockWithdrawal} className="space-y-4 relative bg-black/30 border border-zinc-900 rounded-2xl p-5">
                  <span className="text-[9px] text-[#d4af37] font-bold block tracking-widest font-mono uppercase">
                    // GATEWAY DISPATCH COURIER BOARD
                  </span>

                  {/* PAYMENT METHOD LISTS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {([
                      { id: 'binance', label: 'Binance Pay', sub: 'Instant USD' },
                      { id: 'paypal', label: 'PayPal', sub: 'No Fee USD' },
                      { id: 'btc', label: 'Bitcoin', sub: 'Secure Crypto' },
                      { id: 'visa', label: 'Card Direct', sub: 'Legacy Bank' },
                      { id: 'pubg', label: 'PUBG UC', sub: '1$ = 60 UC' },
                      { id: 'freefire', label: 'FreeFire', sub: '1$ = 100💎' }
                    ] as { id: WithdrawalMethod, label: string, sub: string }[]).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedMethod(method.id);
                          setWithdrawalAccount('');
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between items-start font-mono text-left transition-all ${
                          selectedMethod === method.id 
                            ? 'bg-[#d4af37]/10 border-[#d4af37] text-white shadow-[#d4af37]/5 space-y-1' 
                            : 'border-zinc-900 bg-black/60 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">{method.label}</span>
                        <span className="text-[8px] text-zinc-600 font-normal">{method.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* INPUT PORTAL */}
                  <div className="space-y-4">
                    
                    {/* Amount Input */}
                    <div className="space-y-1 bg-zinc-950/50 border border-zinc-900 px-4 py-3 rounded-xl">
                      <label className="block text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-wider mb-1">
                        Extraction Balance Coverage
                      </label>
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-zinc-200 font-bold text-xs font-mono">
                          FULL SOVEREIGN CIPHER RELEASE
                        </span>
                        <span className="text-[#d4af37] font-mono text-[8px] font-bold border border-[#d4af37]/30 bg-[#d4af37]/5 px-2 py-0.5 rounded">
                          AWAITING ADMIN AUDIT
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono leading-normal pt-1.5 border-t border-zinc-900/50 mt-1.5">
                        Your physical metal template index check passed. Our administrator group will audit, decide the approved ledger balance, and execute the final pay release directly.
                      </p>
                    </div>

                    {/* Account Input */}
                    <div className="space-y-1">
                      <label className="block text-[9px] text-zinc-400 uppercase font-mono font-bold tracking-wider">
                        {selectedMethod === 'binance' && 'Enter Binance Pay ID, Phone, or Email'}
                        {selectedMethod === 'paypal' && 'Enter PayPal Registered Email Address'}
                        {selectedMethod === 'btc' && 'Enter Bitcoin (BTC) Address'}
                        {selectedMethod === 'visa' && 'Enter Visa/MasterCard Account Number'}
                        {selectedMethod === 'pubg' && 'Enter PUBG Player Character UID'}
                        {selectedMethod === 'freefire' && 'Enter Garena Free Fire Player UID'}
                      </label>
                      <input
                        type="text"
                        required
                        value={withdrawalAccount}
                        onChange={(e) => setWithdrawalAccount(e.target.value)}
                        placeholder={
                          selectedMethod === 'binance' ? 'e.g. 985038599' :
                          selectedMethod === 'paypal' ? 'e.g. transfer@paypal.com' :
                          selectedMethod === 'btc' ? 'e.g. 1A1zP1eP5QGefi2D...' :
                          selectedMethod === 'visa' ? 'e.g. 4000 1234 5678 9012' :
                          selectedMethod === 'pubg' ? 'e.g. Player UID (Character ID, e.g. 512398579)' : 'e.g. Player UID (Diamonds ID, e.g. 88371923)'
                        }
                        className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 outline-none rounded-xl py-2.5 px-3 text-xs focus:border-[#d4af37] font-mono font-semibold placeholder-zinc-750"
                      />
                    </div>

                  </div>

                  <div className="bg-red-950/10 border border-red-900/10 p-3 rounded-lg flex items-start gap-1.5 text-zinc-500 text-[9.5px]">
                    <AlertTriangle className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                    <span>
                      Standard withdrawal buffer clearing rules apply. All unbacked revenues are generated strictly within the Sovereign Fun Game sandbox simulation.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#d4af37] hover:bg-yellow-500 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    INITIATE CIPHER BALANCE RELEASE EXTRACTION <ArrowRight className="w-4 h-4" />
                  </button>

                </form>

              </div>
            )}

            {/* WITHDRAWING LOADER TERMINAL */}
            {decryptionStage === 'withdrawing' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center bg-black/50 border border-zinc-900 p-3 rounded-xl font-mono text-xs">
                  <span className="text-zinc-400 animate-pulse uppercase">Escrowing Funds...</span>
                  <span className="text-[#d4af37] font-bold">{withdrawalProgress}% Registered</span>
                </div>

                <div className="bg-black border border-zinc-900 rounded-2xl p-4 h-80 overflow-y-auto font-mono text-[10px] space-y-2 text-zinc-400 select-none">
                  <div className="text-zinc-650 mb-2 border-b border-zinc-950 pb-1 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-yellow-500 animate-pulse" /> ROUTING ESCROW TRANSFERS
                  </div>
                  {withdrawalLogs.map((log, i) => (
                    <div key={i} className={`leading-normal ${(log || '').includes('[COMPLETED]') ? 'text-emerald-400' : (log || '').includes('[ALERT]') ? 'text-[#d4af37]' : 'text-zinc-500'}`}>
                      {log}
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-yellow-500 animate-pulse" />
                    <span className="text-zinc-600 text-[8px] italic">Propagating blocks to nodes...</span>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETED/PENDING WITHDRAWAL REPORT SCREEN */}
            {decryptionStage === 'withdrawn' && (() => {
              const isPending = serverStatus === 'pending' || (serverStatus === null && etaSeconds > 0);
              const isApproved = serverStatus === 'approved' || (serverStatus === null && etaSeconds <= 0);
              const isDeclined = serverStatus === 'declined';

              let cardBgClass = 'border-yellow-500/30 bg-yellow-950/5';
              if (isApproved) cardBgClass = 'border-emerald-500/30 bg-emerald-950/10';
              if (isDeclined) cardBgClass = 'border-red-500/30 bg-red-950/10';

              return (
                <div className="space-y-4 animate-fade-in">
                  
                  <div className={`border rounded-2xl p-5 text-left relative overflow-hidden transition-all duration-500 ${cardBgClass}`}>
                    <div className="absolute top-2 right-2 bg-zinc-900/50 border border-zinc-800 text-zinc-400 font-mono text-[8px] py-0.5 px-2 uppercase rounded">
                      {isDeclined ? 'GATEWAY REJECTED' : 'GATEWAY ENLISTED'}
                    </div>

                    <div className="flex items-center gap-3.5 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                        isPending 
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                          : isApproved 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {isPending && <Timer className="w-5 h-5 animate-spin" />}
                        {isApproved && <CheckCircle2 className="w-5 h-5 animate-bounce" />}
                        {isDeclined && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block uppercase">
                          // SECURE OFF-CHAIN RELEASE
                        </span>
                        <h3 className="text-sm font-black font-mono text-zinc-100 uppercase flex items-center gap-1.5">
                          {isPending && (
                            <>
                              <span className="text-yellow-500 animate-pulse">●</span> Withdrawal Pending Verification
                            </>
                          )}
                          {isApproved && (
                            <>
                              <span className="text-emerald-400">✓</span> Withdrawal Verification Completed
                            </>
                          )}
                          {isDeclined && (
                            <>
                              <span className="text-red-500">✗</span> Withdrawal Request Revoked
                            </>
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* ACTIVE COUNTDOWN WATCH STATUS */}
                    {isPending && (
                      <div className="mb-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2 text-yellow-500/90">
                          <Timer className="w-4 h-4 animate-pulse shrink-0" />
                          <span className="font-bold text-[10px] sm:text-xs">QUEUE DISPATCH PENDING TIMER:</span>
                        </div>
                        <span className="text-white font-extrabold px-2.5 py-0.5 bg-yellow-600/20 border border-yellow-500/30 rounded text-xs sm:text-xs tracking-widest animate-pulse font-mono">
                          {formatTimer(etaSeconds)}
                        </span>
                      </div>
                    )}
                    
                    {isApproved && (
                      <div className="mb-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-[15px] sm:text-xs">DISPATCH GATEWAY RELEASE:</span>
                        </div>
                        <span className="text-white font-extrabold px-2.5 py-0.5 bg-emerald-600/20 border border-emerald-500/30 rounded text-[10px] sm:text-[11px] uppercase tracking-wider font-mono">
                          APPROVED & RELEASED
                        </span>
                      </div>
                    )}

                    {isDeclined && (
                      <div className="mb-4 bg-red-400/5 border border-red-500/20 rounded-xl p-4 font-mono text-xs space-y-2">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                          <span className="font-black text-[10.5px] uppercase">TRANS-FAIL SECURE LOCK ALERT:</span>
                        </div>
                        <div className="bg-red-950/20 border border-red-900/40 p-3 rounded text-[11px] text-red-400 font-mono">
                          <span className="font-extrabold block text-red-500 text-[9px] uppercase mb-1">AUDIT EXPLANATION EMITTED BY NODE COURIER:</span>
                          <q className="italic block font-semibold leading-relaxed">
                            {serverExcuse || "Primary processing gateway lost connection with client node during ledger authentication cycle."}
                          </q>
                        </div>
                      </div>
                    )}

                    {/* COMPREHENSIVE RECEIPT DESCRIPTION */}
                    <div className="bg-black/80 rounded-xl p-4 border border-zinc-900/60 font-mono text-[10.5px] text-zinc-400 space-y-2.5">
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5 text-[9px]">
                        <span className="text-zinc-500">PARAM METRIC</span>
                        <span className="text-zinc-500">REGISTRATION RECORD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Destination Portal:</span>
                        <span className="text-zinc-100 font-bold uppercase">
                          {selectedMethod === 'binance' ? 'Binance Pay App ID' : 
                           selectedMethod === 'pubg' ? 'PUBG Player Shop' :
                           selectedMethod === 'freefire' ? 'Free Fire Diamond Gate' :
                           selectedMethod.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">
                          {['pubg', 'freefire'].includes(selectedMethod) ? 'Player Account UID:' : 'Account Recipient:'}
                        </span>
                        <span className="text-zinc-100 truncate max-w-[200px]">{withdrawalAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Withdrawn Amount:</span>
                        <span className="text-zinc-100 font-extrabold text-[#d4af37]">
                          {selectedMethod === 'pubg' ? `${(lastWithdrawnAmount * 60).toLocaleString()} UC` :
                           selectedMethod === 'freefire' ? `${(lastWithdrawnAmount * 100).toLocaleString()} Diamonds` :
                           `$${lastWithdrawnAmount.toLocaleString()}.00 USD`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Ledger Remaining Balance:</span>
                        <span className="text-zinc-100 font-semibold font-mono">
                          ${discoveredBalance.toLocaleString()}.00 USD
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Network Processing Fee:</span>
                        <span className="text-emerald-400">FREE ($0.00 Gas Covered)</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-900 pt-1.5">
                        <span className="text-zinc-500">Current Queue Level Status:</span>
                        {isPending ? (
                          <span className="text-[#d4af37] font-bold animate-pulse uppercase">PENDING AUDITOR CHECK</span>
                        ) : isApproved ? (
                          <span className="text-emerald-400 font-extrabold uppercase">SUCCESSFULLY CLEARED</span>
                        ) : (
                          <span className="text-red-500 font-extrabold uppercase">LOCKED & DECOMMISSIONED</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 text-zinc-500 text-[10px] leading-relaxed font-sans space-y-1">
                      <p>
                        🔒 <strong>Simulation Notice:</strong> Standard anti-money-laundering clearing pipelines requires 12 to 24 hours to clear localized node pools. This transaction has been enqueued into the sandbox dispatch buffer queue securely. No physical currency will be dispatched as this represents a simulated mini-game outcome.
                      </p>
                      <p className="text-zinc-650 italic text-[9px] mt-2 font-mono">
                        Secure Receipt Reference ID: TXID-W-{card.cardNumber.slice(0,4)}-{Math.floor(Math.random()*90000+10000)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full h-10 mt-5 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono tracking-wider uppercase transition-colors"
                    >
                      RETURN TO SECURE LEDGER VAULT
                    </button>

                  </div>

                </div>
              );
            })()}

          </div>

        </div>

      </div>
    </div>
  );
}
