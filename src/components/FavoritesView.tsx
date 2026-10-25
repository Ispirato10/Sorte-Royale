import React, { useState } from 'react';
import { BookmarkCheck, Trash2, CheckCircle2, Award, Sparkles, Filter } from 'lucide-react';
import { GeneratedGame } from '../types';
import { LOTTERIES } from '../data/lotteries';
import { checkGameResult } from '../utils/lotteryEngine';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';

interface FavoritesViewProps {
  favorites: GeneratedGame[];
  onRemoveFavorite: (id: string) => void;
  onUpdateGame: (updated: GeneratedGame) => void;
  onNavigateToAI: (game: GeneratedGame) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onUpdateGame,
  onNavigateToAI
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const filteredFavorites = selectedFilter === 'all'
    ? favorites
    : favorites.filter(f => f.lotteryId === selectedFilter);

  const handleCheckResult = (game: GeneratedGame) => {
    soundManager.playClick();
    setCheckingId(game.id);

    const config = LOTTERIES.find(l => l.id === game.lotteryId);
    if (!config) {
      setCheckingId(null);
      return;
    }

    setTimeout(() => {
      const checkedResult = checkGameResult(game, config);
      const updated: GeneratedGame = {
        ...game,
        checkedResult
      };
      onUpdateGame(updated);
      setCheckingId(null);
      soundManager.playWinFanfare();
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            Meus Jogos Favoritos & Conferidor
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Salve seus palpites e confira os resultados automaticamente contra os sorteios oficiais.
          </p>
        </div>

        {/* Filter by Lottery */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todos ({favorites.length})
          </button>
          {LOTTERIES.map(l => {
            const count = favorites.filter(f => f.lotteryId === l.id).length;
            if (count === 0) return null;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedFilter(l.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedFilter === l.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {l.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Nenhum jogo favoritado ainda</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Gere seus números no Gerador de Sorte e salve seus palpites favoritos para acompanhá-los aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFavorites.map(game => {
            const config = LOTTERIES.find(l => l.id === game.lotteryId);
            const isChecking = checkingId === game.id;
            const hasChecked = !!game.checkedResult;

            return (
              <div
                key={game.id}
                className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {game.lotteryName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">{game.createdAt}</span>
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onRemoveFavorite(game.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers grid in 3D */}
                  <div className="flex flex-wrap items-center gap-2 my-4">
                    {game.numbers.map((num, idx) => {
                      const isMatched = hasChecked && game.checkedResult?.drawnNumbers.includes(num);
                      return (
                        <Ball3D
                          key={idx}
                          number={num}
                          lotteryId={game.lotteryId}
                          size="md"
                          delayIndex={idx}
                          isMatched={Boolean(isMatched)}
                        />
                      );
                    })}
                  </div>

                  {game.extraNumbers && game.extraNumbers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2">
                      <span className="text-[11px] text-amber-400 font-bold uppercase">{config?.extraName || 'Extra'}:</span>
                      <div className="flex space-x-2">
                        {game.extraNumbers.map((ext, idx) => {
                          const isMatchedExt = hasChecked && game.checkedResult?.drawnExtraNumbers?.includes(ext);
                          return (
                            <Ball3D
                              key={idx}
                              number={ext}
                              isExtra={true}
                              size="sm"
                              delayIndex={game.numbers.length + idx}
                              isMatched={Boolean(isMatchedExt)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Checked Result Banner */}
                {hasChecked && game.checkedResult && (
                  <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Concurso #{game.checkedResult.drawNumber}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{game.checkedResult.checkedAt}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-300">
                        Acertos: <strong className="text-amber-400">{game.checkedResult.matchedCount}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{game.checkedResult.prizeTier}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleCheckResult(game)}
                    disabled={isChecking}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    {isChecking ? (
                      <span className="animate-pulse">Conferindo...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{hasChecked ? 'Conferir Novamente' : 'Conferir Resultado'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigateToAI(game)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Análise IA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
