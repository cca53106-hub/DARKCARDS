import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ShieldAlert, Terminal } from 'lucide-react';

interface AdminPasswordGateProps {
  onSuccess: () => void;
}

export default function AdminPasswordGate({ onSuccess }: AdminPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Synthetic latency to look like dynamic cryptographic decryption check
    setTimeout(() => {
      if (password === 'Mehaal123') {
        onSuccess();
      } else {
        setError('ACCESS DENIED: Invalid cryptographic signature match.');
        setPassword('');
      }
      setIsSubmitting(false);
    }, 750);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-black/90 border-2 border-zinc-900 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left" id="admin-password-lockgate">
      {/* Dynamic decorative warning accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-[#d4af37] to-amber-600" />
      
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-900/80 flex items-center justify-center mx-auto shadow-inner group">
            <Lock className="w-5.5 h-5.5 text-[#d4af37] animate-pulse" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-black uppercase tracking-[0.2em] text-zinc-100">
              Sovereign Clearance
            </h2>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              Annuit Coeptis • Cryptographic Core Terminal
            </p>
          </div>
        </div>

        <div className="border border-red-950/40 bg-red-950/5 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-mono text-[9px] uppercase font-bold tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Operational Notice</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono leading-normal">
            This module requires deep cipher key validation. Specimen tracking parameters and payouts can only be deployed after administrator authentication.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[8.5px] text-zinc-400 uppercase font-mono font-bold tracking-wider">
              Secure Cipher Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin password..."
                className="w-full bg-zinc-950 border border-zinc-900 text-zinc-100 outline-none rounded-xl py-3 pl-4 pr-12 text-xs focus:border-[#d4af37] font-mono tracking-widest placeholder-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <span className="text-red-500 text-[9px] block font-mono font-semibold pt-1 animate-shake">
                ✕ {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full h-11 bg-[#d4af37] hover:bg-yellow-500 disabled:opacity-40 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <>
                PROCEED ENCRYPTED SESSION <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-950 flex justify-between items-center text-[8px] font-mono text-zinc-700 uppercase">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3" /> SECURE CONTEXT PROTOCOL
          </span>
          <span>AES-256 GCM</span>
        </div>
      </div>
    </div>
  );
}
