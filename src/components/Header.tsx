import React from 'react';
import { ShoppingCart, Database, Compass, Eye, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'vault' | 'cart' | 'analyzer' | 'admin';
  setActiveTab: (tab: 'builder' | 'vault' | 'cart' | 'analyzer' | 'admin') => void;
  cartCount: number;
  isAdminEnabled: boolean;
  setIsAdminEnabled: (enabled: boolean) => void;
}

export default function Header({ activeTab, setActiveTab, cartCount, isAdminEnabled, setIsAdminEnabled }: HeaderProps) {
  const logoClickCountRef = React.useRef(0);
  const lastLogoClickTimeRef = React.useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTimeRef.current < 2000) {
      logoClickCountRef.current += 1;
    } else {
      logoClickCountRef.current = 1;
    }
    lastLogoClickTimeRef.current = now;

    if (logoClickCountRef.current >= 5) {
      const isCurrentlyEnabled = isAdminEnabled;
      const nextState = !isCurrentlyEnabled;
      setIsAdminEnabled(nextState);
      if (nextState) {
        localStorage.setItem('admin_session_auth', 'unlocked');
      } else {
        localStorage.removeItem('admin_session_auth');
        if (activeTab === 'admin') {
          setActiveTab('builder');
        }
      }
      logoClickCountRef.current = 0;
    }
  };

  return (
    <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-md sticky top-0 z-50 py-3 sm:py-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* BRAND IDENTITY */}
        <div 
          onClick={() => {
            setActiveTab('builder');
            handleLogoClick();
          }}
          className="flex items-center gap-2.5 cursor-pointer group text-center lg:text-left select-none"
          id="brand-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-800 to-black border border-zinc-700/80 flex items-center justify-center group-hover:border-[#d4af37] transition-colors duration-350 shrink-0">
            <Eye className="w-4 h-4 text-[#d4af37] hover:scale-110 transition-transform duration-300 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="font-mono text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-zinc-100 flex items-center gap-1">
              NOVUS <span className="text-[#d4af37]">ORDO</span>
            </div>
            <div className="text-[7px] sm:text-[8px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
              ANNUIT COEPTIS • DECENTRALIZED SYNDICATE
            </div>
          </div>
        </div>

        {/* UTILITY BAR NAVIGATION */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 font-mono text-xs w-full lg:w-auto justify-center overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none shrink-0">
          
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-none border transition-all text-[10.5px] sm:text-xs shrink-0 ${
              activeTab === 'builder'
                ? 'border-[#d4af37]/60 bg-zinc-950 text-[#d4af37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="hidden sm:inline">Oracle Forge</span>
            <span className="sm:hidden">Forge</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-none border flex items-center gap-1.5 transition-all text-[10.5px] sm:text-xs shrink-0 ${
              activeTab === 'vault'
                ? 'border-[#d4af37]/60 bg-zinc-950 text-[#d4af37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d4af37] shrink-0" />
            <span className="hidden sm:inline">Cipher Vault</span>
            <span className="sm:hidden">Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-none border flex items-center gap-1.5 transition-all text-[10.5px] sm:text-xs shrink-0 ${
              activeTab === 'analyzer'
                ? 'border-[#d4af37]/60 bg-zinc-950 text-[#d4af37]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d4af37] shrink-0" />
            <span className="hidden sm:inline">Specimen Analyzer</span>
            <span className="sm:hidden">Analyzer</span>
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-none border flex items-center gap-1.5 transition-all relative text-[10.5px] sm:text-xs shrink-0 ${
              activeTab === 'cart'
                ? 'border-[#d4af37] bg-zinc-950 text-zinc-100'
                : 'border-zinc-900 bg-black/80 text-zinc-400 hover:text-zinc-100 hover:border-zinc-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Dispatch Gate</span>
            <span className="sm:hidden">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a6d1c] text-black font-semibold text-[9px] flex items-center justify-center border border-zinc-950 animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Golden Sovereign Admin Console Icon */}
          {isAdminEnabled && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-none border flex items-center gap-1.5 transition-all text-[10.5px] sm:text-xs shrink-0 ${
                activeTab === 'admin'
                  ? 'border-[#d4af37] bg-zinc-950 text-[#d4af37] font-bold shadow shadow-yellow-500/10'
                  : 'border-red-950/40 bg-red-950/5 text-red-400/80 hover:text-red-300 hover:border-red-900/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#d4af37]" />
              <span>Admin Console</span>
            </button>
          )}

        </div>
      </div>

      {/* COMPLIMENTARY MARQUEE */}
      <div className="bg-red-950/20 border-y border-red-900/40 text-[9px] text-zinc-500 py-1 text-center font-mono mt-3 select-none overflow-hidden whitespace-nowrap">
        <span className="text-red-500 animate-pulse font-bold">WARNING: SECURE PEER-TO-PEER ENCRYPTION ACTIVE</span> <span className="text-zinc-650">•</span> ALL CUSTOMS ARTIFACTS $20 <span className="text-zinc-650">•</span> <span className="text-[#d4af37]">ANNUIT COEPTIS</span> <span className="text-zinc-650">•</span> NOVUS ORDO SECLORUM <span className="text-zinc-650">•</span> 0x992B ON-CHAIN TELEMETRY FORGED LIVE <span className="text-zinc-650">•</span> COMPLIMENTARY COURIER DISPATCH
      </div>
    </header>
  );
}
