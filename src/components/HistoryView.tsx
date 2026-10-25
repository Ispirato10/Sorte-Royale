import React, { useState } from 'react';
import { History as HistoryIcon, Bookmark, Trash2, Copy, Check } from 'lucide-react';
import { GeneratedGame } from '../types';
import { LOTTERIES } from '../data/lotteries';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';

interface HistoryViewProps {
  history: GeneratedGame[];
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  favorites: GeneratedGame[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onToggleFavorite,
  onClearHistory,
  favorites
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyGame = (game: GeneratedGame) => {
    soundManager.playClick();
    const text = `${game.lotteryName} - Sorte Royale:\nDezenas: ${game.numbers.map(n => String(n).padStart(2, '0')).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(game.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isFav = (id: string) => favorites.some(f => f.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            Últimos Jogos Gerados
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Histórico das últimas 10 apostas geradas na sua sessão de sorteios.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              soundManager.playClick();
              onClearHistory();
            }}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-1.5 transition-all w-fit"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Histórico</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Nenhum jogo gerado recentemente</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Utilize a aba Gerador de Sorte para criar seus palpites de sorte.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((game, idx) => {
            const config = LOTTERIES.find(l => l.id === game.lotteryId);
            const favorite = isFav(game.id);

            return (
              <div
                key={game.id}
                className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-xs text-slate-500 font-bold">#{history.length - idx}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
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
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                    }`}
                    title={favorite ? 'Remover dos favoritos' : 'Favoritar Jogo'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => copyGame(game)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    {copiedId === game.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === game.id ? 'Copiado!' : 'Copiar'}</span>
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
