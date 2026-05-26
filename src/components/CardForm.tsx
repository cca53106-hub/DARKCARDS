import React from 'react';
import { CardConfig } from '../types';
import { 
  CreditCard, 
  Sparkles, 
  RotateCcw, 
  Cpu, 
  Compass, 
  ShieldCheck, 
  Layers,
  Palette
} from 'lucide-react';

interface CardFormProps {
  config: CardConfig;
  onChange: (updater: (prev: CardConfig) => CardConfig) => void;
  onFocusCvv: () => void;
  onBlurCvv: () => void;
}

const PRESETS: { name: string; desc: string; config: CardConfig }[] = [
  {
    name: 'Anonymous Stealth',
    desc: 'Pure matte black with dark branding, zero-trace hardware, and void ciphers.',
    config: {
      cardNumber: '0000 0000 0000 0000',
      cardHolder: 'VOID AGENT',
      expiryDate: '12/29',
      cvv: '000',
      chipStyle: 'stealth',
      logoStyle: 'none',
      borderStyle: 'none',
      finishType: 'matte-obsidian',
      fontColor: 'matte',
    }
  },
  {
    name: 'Providence Gold Lodge',
    desc: 'Ancient gold-rimmed borders housing the grand All-Seeing Eye of the secret order.',
    config: {
      cardNumber: '7777 8888 9999 5555',
      cardHolder: 'ANONYMOUS INITIATE',
      expiryDate: '07/31',
      cvv: '777',
      chipStyle: 'classic',
      logoStyle: 'eye',
      borderStyle: 'gold',
      finishType: 'stardust-black',
      fontColor: 'gold',
    }
  },
  {
    name: 'Darknet Green Onion',
    desc: 'Deep acid-phosphor cyber cosmetics and microcircuit board patterns.',
    config: {
      cardNumber: '1024 2048 4096 8192',
      cardHolder: 'PEER NODE 0x9',
      expiryDate: '09/42',
      cvv: '999',
      chipStyle: 'cyber',
      logoStyle: 'geometric',
      borderStyle: 'neon-blue',
      finishType: 'brushed-carbon',
      fontColor: 'phosphor-blue',
    }
  },
  {
    name: 'Rosicrucian Stardust',
    desc: 'Glittering cosmic-charcoal plate bearing sacred geometry seals.',
    config: {
      cardNumber: '8888 1234 5678 9999',
      cardHolder: 'GRAND MASTER',
      expiryDate: '11/30',
      cvv: '444',
      chipStyle: 'modern',
      logoStyle: 'ouroboros',
      borderStyle: 'silver',
      finishType: 'stardust-black',
      fontColor: 'silver-white',
    }
  }
];

