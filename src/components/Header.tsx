import React from 'react';
import { Sparkles, Volume2, VolumeX, Shield, Crown } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPWAInstalled?: boolean;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  isPWAInstalled = false,
  onOpenInstall
}) => {
  return (
    <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-3 sm:px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 shadow-lg shadow-amber-500/20 text-slate-950 shrink-0">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-cinzel leading-none">
              SORTE ROYALE
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-400/70 tracking-widest uppercase font-medium mt-0.5">
              Loteria Royale & Estatísticas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* In-App PWA Install Button */}
          {onOpenInstall && !isPWAInstalled && (
            <PWAInstallButton isInstalled={isPWAInstalled} onOpenModal={onOpenInstall} />
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300 flex items-center space-x-1.5 sm:space-x-2 text-xs font-medium cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Desativar Sons' : 'Ativar Sons'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sons' : 'Mudo'}</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gerador Oficial & Estatístico</span>
          </div>
        </div>
      </div>
    </header>
  );
};
