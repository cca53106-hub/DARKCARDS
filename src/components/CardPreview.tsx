import React, { useState, useRef } from 'react';
import { CardConfig } from '../types';

interface CardPreviewProps {
  config: CardConfig;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
}

export default function CardPreview({ config, isFlipped, setIsFlipped }: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineStyle, setShineStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isFlipped) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized coordinates (-0.5 to 0.5)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const rX = -(y - yc) / 10; // Max 10-degree tilt
    const rY = (x - xc) / 10;
    
    setRotateX(rX);
    setRotateY(rY);
    
    // Set dynamic custom mouse positions for the glossy reflex reflection
    setShineStyle({
      '--mouse-x': `${(x / rect.width) * 100}%`,
      '--mouse-y': `${(y / rect.height) * 100}%`,
      opacity: 1,
    } as React.CSSProperties);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setShineStyle({ opacity: 0 });
  };

  // Helper to format card number: groups of 4 with monospace letterspacing
  const formatCardNumber = (num: string) => {
    const cleaned = num.replace(/\s+/g, '').padEnd(16, '•');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  // Border Style CSS maps
  const getBorderClass = () => {
    switch (config.borderStyle) {
      case 'gold':
        return 'border border-[#d4af37]/75 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]';
      case 'silver':
        return 'border border-zinc-500/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]';
      case 'neon-blue':
        return 'border border-cyan-500/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-pulse';
      case 'none':
      default:
        return 'border border-zinc-800/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]';
    }
  };

  // Finish type gradient mapping (to represent Matte Obsidian, Carbon, or Stardust)
  const getFinishClasses = () => {
    switch (config.finishType) {
      case 'brushed-carbon':
        return 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 bg-[size:200%_200%] before:content-[""] before:absolute before:inset-0 before:opacity-[0.06] before:bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] before:bg-[size:8px_8px] before:bg-[position:0_0,4px_4px]';
      case 'stardust-black':
        return 'bg-gradient-to-br from-neutral-900 via-stone-950 to-zinc-900 bg-[size:200%_200%] before:content-[""] before:absolute before:inset-0 before:opacity-15 before:bg-[radial-gradient(#fff_1px,transparent_1px)] before:bg-[size:10px_10px]';
      case 'matte-obsidian':
      default:
        return 'bg-gradient-to-br from-zinc-900 via-stone-950 to-neutral-950';
    }
  };

  const getFontColorClass = () => {
    switch (config.fontColor) {
      case 'gold':
        return 'text-[#d4af37]/90 font-medium tracking-widest selection:bg-yellow-800';
      case 'phosphor-blue':
        return 'text-cyan-400 font-medium tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)]';
      case 'matte':
        return 'text-zinc-600 font-medium tracking-widest';
      case 'silver-white':
      default:
        return 'text-zinc-100 font-light tracking-widest';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Tap Instruction */}
      <p className="text-zinc-500 text-xs mb-4 font-mono select-none">
        Hover to feel reflection • Tap card to preview reverse
      </p>

      {/* Outer 3D Perspective container */}
      <div 
        className="w-full max-w-sm sm:max-w-md h-56 sm:h-64 [perspective:1000px] cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isFlipped 
              ? 'rotateY(180deg)' 
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: isFlipped ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.1s ease',
          }}
          className="relative w-full h-full duration-500 [transform-style:preserve-3d]"
          id="custom-black-card"
        >
          {/* FRONT OF THE CARD */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] select-none ${getFinishClasses()} ${getBorderClass()}`}
          >
            {/* Subtle Grain Texture */}
            <div className="grain-bg" />

            {/* Gloss shine reflection overlay */}
            <div className="card-shine" style={shineStyle} />

            {/* Top row: Chip and Sleek Material identifier */}
            <div className="flex justify-between items-start z-10">
              {/* Custom micro-engineered chip style */}
              <div className="w-12 h-9 rounded-md relative overflow-hidden flex items-center justify-center border border-zinc-700/50">
                {config.chipStyle === 'classic' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-[#8a6d1c]/80 flex flex-col justify-between p-1.5">
                    <div className="flex justify-between w-full h-1 border-b border-[#000]/20" />
                    <div className="grid grid-cols-3 gap-0.5 h-full mt-1">
                      <div className="border border-[#000]/20" />
                      <div className="border border-[#000]/20 border-l-0 border-r-0" />
                      <div className="border border-[#000]/20" />
                    </div>
                  </div>
                )}
                {config.chipStyle === 'modern' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 to-zinc-600 flex flex-col justify-between p-1.5">
                    <div className="flex justify-between w-full h-1.5 border-b border-[#000]/30" />
                    <div className="flex justify-between h-4 mt-1 border border-zinc-400" />
                  </div>
                )}
                {config.chipStyle === 'cyber' && (
                  <div className="absolute inset-0 bg-zinc-900 border border-cyan-500/40 p-1 flex flex-col justify-between">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                    <div className="w-full h-[1px] bg-cyan-500/60" />
                    <div className="flex justify-between">
                      <div className="w-1.5 h-1.5 bg-cyan-700/50 border border-cyan-500/80" />
                      <div className="w-1.5 h-1.5 bg-cyan-700/50 border border-cyan-500/80" />
                    </div>
                  </div>
                )}
                {config.chipStyle === 'stealth' && (
                  <div className="absolute inset-0 bg-neutral-950 flex flex-col justify-between p-1 border border-zinc-800">
                    <div className="w-full h-1 bg-zinc-900" />
                    <div className="grid grid-cols-2 gap-1 h-3 mt-1">
                      <div className="bg-zinc-900/60" />
                      <div className="bg-zinc-900/60" />
                    </div>
                  </div>
                )}
              </div>

              {/* UNKNOWN Minimal Brand Seal */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-mono tracking-[0.3em] text-[#d4af37] uppercase">
                  ORDO SECLORUM
                </span>
                <span className="text-[8px] tracking-[0.1em] text-red-500/80 font-mono mt-0.5 uppercase">
                  DECRYPTED PROTOCOL
                </span>
              </div>
            </div>

            {/* Middle Row: The Custom Embossed Emblem */}
            <div className="flex justify-center items-center my-auto py-1 z-10">
              {config.logoStyle === 'ouroboros' && (
                <svg className="w-12 h-12 text-zinc-400/85 group-hover:text-[#d4af37] transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <ellipse cx="12" cy="12" rx="4" ry="4" strokeDasharray="3,3" />
                  <path d="M14 8l-2 2-2-2" />
                </svg>
              )}
              {config.logoStyle === 'eye' && (
                <svg className="w-14 h-14 text-zinc-400 group-hover:text-[#d4af37] transition-all duration-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  {/* Outer triangle (Pyramid) */}
                  <polygon points="12 3 22 21 2 21" stroke="#d4af37" strokeWidth="1.2" />
                  {/* Subtle inner pyramid steps/bricks */}
                  <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,2" />
                  <line x1="4.5" y1="17" x2="19.5" y2="17" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1,2" />
                  {/* All-seeing Eye in upper triangle section */}
                  <path d="M8 13.5s1.5-2.5 4-2.5 4 2.5 4 2.5-1.5 2.5-4 2.5-4-2.5-4-2.5z" stroke="#d4af37" strokeWidth="1.2" />
                  <circle cx="12" cy="13.5" r="1.2" fill="#d4af37" />
                  {/* Radiant rays emanating from eye top */}
                  <line x1="12" y1="4" x2="12" y2="6.5" stroke="#d4af37" strokeWidth="1.2" />
                  <line x1="8.5" y1="5.5" x2="10.5" y2="8" stroke="#d4af37" strokeWidth="1" />
                  <line x1="15.5" y1="5.5" x2="13.5" y2="8" stroke="#d4af37" strokeWidth="1" />
                </svg>
              )}
              {config.logoStyle === 'geometric' && (
                <svg className="w-12 h-12 text-zinc-400/85 group-hover:text-purple-500/60 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="8.5" x2="22" y2="15.5" />
                  <line x1="2" y1="15.5" x2="22" y2="8.5" />
                </svg>
              )}
              {config.logoStyle === 'phoenix' && (
                <svg className="w-12 h-12 text-zinc-400/85 group-hover:text-red-500/60 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 4s-4 4-4 8 4 8 4 12c0-4 4-8 4-12s-4-8-4-8z" />
                  <path d="M4 10c2.5 0 5 1.5 6 3-1.5-2.5-4-3-6-3z" strokeLinecap="round" />
                  <path d="M20 10c-2.5 0-5 1.5-6 3 1.5-2.5 4-3 6-3z" strokeLinecap="round" />
                  <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                </svg>
              )}
              {config.logoStyle === 'none' && (
                <div className="h-10 w-10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600/60 rounded-full animate-ping" />
                </div>
              )}
            </div>

            {/* Bottom Section: Custom Numbers & Holder Name */}
            <div className="space-y-3 z-10">
              {/* Card Number */}
              <div className={`text-center font-mono text-lg sm:text-xl tracking-[0.18em] ${getFontColorClass()}`}>
                {formatCardNumber(config.cardNumber)}
              </div>

              {/* Footer: Expiry & Full Holder Name */}
              <div className="flex justify-between items-end font-mono">
                <div className="flex flex-col text-left">
                  <span className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold">Cardholder</span>
                  <span className="text-[10px] sm:text-xs text-zinc-300 font-medium uppercase tracking-[0.1em] truncate max-w-[180px]">
                    {config.cardHolder || 'VOID OWNER'}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold font-mono">Valid thru</span>
                  <span className="text-[10px] sm:text-xs text-zinc-300 tracking-[0.1em]">
                    {config.expiryDate || '12/29'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BACKGROUND / BACKSIDE OF THE CARD */}
          <div 
            className={`absolute inset-0 w-full h-full rounded-2xl py-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] select-none ${getFinishClasses()} ${getBorderClass()}`}
          >
            {/* Subtle Grain Texture */}
            <div className="grain-bg" />

            {/* Magnetic Stripe Band */}
            <div className="w-full bg-zinc-950/90 h-10 border-y border-zinc-900" />

            {/* Signature, CVV Panel */}
            <div className="px-6 flex items-center justify-between gap-4">
              <div className="flex-1 bg-zinc-800/80 rounded-sm h-8 flex items-center justify-end px-3 font-mono italic text-xs tracking-widest text-zinc-500 border border-zinc-700/30">
                Bespoke Hologram Signature Strip
              </div>
              <div className="bg-zinc-100 text-zinc-900 font-mono font-bold text-center py-1.5 px-3 rounded-sm text-xs tracking-wider shadow-inner select-all">
                {config.cvv.padEnd(3, '•')}
              </div>
            </div>

            {/* Holograms and Technical specs */}
            <div className="px-6 flex justify-between items-end font-mono">
              <div className="text-left">
                <p className="text-[7px] text-zinc-500 uppercase tracking-wider max-w-sm">
                  Issued under absolute off-the-grid privacy directives. Solid dark-net plate.
                </p>
                <p className="text-[7px] text-[#d4af37] mt-1 uppercase font-bold">
                  Secured by: NOVUS ORDO SYNAPSE
                </p>
              </div>
              {/* Fake Secure QR Indicator */}
              <div className="w-8 h-8 bg-zinc-800 rounded-sm p-0.5 border border-zinc-700 flex flex-wrap gap-0.5 opacity-50">
                <div className="w-3 h-3 bg-zinc-300" />
                <div className="w-3 h-3 bg-zinc-900" />
                <div className="w-3 h-3 bg-zinc-900" />
                <div className="w-3 h-3 bg-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