export default function CardForm({ config, onChange, onFocusCvv, onBlurCvv }: CardFormProps) {
  
  const updateField = (field: keyof CardConfig, value: any) => {
    onChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Automated numbering formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Digits only
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    // Convert to 16 digits block formatted
    updateField('cardNumber', value);
  };

  // Automated MM/YY date formatter
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    updateField('expiryDate', value);
  };

  const generateRandomNumbers = () => {
    let digits = '';
    for (let i = 0; i < 16; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    updateField('cardNumber', digits);
  };

  const applyPreset = (presetConfig: CardConfig) => {
    onChange(() => ({ ...presetConfig }));
  };

  return (
    <div className="w-full flex flex-col gap-6" id="card-customization-form">
      {/* SECTION: Quick Presets */}
      <div className="border border-zinc-800 bg-black/40 backdrop-blur-md rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-zinc-200 text-sm font-semibold uppercase tracking-wider font-mono">
            Direct Configuration Presets
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.config)}
              className="text-left bg-zinc-900/60 hover:bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-950 hover:border-zinc-800 transition-all text-xs"
            >
              <div className="font-semibold text-zinc-100 font-mono mb-0.5">{p.name}</div>
              <div className="text-[10px] text-zinc-400 leading-relaxed truncate">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION: Laser Engraving Inputs */}
      <div className="border border-zinc-800 bg-black/40 backdrop-blur-md rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
          <CreditCard className="w-4 h-4 text-zinc-400" />
          <h3 className="text-zinc-200 text-sm font-semibold uppercase tracking-wider font-mono">
            Interactive Engraving Specifications
          </h3>
        </div>

        {/* Card Number Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
              Laser Custom Number
            </label>
            <button
              type="button"
              onClick={generateRandomNumbers}
              className="text-[9px] text-[#d4af37] hover:text-[#f3e5ab] font-mono flex items-center gap-1 uppercase transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Randomize
            </button>
          </div>
          <input
            type="text"
            pattern="[0-9 ]*"
            value={config.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-100 rounded-lg py-2.5 px-3 font-mono text-sm tracking-widest outline-none transition-colors"
          />
        </div>

        {/* Holder Name & Expiry / CVV Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">
              Cardholder Name
            </label>
            <input
              type="text"
              maxLength={24}
              value={config.cardHolder}
              onChange={(e) => updateField('cardHolder', e.target.value.toUpperCase())}
              placeholder="VOID MEMBER"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-100 rounded-lg py-2 px-3 font-mono text-xs uppercase outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">
                Expiry Date
              </label>
              <input
                type="text"
                maxLength={5}
                value={config.expiryDate}
                onChange={handleExpiryChange}
                placeholder="12/29"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-100 rounded-lg py-2 px-3 font-mono text-xs text-center outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5">
                Secure CVV
              </label>
              <input
                type="text"
                maxLength={3}
                value={config.cvv}
                onFocus={onFocusCvv}
                onBlur={onBlurCvv}
                onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="000"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-zinc-100 rounded-lg py-2 px-3 font-mono text-xs text-center outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Custom Aesthetics */}
      <div className="border border-zinc-800 bg-black/40 backdrop-blur-md rounded-xl p-5 space-y-5">
        
        {/* CHIP SELECTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="text-[10px] text-zinc-200 uppercase tracking-widest font-mono font-bold">
              Integrated Circuit Core Block
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5">
            {[
              { id: 'stealth', name: 'Stealth', desc: 'No-shine' },
              { id: 'modern', name: 'Carbon', desc: 'Satin line' },
              { id: 'classic', name: 'Classic', desc: 'Luxury gold' },
              { id: 'cyber', name: 'Matrix', desc: 'Neon chip' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateField('chipStyle', chip.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  config.chipStyle === chip.id
                    ? 'border-[#d4af37] bg-zinc-900/60 text-zinc-100'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <div className="text-xs font-semibold font-mono">{chip.name}</div>
                <div className="text-[8px] text-zinc-500 mt-0.5">{chip.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* LOGO SYMBOL */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="text-[10px] text-zinc-200 uppercase tracking-widest font-mono font-bold">
              Central Emblem Engraving
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5">
            {[
              { id: 'none', label: 'Void Crypt' },
              { id: 'ouroboros', label: 'Infin Snake' },
              { id: 'eye', label: 'Prov Eye' },
              { id: 'geometric', label: 'Solomon Seal' },
              { id: 'phoenix', label: 'Grand Wing' }
            ].map((logo) => (
              <button
                key={logo.id}
                type="button"
                onClick={() => updateField('logoStyle', logo.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  config.logoStyle === logo.id
                    ? 'border-[#d4af37] bg-zinc-900/60 text-zinc-100'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <div className="text-[10.5px] font-semibold font-mono truncate">{logo.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FINISH MATERIAL TYPE */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="text-[10px] text-zinc-200 uppercase tracking-widest font-mono font-bold">
              Physical Card Texture & Finish
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5">
            {[
              { id: 'matte-obsidian', label: 'Matte Obsidian', desc: 'Pure non-reflective' },
              { id: 'brushed-carbon', label: 'Brushed Carbon', desc: 'Tactile textured lines' },
              { id: 'stardust-black', label: 'Stardust Sparkle', desc: 'Astronomical galaxy bits' }
            ].map((finish) => (
              <button
                key={finish.id}
                type="button"
                onClick={() => updateField('finishType', finish.id)}
                className={`py-2.5 px-2 rounded-lg border text-left transition-all ${
                  config.finishType === finish.id
                    ? 'border-[#d4af37] bg-zinc-900/60 text-zinc-100'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <div className="text-xs font-semibold font-mono block truncate">{finish.label}</div>
                <div className="text-[8px] text-zinc-500 mt-0.5 leading-tight">{finish.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* GLOWING BORDERS */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="text-[10px] text-zinc-200 uppercase tracking-widest font-mono font-bold">
              Chamfered Rim Coating
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5">
            {[
              { id: 'none', label: 'Obsidian Rim' },
              { id: 'gold', label: 'Gold Leaf' },
              { id: 'silver', label: 'Satin Zinc' },
              { id: 'neon-blue', label: 'Phosphor' }
            ].map((border) => (
              <button
                key={border.id}
                type="button"
                onClick={() => updateField('borderStyle', border.id)}
                className={`py-2.5 px-1 rounded-lg border text-center transition-all ${
                  config.borderStyle === border.id
                    ? 'border-[#d4af37] bg-zinc-900/60 text-zinc-100'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <div className="text-[11px] font-semibold font-mono truncate">{border.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FONT COLOR EMBOSSING */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            <h4 className="text-[10px] text-zinc-200 uppercase tracking-widest font-mono font-bold">
              Laser Etch Infused Color
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5">
            {[
              { id: 'silver-white', label: 'Silver White' },
              { id: 'gold', label: 'Pure Gold' },
              { id: 'matte', label: 'Charcoal Stealth' },
              { id: 'phosphor-blue', label: 'Acid Cyber' }
            ].map((fontColor) => (
              <button
                key={fontColor.id}
                type="button"
                onClick={() => updateField('fontColor', fontColor.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  config.fontColor === fontColor.id
                    ? 'border-[#d4af37] bg-zinc-900/60 text-zinc-100'
                    : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <div className="text-[11px] font-semibold font-mono truncate">{fontColor.label}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
