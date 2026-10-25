import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface PWAUpdateToastProps {
  show: boolean;
  onDismiss: () => void;
}

export const PWAUpdateToast: React.FC<PWAUpdateToastProps> = ({ show, onDismiss }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md shadow-xl shadow-emerald-500/10 text-emerald-300 text-xs font-semibold flex items-center space-x-2 pointer-events-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sorte Royale atualizado automaticamente para a versão mais recente!</span>
          <button
            onClick={onDismiss}
            className="ml-2 text-emerald-400/80 hover:text-emerald-200 text-xs font-bold underline"
          >
            OK
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
