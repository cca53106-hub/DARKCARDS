import React from 'react';
import { Order, CardConfig } from '../types';
import { Database, Search, Clipboard, Clock, CheckCircle2, ShieldAlert, Cpu, Hammer, Package, Truck, Unlock } from 'lucide-react';

interface VaultProps {
  orders: Order[];
  onSearchTracker: (tracking: string) => void;
  onDecodeCard?: (card: CardConfig) => void;
}

export default function Vault({ orders, onDecodeCard }: VaultProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  
  const filteredOrders = searchTerm.trim() === ''
    ? orders
    : orders.filter(o => {
        const tracking = o.trackingNumber || '';
        const cardHolder = o.config?.cardHolder || '';
        const search = searchTerm.trim().toUpperCase();
        return tracking.toUpperCase().includes(search) || cardHolder.toUpperCase().includes(search);
      });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Shipped':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Quality Check':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Engraving':
      default:
        return 'text-[#d4af37] bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Quick formatter
  const maskCardNum = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  };

  return (
    <div className="space-y-6" id="sovereign-vault-system">
      {/* SECTION: Search/Lookup bar */}
      <div className="w-full flex flex-col md:flex-row gap-3 items-center justify-between border border-zinc-900 bg-neutral-950/60 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[#d4af37] animate-pulse" />
          <div>
            <h3 className="text-zinc-200 text-sm font-semibold uppercase tracking-wider font-mono">
              Onion Node Dispatch Directory
            </h3>
            <p className="text-zinc-500 text-[10px]">
              Query peer-to-peer encryption databases with secure token keys.
            </p>
          </div>
        </div>

        {/* Dynamic Search box */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cipher keys or trackings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 text-zinc-350 rounded-lg py-2 pl-9 pr-3 text-xs font-mono outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-red-950/40 bg-red-950/5 rounded-2xl p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900 text-red-500 mb-4 animate-pulse">
            <Clipboard className="w-5 h-5" />
          </div>
          <h3 className="text-zinc-350 text-sm font-semibold tracking-wider font-mono uppercase mb-1">
            Cipher Ledger is Empty
          </h3>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            Acquire active metal obsidian custom drops in the Oracle Forge to verify payment and register them in this secure directory vault.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center p-8 text-zinc-500 font-mono text-xs">
          No records match term "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const steps = [
              { label: 'Pyramid Core Activation', icon: Hammer, desc: 'Laser coordinate fusion complete', duration: 'Complete' },
              { label: 'Sovereign Courier Dispatch', icon: Truck, desc: 'Decoded logistics transit and GPS drop nodes', tracking: order.trackingNumber }
            ];

            return (
              <div 
                key={order.id}
                className="border border-zinc-850 bg-black/40 rounded-xl p-5 hover:border-zinc-750 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Stats */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block font-bold">// Reference Hash</span>
                      <span className="text-xs font-semibold text-zinc-100 font-mono">
                        #{order.id.slice(4, 12).toUpperCase()}
                      </span>
                    </div>

                    <div className={`text-[10px] font-mono font-semibold py-1 px-2.5 rounded-full border ${getStatusColor(order.status)} animate-pulse`}>
                      ACTIVE • {order.status}
                    </div>
                  </div>

                  {/* Configured Details preview block */}
                  <div className="bg-zinc-950 rounded-lg p-3.5 border border-zinc-900 mb-4 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-zinc-200 tracking-wider font-mono">
                        {order.config.cardHolder || 'VOID ANONYMOUS'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#d4af37]">
                        $20.00 Verified
                      </span>
                    </div>
                    
                    <div className="text-[10.5px] font-mono text-zinc-500 flex justify-between">
                      <span>{maskCardNum(order.config.cardNumber)}</span>
                      <span className="uppercase text-[9px] text-[#d4af37]/75">
                        {order.config.finishType.replace('-', ' ')}
                      </span>
                    </div>

                    {/* INTERACTIVE 3D ROTATION TRIGGER */}
                    {onDecodeCard && (
                      <button
                        type="button"
                        onClick={() => onDecodeCard(order.config)}
                        className="w-full h-10 mt-4 bg-gradient-to-r from-red-700 via-yellow-600 to-[#d4af37] text-white hover:opacity-90 font-black text-[10px] font-mono tracking-widest uppercase rounded-lg shadow-md duration-250 flex items-center justify-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Decrypt & Extract Balance
                      </button>
                    )}
                  </div>

                  {/* SIMULATED ROBOTICS PIPELINE */}
                  <div className="space-y-3">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono block mb-1">
                      Mempool Tracking Telemetry
                    </span>
                    
                    {steps.map((step, idx) => {
                      const IconComponent = step.icon;
                      let isComplete = false;
                      let isActive = false;

                      if (order.status === 'Delivered') {
                        isComplete = true;
                      } else {
                        if (idx === 0) isComplete = true;
                        if (idx === 1) isActive = true;
                      }

                      return (
                        <div key={idx} className="flex gap-3 text-xs items-start text-left">
                          <div className="flex flex-col items-center">
                            <div className={`p-1 rounded-full border ${
                              isComplete 
                              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' 
                              : isActive 
                              ? 'text-[#d4af37] border-[#d4af37]/40 bg-yellow-500/10' 
                              : 'text-zinc-600 border-zinc-800 bg-zinc-900/20'
                            }`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            {idx < steps.length - 1 && (
                              <div className={`w-[1px] h-6 ${
                                isComplete ? 'bg-emerald-500/40' : 'bg-zinc-800'
                              }`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold font-mono">
                              <span className={isComplete ? 'text-zinc-350 font-bold' : isActive ? 'text-zinc-100' : 'text-zinc-500'}>
                                {step.label}
                              </span>
                              {isComplete && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-normal mb-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking code footer */}
                <div className="mt-5 pt-3.5 border-t border-zinc-900 flex justify-between items-center text-xs">
                  <div className="text-left">
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Logistics hash</span>
                    <span className="font-mono text-zinc-400 font-semibold truncate max-w-[150px] inline-block">
                      {order.trackingNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.trackingNumber, order.id)}
                    className={`flex items-center gap-1 font-mono text-[9px] px-2.5 py-1.5 rounded-lg border transition-all uppercase font-medium ${
                      copiedId === order.id 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clipboard className="w-2.5 h-2.5" />
                    {copiedId === order.id ? '✓ Copied' : 'Copy Hash'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
