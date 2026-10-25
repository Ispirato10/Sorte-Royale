import React, { useState } from 'react';
import { Sparkles, Dices, Bookmark, Crown, ChevronRight, History } from 'lucide-react';
import { LotteryConfig, GeneratedGame } from '../types';
import { LOTTERIES } from '../data/lotteries';
import { LotteryGeneratorModal } from './LotteryGeneratorModal';
import { TicketReceiptModal } from './TicketReceiptModal';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';

interface GeneratorViewProps {
  onSaveGame: (game: GeneratedGame) => void;
  favorites: GeneratedGame[];
  onToggleFavorite: (id: string) => void;
  onNavigateToAI: (game: GeneratedGame) => void;
  history: GeneratedGame[];
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onSaveGame,
  favorites,
  onToggleFavorite,
  onNavigateToAI,
  history
}) => {
  const [activeModalLottery, setActiveModalLottery] = useState<LotteryConfig | null>(null);
  const [receiptGame, setReceiptGame] = useState<GeneratedGame | null>(null);

  const handleCardClick = (lottery: LotteryConfig) => {
    soundManager.playClick();
    setActiveModalLottery(lottery);
  };

  const isFav = (id: string) => favorites.some(f => f.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {activeModalLottery && (
        <LotteryGeneratorModal
          lottery={activeModalLottery}
          onClose={() => setActiveModalLottery(null)}
          onSaveGame={onSaveGame}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onNavigateToAI={onNavigateToAI}
        />
      )}

      {receiptGame && (
        <TicketReceiptModal
          game={receiptGame}
          onClose={() => setReceiptGame(null)}
        />
      )}

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" />
          <span>Loteria Royale VIP</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
          Gerador Inteligente de Sorteios
        </h2>
        <p className="text-slate-400 text-sm">
          Selecione abaixo a modalidade desejada para abrir o gerador interativo em 3D.
        </p>
      </div>

      {/* Small Elegant Cards Grid (Original Layout Restored) */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {LOTTERIES.map(lottery => (
            <button
              key={lottery.id}
              onClick={() => handleCardClick(lottery)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between group"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mb-2 ${lottery.badgeColor}`}>
                  {lottery.id.toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors font-cinzel">
                  {lottery.name}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                <span>Sortear</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick History / Relação dos Números Gerados Recentemente */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Relação dos Últimos Números Gerados</h3>
          </div>
          <span className="text-xs text-slate-400">Sua sessão atual</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            Nenhum jogo gerado ainda. Clique em um dos cards acima para sortear.
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 10).map((game, idx) => {
              const config = LOTTERIES.find(l => l.id === game.lotteryId);
              const favorite = isFav(game.id);

              return (
                <div
                  key={game.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500 font-bold">#{history.length - idx}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${config?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {game.lotteryName}
                      </span>
                      <span className="text-xs text-slate-400">{game.createdAt}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      {game.numbers.map((num, nIdx) => (
                        <Ball3D
                          key={nIdx}
                          number={num}
                          lotteryId={game.lotteryId}
                          size="md"
                          delayIndex={nIdx}
                        />
                      ))}
                      {game.extraNumbers && game.extraNumbers.map((ext, eIdx) => (
                        <Ball3D
                          key={`ext-${eIdx}`}
                          number={ext}
                          isExtra={true}
                          size="md"
                          delayIndex={game.numbers.length + eIdx}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onToggleFavorite(game.id);
                      }}
                      className={`p-2.5 rounded-xl border transition-all ${
                        favorite
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                      }`}
                      title={favorite ? 'Remover dos favoritos' : 'Favoritar Jogo'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setReceiptGame(game)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 text-xs font-semibold transition-all"
                    >
                      Ver Bilhete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
