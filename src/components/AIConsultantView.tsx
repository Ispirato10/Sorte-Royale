import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Dices, Send } from 'lucide-react';
import { GeneratedGame } from '../types';
import { getAILotteryAdvice } from '../utils/gemini';
import { soundManager } from '../utils/sound';

interface AIConsultantViewProps {
  activeGame: GeneratedGame | null;
  favorites: GeneratedGame[];
}

export const AIConsultantView: React.FC<AIConsultantViewProps> = ({ activeGame, favorites }) => {
  const [selectedGame, setSelectedGame] = useState<GeneratedGame | null>(activeGame || favorites[0] || null);
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [customKey, setCustomKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  useEffect(() => {
    if (activeGame) {
      setSelectedGame(activeGame);
    } else if (favorites.length > 0 && !selectedGame) {
      setSelectedGame(favorites[0]);
    }
  }, [activeGame, favorites]);

  useEffect(() => {
    if (selectedGame) {
      fetchAdvice(selectedGame);
    }
  }, [selectedGame]);

  const fetchAdvice = async (game: GeneratedGame) => {
    setLoading(true);
    soundManager.playClick();
    const result = await getAILotteryAdvice(game.lotteryName, game.numbers, customKey);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            Consultor IA da Sorte
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Análise estratégica avançada e insights numerológicos gerados por inteligência artificial.
          </p>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all w-fit"
        >
          <Brain className="w-4 h-4 text-amber-400" />
          <span>{showKeyInput ? 'Ocultar Chave API' : 'Configurar API Key Gemini'}</span>
        </button>
      </div>

      {showKeyInput && (
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
          <label className="block text-xs font-medium text-slate-300">
            Chave API Gemini (Opcional - o app utiliza a chave padrão caso omitida):
          </label>
          <div className="flex space-x-2">
            <input
              type="password"
              placeholder="Cole sua GEMINI_API_KEY aqui"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            {selectedGame && (
              <button
                onClick={() => fetchAdvice(selectedGame)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {favorites.length === 0 && !activeGame ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Nenhum jogo selecionado para análise</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Gere um jogo ou salve um favorito para receber consultoria estatística personalizada da IA.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Selector list */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 h-fit">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider text-amber-400">
              Selecione o Jogo para Consultoria
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {favorites.map(game => {
                const isSelected = selectedGame?.id === game.id;
                return (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">{game.lotteryName}</span>
                      <span className="text-[10px] text-slate-400">{game.createdAt}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {game.numbers.map(n => String(n).padStart(2, '0')).join(', ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Análise Estratégica & Numerológica</h3>
                  <p className="text-xs text-amber-400/80">{selectedGame?.lotteryName || 'Modalidade'}</p>
                </div>
              </div>

              {selectedGame && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  {selectedGame.numbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black text-sm flex items-center justify-center shadow"
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-400">Consultando inteligência artificial estatística...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-950/50 p-6 rounded-2xl border border-slate-800/80">
                  {advice}
                </div>
              )}
            </div>

            {selectedGame && !loading && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => fetchAdvice(selectedGame)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Nova Análise</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
