import React from 'react';
import { Download } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface PWAInstallButtonProps {
  isInstalled: boolean;
  onOpenModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isInstalled, onOpenModal }) => {
  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    soundManager.playClick();
    onOpenModal();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/15 via-amber-500/20 to-yellow-600/15 hover:from-amber-400/25 hover:to-yellow-600/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
      title="Instalar Sorte Royale no dispositivo"
    >
      <Download className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
      <span className="hidden sm:inline">Instalar App</span>
      <span className="sm:hidden">Instalar</span>
    </button>
  );
};
