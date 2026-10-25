import React, { useState, useRef } from 'react';
import { X, Sparkles, SlidersHorizontal, Bookmark, Copy, Check, Printer, RefreshCw, Save, FileText } from 'lucide-react';
import { LotteryConfig, FilterOptions, GeneratedGame } from '../types';
import { generateLotteryNumbers } from '../utils/lotteryEngine';
import { LotteryTumbler } from './LotteryTumbler';
import { TicketReceiptModal } from './TicketReceiptModal';
import { Ball3D } from './Ball3D';
import { soundManager } from '../utils/sound';
import { triggerFireworks, triggerExplosion } from '../utils/confetti';

interface LotteryGeneratorModalProps {
  lottery: LotteryConfig;
  onClose: () => void;
  onSaveGame: (game: GeneratedGame) => void;
  favorites: GeneratedGame[];
  onToggleFavorite: (id: string) => void;
  onNavigateToAI: (game: GeneratedGame) => void;
}

export const LotteryGeneratorModal: React.FC<LotteryGeneratorModalProps> = ({
  lottery,
  onClose,
  onSaveGame,
  favorites,
  onToggleFavorite,
  onNavigateToAI
}) => {
  const [pickCount, setPickCount] = useState<number>(lottery.defaultPick);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filters
  const [fixedInput, setFixedInput] = useState<string>('');
  const [excludedInput, setExcludedInput] = useState<string>('');
  const [evenOddRatio, setEvenOddRatio] = useState<FilterOptions['evenOddRatio']>('any');
  const [sumMin, setSumMin] = useState<string>('');
  const [sumMax, setSumMax] = useState<string>('');
  const [avoidConsecutive, setAvoidConsecutive] = useState<boolean>(false);

  const [currentGame, setCurrentGame] = useState<GeneratedGame | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const getFilters = (): FilterOptions => {
    const fixedNumbers = fixedInput
      .split(/[,,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= lottery.minNumber && n <= lottery.maxNumber);

    const excludedNumbers = excludedInput
      .split(/[,,\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= lottery.minNumber && n <= lottery.maxNumber);

    let sumRange: [number, number] | undefined = undefined;
    const sMin = parseInt(sumMin);
    const sMax = parseInt(sumMax);
    if (!isNaN(sMin) && !isNaN(sMax) && sMin <= sMax) {
      sumRange = [sMin, sMax];
    }

    return {
      fixedNumbers,
      excludedNumbers,
      evenOddRatio,
      sumRange,
      avoidConsecutive
    };
  };

  const handleStartGenerate = () => {
    soundManager.playClick();
    setErrorMsg(null);
    try {
      const filters = getFilters();
      if (filters.fixedNumbers.length > pickCount) {
        throw new Error('A quantidade de números fixos não pode ser maior que a quantidade escolhida.');
      }
      setIsAnimating(true);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg('Erro ao configurar filtros.');
    }
  };

  const handleAnimationComplete = (game: GeneratedGame) => {
    setIsAnimating(false);
    setCurrentGame(game);
    setSavedStatus(true);

    requestAnimationFrame(() => {
      triggerFireworks();
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleQuickGenerate = () => {
    soundManager.playClick();
    setErrorMsg(null);
    try {
      const filters = getFilters();
      const result = generateLotteryNumbers(lottery, pickCount, filters);
      const newGame: GeneratedGame = {
        id: Math.random().toString(36).substring(2, 9),
        lotteryId: lottery.id,
        lotteryName: lottery.name,
        numbers: result.numbers,
        extraNumbers: result.extraNumbers,
        createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        isFavorite: false
      };

      onSaveGame(newGame);
      setCurrentGame(newGame);
      setSavedStatus(true);
      triggerExplosion();
      soundManager.playWinFanfare();

      requestAnimationFrame(() => {
        triggerFireworks();
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg('Erro ao gerar números.');
    }
  };

  const handleSaveResultManually = () => {
    if (!currentGame) return;
    soundManager.playClick();
    onSaveGame(currentGame);
    setSavedStatus(true);
    triggerFireworks();
  };

  const isCurrentGameFavorite = (): boolean => {
    if (!currentGame) return false;
    return favorites.some(f => f.id === currentGame.id || (f.lotteryId === lottery.id && f.numbers.every((n, i) => n === currentGame.numbers[i])));
  };

  const copyToClipboard = () => {
    if (!currentGame) return;
    const text = `${lottery.name} - Sorte Royale:\nNúmeros: ${currentGame.numbers.map(n => String(n).padStart(2, '0')).join(', ')}${currentGame.extraNumbers ? `\nExtra: ${currentGame.extraNumbers.join(', ')}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-3 md:p-6 overflow-y-auto animate-fadeIn">
      {isAnimating && (
        <LotteryTumbler
          config={lottery}
          pickCount={pickCount}
          onComplete={handleAnimationComplete}
          onClose={() => setIsAnimating(false)}
          onSaveGame={onSaveGame}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {showReceipt && currentGame && (
        <TicketReceiptModal game={currentGame} onClose={() => setShowReceipt(false)} />
      )}

      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 md:p-8 shadow-2xl shadow-amber-500/20 text-slate-100 my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800 pr-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${lottery.badgeColor}`}>
            {lottery.name}
          </span>
          <div>
            <h3 className="text-lg md:text-xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              {lottery.name} - Gerador Royale 3D
            </h3>
            <p className="text-xs text-slate-400">{lottery.subtitle}</p>
          </div>
        </div>

        {/* Generated Game Result - Placed at top if available so it's instantly visible */}
        {currentGame && (
          <div ref={resultRef} className="mb-6 bg-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 text-center space-y-5 animate-fadeIn shadow-xl shadow-amber-500/10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Resultado Sorteado (3D)</span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {currentGame.numbers.map((num, idx) => (
                <Ball3D
                  key={idx}
                  number={num}
                  lotteryId={lottery.id}
                  size="lg"
                  delayIndex={idx}
                />
              ))}
            </div>

            {currentGame.extraNumbers && currentGame.extraNumbers.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">{lottery.extraName || 'Extra'}</p>
                <div className="flex justify-center gap-2">
                  {currentGame.extraNumbers.map((ext, idx) => (
                    <Ball3D
                      key={idx}
                      number={ext}
                      isExtra={true}
                      size="md"
                      delayIndex={currentGame.numbers.length + idx}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Explicit Action Buttons requested: Salvar, Favoritar, Gerar PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveResultManually}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  savedStatus
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{savedStatus ? 'Salvo no Sistema' : 'Salvar Resultado'}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleFavorite(currentGame.id);
                  triggerFireworks();
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  isCurrentGameFavorite()
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isCurrentGameFavorite() ? 'Nos Favoritos' : 'Favoritar Jogo'}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowReceipt(true);
                }}
                className="py-3 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Gerar PDF / Bilhete</span>
              </button>
            </div>

            <div className="pt-1 flex justify-center">
              <button
                onClick={() => onNavigateToAI(currentGame)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Consultar Análise IA da Sorte</span>
              </button>
            </div>
          </div>
        )}

        {/* Pick Count Slider */}
        <div className="mb-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quantidade de Dezenas:
            </label>
            <span className="px-3 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/30">
              {pickCount} dezenas
            </span>
          </div>
          <input
            type="range"
            min={lottery.minPick}
            max={lottery.maxPick}
            value={pickCount}
            onChange={(e) => setPickCount(parseInt(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
            <span>Mín: {lottery.minPick}</span>
            <span>Máx: {lottery.maxPick}</span>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mb-5">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowFilters(!showFilters);
            }}
            className={`w-full py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              showFilters
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Filtros Avançados de Probabilidade e Exclusão</span>
            </div>
            <span>{showFilters ? 'Ocultar' : 'Configurar'}</span>
          </button>

          {showFilters && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dezenas Fixas (vírgula):</label>
                  <input
                    type="text"
                    placeholder="Ex: 05, 12"
                    value={fixedInput}
                    onChange={(e) => setFixedInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dezenas Excluídas (vírgula):</label>
                  <input
                    type="text"
                    placeholder="Ex: 13, 24"
                    value={excludedInput}
                    onChange={(e) => setExcludedInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Proporção Par / Ímpar:</label>
                  <select
                    value={evenOddRatio}
                    onChange={(e) => setEvenOddRatio(e.target.value as FilterOptions['evenOddRatio'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="any">Qualquer proporção</option>
                    <option value="balanced">Equilibrado</option>
                    <option value="more_even">Mais Pares</option>
                    <option value="more_odd">Mais Ímpares</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Soma Mín - Máx:</label>
                  <div className="flex space-x-2">
                    <input type="number" placeholder="Mín" value={sumMin} onChange={(e) => setSumMin(e.target.value)} className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
                    <input type="number" placeholder="Máx" value={sumMax} onChange={(e) => setSumMax(e.target.value)} className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex items-center space-x-2">
                <input type="checkbox" id="avoidConsecutiveModal" checked={avoidConsecutive} onChange={(e) => setAvoidConsecutive(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-amber-500 h-4 w-4" />
                <label htmlFor="avoidConsecutiveModal" className="text-xs text-slate-300 cursor-pointer">Evitar sequências longas consecutivas</label>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Generate Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartGenerate}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Sortear com Animação 3D</span>
          </button>
          
          <button
            onClick={handleQuickGenerate}
            className="px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Gerar Instantâneo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
