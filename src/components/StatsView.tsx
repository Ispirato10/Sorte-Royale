import React, { useState } from 'react';
import { BarChart3, Flame, Snowflake, Clock } from 'lucide-react';
import { LotteryConfig, LotteryStats } from '../types';
import { LOTTERIES } from '../data/lotteries';
import { getLotteryStats } from '../utils/lotteryEngine';
import { soundManager } from '../utils/sound';

export const StatsView: React.FC = () => {
  const [selectedLottery, setSelectedLottery] = useState<LotteryConfig>(LOTTERIES[0]);
  const stats: LotteryStats[] = getLotteryStats(selectedLottery);

  const hotNumbers = [...stats].sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  const coldNumbers = [...stats].sort((a, b) => a.frequency - b.frequency).slice(0, 5);
  const overdueNumbers = [...stats].sort((a, b) => b.lastDrawnDaysAgo - a.lastDrawnDaysAgo).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
          Estatísticas & Frequência Estatística
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Análise completa de dezenas quentes, frias e atrasadas com base em histórico de sorteios.
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hot Numbers */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 text-emerald-400">
            <Flame className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide uppercase">Dezenas Mais Quentes</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {hotNumbers.map(item => (
              <div key={item.number} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-black text-base shadow flex items-center justify-center border border-emerald-300">
                  {String(item.number).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{item.frequency}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 text-blue-400">
            <Snowflake className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide uppercase">Dezenas Mais Frias</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {coldNumbers.map(item => (
              <div key={item.number} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 font-black text-base shadow flex items-center justify-center">
                  {String(item.number).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{item.frequency}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Numbers */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 text-amber-400">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-wide uppercase">Dezenas Mais Atrasadas</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {overdueNumbers.map(item => (
              <div key={item.number} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-base shadow flex items-center justify-center">
                  {String(item.number).padStart(2, '0')}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{item.lastDrawnDaysAgo} dias</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Frequency Table */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Frequência Completa - {selectedLottery.name}</h3>
          </div>
          <span className="text-xs text-slate-400">Intervalo: 01 a {selectedLottery.maxNumber}</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {stats.map(st => (
            <div
              key={st.number}
              className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center hover:border-amber-500/50 transition-all"
            >
              <span className="font-black text-slate-100 text-base mb-1">
                {String(st.number).padStart(2, '0')}
              </span>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${
                    st.status === 'hot'
                      ? 'bg-emerald-500'
                      : st.status === 'cold'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${st.frequency}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{st.frequency} sorteios</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
