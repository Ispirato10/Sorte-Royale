import React from 'react';
import { Sparkles, Volume2, VolumeX, Shield, Crown } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({ soundEnabled, onToggleSound }) => {
  return (
    <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 shadow-lg shadow-amber-500/20 text-slate-950">
            <Crown className="w-6 h-6 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-cinzel">
              SORTE ROYALE
            </h1>
            <p className="text-xs text-amber-400/70 tracking-widest uppercase font-medium">
              Loteria Royale & Estatísticas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center space-x-2 text-xs font-medium ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sons Ativos' : 'Mudo'}</span>
          </button>

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gerador Oficial & Estatístico</span>
          </div>
        </div>
      </div>
    </header>
  );
};
