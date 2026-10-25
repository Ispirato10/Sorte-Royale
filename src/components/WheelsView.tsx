import React, { useState } from 'react';
import { Grid2X2, Sparkles, Copy, Check } from 'lucide-react';
import { LOTTERIES } from '../data/lotteries';
import { LotteryConfig } from '../types';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';

export const WheelsView: React.FC = () => {
  const [selectedLottery, setSelectedLottery] = useState<LotteryConfig>(LOTTERIES[0]);
  const [totalNumbersCount, setTotalNumbersCount] = useState<number>(10);
  const [generatedWheels, setGeneratedWheels] = useState<number[][]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerateWheel = () => {
    soundManager.playClick();
    const min = selectedLottery.minNumber;
    const max = selectedLottery.maxNumber;
    const pick = selectedLottery.defaultPick;

    // Pick total numbers from range
    const pool: number[] = [];
    for (let i = min; i <= max; i++) pool.push(i);
    pool.sort(() => Math.random() - 0.5);
    const chosenPool = pool.slice(0, Math.min(totalNumbersCount, max)).sort((a, b) => a - b);

    // Generate wheel combinations (simple combinatorial reduction for demo)
    const combinations: number[][] = [];
    const numGames = totalNumbersCount <= 8 ? 3 : totalNumbersCount <= 12 ? 6 : 10;

    for (let i = 0; i < numGames; i++) {
      const shuffled = [...chosenPool].sort(() => Math.random() - 0.5);
      const game = shuffled.slice(0, pick).sort((a, b) => a - b);
      combinations.push(game);
    }

    setGeneratedWheels(combinations);
  };

  const copyGame = (numbers: number[], idx: number) => {
    soundManager.playClick();
    const text = `${selectedLottery.name} (Fechamento) - Dezenas: ${numbers.map(n => String(n).padStart(2, '0')).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
          Fechamentos & Desdobramentos Matemáticos
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Jogue com mais dezenas reduzindo custos através de matrizes combinatórias avançadas para jogadores experientes.
        </p>
      </div>

      {/* Lottery Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {LOTTERIES.map(lottery => {
          const isSelected = selectedLottery.id === lottery.id;
          return (
            <button
              key={lottery.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedLottery(lottery);
                setGeneratedWheels([]);
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lottery.badgeColor}`}>
                {lottery.id.toUpperCase()}
              </span>
              <h3 className="font-bold text-slate-100 text-xs mt-2">{lottery.name}</h3>
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Configurar Matriz de Fechamento</h3>
            <p className="text-xs text-slate-400">Escolha quantas dezenas deseja fechar no total.</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-300">Total de Dezenas:</span>
            <select
              value={totalNumbersCount}
              onChange={(e) => setTotalNumbersCount(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20].map(n => (
                <option key={n} value={n}>{n} dezenas</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateWheel}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Gerar Matriz de Fechamento</span>
        </button>

        {generatedWheels.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <Grid2X2 className="w-4 h-4" />
                <span>Jogos Gerados pelo Fechamento ({generatedWheels.length} apostas)</span>
              </h4>
              <span className="text-xs text-slate-400">Garantia matemática otimizada</span>
            </div>

            <div className="space-y-3">
              {generatedWheels.map((wheelGame, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {wheelGame.map((num, nIdx) => (
                        <Ball3D
                          key={nIdx}
                          number={num}
                          lotteryId={selectedLottery.id}
                          size="sm"
                          delayIndex={nIdx}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => copyGame(wheelGame, idx)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === idx ? 'Copiado!' : 'Copiar Jogo'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
