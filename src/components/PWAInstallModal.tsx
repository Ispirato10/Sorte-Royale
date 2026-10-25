import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, Download, X, Zap, ShieldCheck, WifiOff, Smartphone, Share, PlusSquare } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { triggerFireworks } from '../utils/confetti';

interface PWAInstallModalProps {
  isOpen: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  isIOS,
  onInstall,
  onClose,
}) => {
  const handleInstallClick = async () => {
    soundManager.playClick();
    const success = await onInstall();
    if (success) {
      triggerFireworks();
      soundManager.playWinFanfare();
    }
  };

  const handleDismiss = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-3 sm:p-5 overflow-y-auto">
          {/* Animated Modal Container with Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 35, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 25 }}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(245,158,11,0.3)] text-slate-100 overflow-hidden my-auto"
          >
            {/* Ambient Golden Radial Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors z-20 cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Royal Crown Emblem */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
                className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 shadow-xl shadow-amber-500/30 text-slate-950 border-2 border-amber-300/80"
              >
                <Crown className="w-11 h-11" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                </div>
              </motion.div>

              <div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Aplicativo Oficial PWA</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                  Instalar Sorte Royale
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Adicione o gerador de loterias diretamente à tela inicial do seu dispositivo.
                </p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="mt-5 space-y-2.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
              <div className="flex items-start space-x-3 text-left">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Acesso Instantâneo com 1 Toque</h4>
                  <p className="text-[11px] text-slate-400">Abra direto da sua tela inicial sem abrir navegador.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-left">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Funciona Offline & Ultra Rápido</h4>
                  <p className="text-[11px] text-slate-400">Carregamento instantâneo com cache automático inteligente.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-left">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Experiência Imersiva em Tela Cheia</h4>
                  <p className="text-[11px] text-slate-400">Sem barra de endereços, aproveitando 100% da sua tela.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-left">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">100% Leve & Seguro</h4>
                  <p className="text-[11px] text-slate-400">Atualizações automáticas sempre que houver novidades.</p>
                </div>
              </div>
            </div>

            {/* iOS Instructions or One-Click Android/Desktop Install */}
            <div className="mt-5 space-y-2.5">
              {isIOS ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2">
                  <p className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Como instalar no iPhone ou iPad:</span>
                  </p>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pl-1">
                    <li className="leading-relaxed">
                      Toque no botão <strong className="text-amber-400 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" /> Compartilhar</strong> na barra do Safari.
                    </li>
                    <li className="leading-relaxed">
                      Role para baixo e selecione <strong className="text-amber-400 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Adicionar à Tela de Início</strong>.
                    </li>
                    <li className="leading-relaxed">
                      Confirme em <strong>Adicionar</strong> no canto superior direito.
                    </li>
                  </ol>
                  <button
                    onClick={handleDismiss}
                    className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Entendi, vou adicionar!
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Instalar Aplicativo Agora</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
                  >
                    Lembrar mais tarde
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
