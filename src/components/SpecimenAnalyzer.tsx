import React, { useState, useEffect } from 'react';
import { CardConfig, Order } from '../types';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Search, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Coins, 
  RefreshCw, 
  Layers, 
  Sparkles,
  SearchCode
} from 'lucide-react';

interface SpecimenAnalyzerProps {
  orders: Order[];
  onSelectPresets: (card: CardConfig) => void;
}

export default function SpecimenAnalyzer({ orders, onSelectPresets }: SpecimenAnalyzerProps) {
  const [cardNumber, setCardNumber] = useState('4242000013379999');
  const [cardHolder, setCardHolder] = useState('CHIP GLITCH');
  const [expiryDate, setExpiryDate] = useState('12/29');
  const [cvv, setCvv] = useState('777');
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Detailed functional results
  const [luhnValid, setLuhnValid] = useState(false);
  const [cardBrand, setCardBrand] = useState('Unknown');
  const [cardIssuer, setCardIssuer] = useState('Unknown Offshore Node');
  const [encryptionMetrics, setEncryptionMetrics] = useState({
    strength: 0,
    entropy: 0,
    mempoolLatency: '0ms',
    securityScore: 0,
    estimatedBalance: 'Pending Scan'
  });

  // Perform operational Luhn validation (REAL MATHEMATICAL CHECKSUM)
  const calculateLuhn = (numString: string): boolean => {
    const cleaned = numString.replace(/\D/g, '');
    if (cleaned.length < 13) return false;
    
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const detectBrandAndIssuer = (numString: string) => {
    const cleaned = numString.replace(/\D/g, '');
    let brand = 'Sovereign Unknown Specimen';
    let issuer = 'Decentralized P2P Ledger';

    if (cleaned.startsWith('4')) {
      brand = 'Visa International';
      const selectBank = parseInt(cleaned.substring(1, 4)) % 3;
      issuer = selectBank === 0 ? 'Chase Sovereign Escrow' : selectBank === 1 ? 'Bank of America Node' : 'Barclays International LLC';
    } else if (/^(51|52|53|54|55)/.test(cleaned)) {
      brand = 'MasterCard Core';
      const selectBank = parseInt(cleaned.substring(2, 5)) % 3;
      issuer = selectBank === 0 ? 'Citigroup Centralized' : selectBank === 1 ? 'Sovereign Swiss Bank' : 'Binance Merchant Ledger';
    } else if (/^(34|37)/.test(cleaned)) {
      brand = 'American Express Imperial';
      issuer = 'AmEx Centurion Vault Trust';
    } else if (cleaned.startsWith('6')) {
      brand = 'Discover Network';
      issuer = 'Discover Financial Clearing';
    } else if (cleaned.startsWith('0000') || cleaned === '') {
      brand = 'Void Crypt Agent';
      issuer = 'Dark Tunnel Onion Router';
    }

    return { brand, issuer };
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setHasAnalyzed(false);
    setScanProgress(0);
    setLogs([]);

    const logArray = [
      `[DECIPHER] Connecting to multi-chain Luhn validation socket...`,
      `[LATCH] Registering specimen target identifier: "${cardNumber.substring(0, 4)} ... ${cardNumber.slice(-4)}"`,
      `[AESTHETIC-METRIC] Analyzing physical plate metrics and cardholder identity: "${cardHolder}"`,
      `[COMPUTE] Executing mod-10 arithmetic checksum verification...`,
      `[SECURITY] Entropy evaluation: Calculating hash sequence matching rate...`,
      `[MEMPOOL] Indexing unallocated coordinates associated with CVV ${cvv}...`,
      `[TELEMETRY] Testing server node echo relay...`,
      `[SUCCESS] Analysis complete. Rendering diagnostic board.`
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < logArray.length) {
        setLogs(prev => [...prev, logArray[index]]);
        setScanProgress(Math.min(100, Math.floor(((index + 1) / logArray.length) * 100)));
        index++;
      } else {
        clearInterval(interval);
        
        // Finalize genuine metrics calculations
        const { brand, issuer } = detectBrandAndIssuer(cardNumber);
        const isValid = calculateLuhn(cardNumber);
        
        // Calculate encryption metrics mathematically from parameters
        const numericSum = cardNumber.replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b), 0) || 50;
        const seedValue = numericSum + parseInt(cvv || '100');
        const calculatedStrength = Math.min(100, 60 + (seedValue % 41));
        const estimatedBalanceValue = isValid 
          ? 'DECRYPTABLE SEQUENCE (AWAITING SYSTEM RELEASE)' 
          : 'UNAVAILABLE (Luhn Checksum Failed - 0x0F)';

        setLuhnValid(isValid);
        setCardBrand(brand);
        setCardIssuer(issuer);
        setEncryptionMetrics({
          strength: calculatedStrength,
          entropy: Math.round(calculatedStrength * 0.95),
          mempoolLatency: `${30 + (seedValue % 120)}ms`,
          securityScore: Math.min(100, 40 + (parseInt(cvv || '500') % 59)),
          estimatedBalance: estimatedBalanceValue
        });

        setIsScanning(false);
        setHasAnalyzed(true);
      }
    }, 500);
  };

  const handleSelectVaultItem = (order: Order) => {
    setCardNumber(order.config.cardNumber);
    setCardHolder(order.config.cardHolder);
    setExpiryDate(order.config.expiryDate);
    setCvv(order.config.cvv);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="analyzer-main-panel">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-900 bg-neutral-950/60 rounded-2xl p-5">
        <div className="flex items-center gap-3 text-left">
          <Activity className="w-6 h-6 text-[#d4af37] animate-pulse" />
          <div>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest font-mono block">
              // NO LIMIT AUTOMATED CARD COMPLIANCE SPECIFICATIONS
            </span>
            <h2 className="text-zinc-100 text-sm font-semibold uppercase tracking-wider font-mono">
              Sovereign Specimen & Card Checker
            </h2>
            <p className="text-zinc-500 text-xs">
              Perform real Luhn validation, brand lookup, and estimate on-chain coordinate balance ciphers.
            </p>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-[#d4af37]/20 rounded px-2.5 py-1 text-[9px] font-mono text-[#d4af37] uppercase select-none">
          100% Client-Side Sandbox Validated
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE INPUT LABORATORY FORM */}
        <div className="lg:col-span-5 space-y-6">
          
          {orders.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 text-left space-y-2.5">
              <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider font-mono">
                // SELECT AN ACQUIRED SPECIMEN TO INTERROGATE
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => handleSelectVaultItem(o)}
                    className="w-full text-left p-2.5 rounded-lg border border-zinc-900 hover:border-zinc-850 bg-black/60 hover:bg-zinc-950 transition-all font-mono text-[10px] flex justify-between items-center"
                  >
                    <div className="truncate max-w-[160px]">
                      <span className="font-bold text-zinc-300 block">{o.config.cardHolder}</span>
                      <span className="text-zinc-500 text-[9px]">•••• •••• •••• {o.config.cardNumber.slice(-4)}</span>
                    </div>
                    <span className="text-[#d4af37] text-[9.5px] uppercase font-bold bg-yellow-500/5 px-2 py-0.5 border border-yellow-500/10 rounded">
                      Load Specimen
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleRunAnalysis} className="border border-zinc-900 bg-neutral-950/40 rounded-2xl p-5 space-y-4 text-left">
            <span className="text-[9px] text-[#d4af37] font-bold block tracking-widest font-mono uppercase">
              // RECTILINEAR PARAMETER INPUTS
            </span>

            {/* Target Card Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                Full Card Number Matrix
              </label>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4242 0000 1337 9999"
                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-[#d4af37] outline-none rounded-xl py-2.5 px-3 text-sm font-mono tracking-widest placeholder-zinc-800"
              />
            </div>

            {/* Holder Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                Specimen Name Label
              </label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="e.g. CHIP GLITCH"
                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-[#d4af37] outline-none rounded-xl py-2 px-3 text-xs font-mono uppercase placeholder-zinc-700"
              />
            </div>

            {/* Row Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="e.g. 12/29"
                  className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-[#d4af37] outline-none rounded-xl py-2 px-3 text-xs font-mono text-center placeholder-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                  Secure CVV Block
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 777"
                  className="w-full bg-zinc-950 border border-zinc-900 text-zinc-200 focus:border-[#d4af37] outline-none rounded-xl py-2 px-3 text-xs font-mono text-center placeholder-zinc-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full h-11 mt-4 bg-white text-black hover:bg-[#d4af37] py-2 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] font-mono transition-colors disabled:opacity-40 select-none flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ANALYZING SPECIMEN LATTICE ({scanProgress}%)
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  INITIATE SYSTEM ANALYSIS
                </>
              )}
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: REALTIME FEEDBACK CONSOLE AND METRICS DIAGNOSTIC */}
        <div className="lg:col-span-7 space-y-6">

          {/* ACTIVE TERMINAL SIMULATOR DURING SCAN OR BOOT */}
          {(isScanning || logs.length > 0) && (
            <div className="bg-black border border-zinc-900 rounded-2xl p-5 text-left font-mono text-[10px] text-zinc-400 relative overflow-hidden select-none">
              <div className="text-zinc-650 mb-3 border-b border-zinc-950 pb-2 flex justify-between items-center font-bold">
                <span className="flex items-center gap-1.5 uppercase">
                  <Terminal className="w-4 h-4 text-red-500 animate-pulse" /> TARGET LOG_EXEC SOCKETS
                </span>
                <span className="text-zinc-400">{scanProgress}%</span>
              </div>

              {isScanning && (
                <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] top-0 animate-laser pointer-events-none" />
              )}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scanner_laser {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                .animate-laser {
                  animation: scanner_laser 2.2s infinite ease-in-out;
                }
              `}} />

              <div className="space-y-1.5 h-44 overflow-y-auto pr-2">
                {logs.map((log, i) => (
                  <div key={i} className={`leading-relaxed ${(log || '').includes('[SUCCESS]') ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {log}
                  </div>
                ))}
                {isScanning && (
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-3 bg-[#d4af37] animate-pulse" />
                    <span className="text-zinc-600 text-[9px] italic">Bypassing sandboxed database layers...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DIAGNOSTIC PANEL COMPLETED RESULT */}
          {hasAnalyzed && !isScanning && (
            <div className="border border-zinc-850 bg-black/50 rounded-2xl p-6 text-left space-y-6 animate-fade-in">
              
              {/* BRAND IDENTITIES FOR FUN */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
                    IDENTIFIED SPECIMEN CODE
                  </span>
                  <h3 className="text-lg font-black text-zinc-100 font-mono tracking-tight uppercase">
                    {cardBrand}
                  </h3>
                  <p className="text-zinc-400 text-xs font-mono mt-0.5">
                    Affiliated Node Bank: <strong className="text-zinc-200">{cardIssuer}</strong>
                  </p>
                </div>

                <div className={`py-1.5 px-3 rounded-xl border font-mono text-[10px] font-bold tracking-widest flex items-center gap-2 uppercase animate-pulse shrink-0 ${
                  luhnValid 
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                }`}>
                  {luhnValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Luhn Valid (MOD10 ✓)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Luhn Failed (Invalid Checksum ✗)
                    </>
                  )}
                </div>
              </div>

              {/* ESTIMATED OFFCHAIN CIPHER BALANCE */}
              <div className="bg-gradient-to-r from-neutral-900 to-black border border-zinc-850 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="text-center sm:text-left space-y-0.5 font-mono">
                  <span className="text-[9px] text-[#d4af37] font-bold uppercase tracking-wider block">
                    🎁 COORDINATE DECRYPTION STATUS
                  </span>
                  <p className="text-2xl font-black text-zinc-100 tracking-tight">
                    {encryptionMetrics.estimatedBalance}
                  </p>
                </div>
                <div className="text-zinc-500 text-[10px] leading-relaxed max-w-xs font-sans text-center sm:text-right">
                  {luhnValid ? (
                    <span className="text-emerald-400/90 font-mono font-bold">
                      🔓 Matrix sequence match found! Use the Decryption Portal inside the Cipher Vault to begin simulation.
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-mono">
                      🔒 No coordinate match because card number algorithm check failed. Generate valid specimen parameters.
                    </span>
                  )}
                </div>
              </div>

              {/* TECHNICAL GRAPH DETAILS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Hardware Entropy', value: `${encryptionMetrics.entropy}%`, rate: 'Optimal' },
                  { name: 'Signal Strength', value: `${encryptionMetrics.strength}%`, rate: 'High Bandwidth' },
                  { name: 'Node Response', value: encryptionMetrics.mempoolLatency, rate: 'Sub-harmonic' },
                  { name: 'Security Score', value: `${encryptionMetrics.securityScore}/100`, rate: 'Stealth Rating' }
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 font-mono space-y-1">
                    <span className="text-[8.5px] text-zinc-650 block uppercase font-bold">{stat.name}</span>
                    <span className="text-sm font-black text-zinc-200 block">{stat.value}</span>
                    <span className="text-[8px] text-zinc-500 block">{stat.rate}</span>
                  </div>
                ))}
              </div>

              {/* LUHN EXPLANATION ADVISORY */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex gap-3.5 text-zinc-500 text-[10px] leading-relaxed">
                <HelpCircle className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <div className="font-sans text-left">
                  <strong className="text-zinc-350 block font-mono text-[10px] mb-0.5">// WHAT IS THE LUHN TEST?</strong>
                  The Luhn algorithm validates card integers mathematically to confirm structure. Legitimate credit card issuers enforce Modulo-10 checksum validation. Our sandbox checker reads these values dynamically to identify valid structural parameters for our fun-game simulation.
                </div>
              </div>

            </div>
          )}

          {/* INITIAL SCREEN WHEN NO RUN HAS OCCURRED */}
          {!hasAnalyzed && !isScanning && (
            <div className="border border-dashed border-zinc-900 bg-[#d4af37]/[0.01] rounded-2.5xl p-16 text-center h-full flex flex-col justify-center items-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-500 mb-4 animate-pulse">
                <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
              </div>
              <h3 className="text-zinc-300 text-xs font-semibold tracking-wider font-mono uppercase mb-1">
                Aegis-AI Interrogator Suite Idle
              </h3>
              <p className="text-zinc-500 text-[10px] max-w-sm font-mono leading-relaxed">
                Provide custom coordinates or load custom engraved plates directly to query metadata balances.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
