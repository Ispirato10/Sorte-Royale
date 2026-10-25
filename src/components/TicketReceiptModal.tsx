import React, { useState } from 'react';
import { X, Printer, Crown, CheckCircle2, Download, Share2, FileText, Check } from 'lucide-react';
import { GeneratedGame } from '../types';
import { LOTTERIES } from '../data/lotteries';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';
import { generateTicketPDF } from '../utils/pdfGenerator';

interface TicketReceiptModalProps {
  game: GeneratedGame;
  onClose: () => void;
}

export const TicketReceiptModal: React.FC<TicketReceiptModalProps> = ({ game, onClose }) => {
  const config = LOTTERIES.find(l => l.id === game.lotteryId);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const handleDownloadPdf = () => {
    soundManager.playClick();
    setIsDownloadingPdf(true);
    try {
      const ok = generateTicketPDF(game);
      if (ok) {
        showNotification('Bilhete em PDF gerado e baixado com sucesso!');
      } else {
        showNotification('Erro ao gerar PDF. Baixando versão em texto...');
        handleDownloadTxt();
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      handleDownloadTxt();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    soundManager.playClick();
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      } else {
        handleDownloadPdf();
      }
    } catch {
      // In sandboxed iframes or restricted environments, fallback directly to PDF
      handleDownloadPdf();
    }
  };

  const handleDownloadTxt = () => {
    soundManager.playClick();
    const text = `=================================\n BILHETE SORTE ROYALE - COMPROVANTE\n=================================\nModalidade: ${game.lotteryName}\nData/Hora: ${game.createdAt}\nID da Aposta: #${game.id.toUpperCase()}\n---------------------------------\nDEZENAS ESCOLHIDAS:\n${game.numbers.map(n => String(n).padStart(2, '0')).join(', ')}\n${game.extraNumbers ? `EXTRA (${config?.extraName || 'Extra'}): ${game.extraNumbers.join(', ')}\n` : ''}=================================\nValidado por Sorte Royale`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bilhete_${game.lotteryName.replace(/\s+/g, '_')}_${game.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Arquivo de texto (.txt) baixado!');
  };

  const handleShare = async () => {
    soundManager.playClick();
    const text = `🎫 *BILHETE SORTE ROYALE*\n🍀 Modalidade: ${game.lotteryName}\n🔢 Dezenas: ${game.numbers.map(n => String(n).padStart(2, '0')).join(', ')}${game.extraNumbers ? `\n⭐ Extra: ${game.extraNumbers.join(', ')}` : ''}\n📅 Data: ${game.createdAt}\nID: #${game.id.toUpperCase()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bilhete ${game.lotteryName} - Sorte Royale`,
          text: text,
        });
        showNotification('Bilhete compartilhado!');
        return;
      } catch {
        // User cancelled share or share failed
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showNotification('Dezenas copiadas para a área de transferência!');
      } else {
        showNotification('Bilhete pronto para salvar ou imprimir!');
      }
    } catch {
      showNotification('Bilhete pronto para download abaixo!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 md:p-8 shadow-2xl shadow-amber-500/30 text-slate-100 overflow-hidden my-auto print-ticket-root">
        
        {/* Background glow watermark */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none no-print" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10 no-print"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn no-print">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Printable Ticket Content */}
        <div id="printable-ticket" className="space-y-5">
          <div className="text-center space-y-1.5 border-b border-amber-500/20 pb-5">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg md:text-xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                BILHETE SORTE ROYALE
              </h3>
            </div>
            <p className="text-xs text-amber-400/80 font-medium uppercase tracking-widest">
              Comprovante Oficial de Aposta Gerada
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Modalidade:</span>
              <span className={`px-3 py-1 rounded-full font-bold border ${config?.badgeColor || 'bg-amber-500/20 text-amber-400'}`}>
                {game.lotteryName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Data e Hora:</span>
              <span className="font-semibold text-slate-200">{game.createdAt}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ID da Aposta:</span>
              <span className="font-mono text-amber-400 font-bold">#{game.id.toUpperCase()}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 text-center">
              Dezenas Escolhidas
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {game.numbers.map((num, idx) => (
                <Ball3D
                  key={idx}
                  number={num}
                  lotteryId={game.lotteryId}
                  size="md"
                  delayIndex={idx}
                />
              ))}
            </div>

            {game.extraNumbers && game.extraNumbers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
                  {config?.extraName || 'Extra'}
                </p>
                <div className="flex justify-center gap-2">
                  {game.extraNumbers.map((ext, idx) => (
                    <Ball3D
                      key={idx}
                      number={ext}
                      isExtra={true}
                      size="sm"
                      delayIndex={game.numbers.length + idx}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-amber-500/20 text-center space-y-1">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Validado pelo Sistema Sorte Royale</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">||| |||| || | |||| ||| |||| | ||||</p>
          </div>
        </div>

        {/* Modal Actions - Optimized for Mobile & Desktop */}
        <div className="mt-6 space-y-2.5 no-print">
          {/* Main Action: Direct PDF Download */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>{isDownloadingPdf ? 'Gerando PDF...' : 'Baixar Bilhete em PDF'}</span>
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Imprimir comprovante"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Compartilhar bilhete"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              title="Baixar em formato texto"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Texto (.txt)</span>
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
