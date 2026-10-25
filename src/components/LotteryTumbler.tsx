import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Dices, X, Save, Bookmark, FileText, CheckCircle2 } from 'lucide-react';
import { LotteryConfig, GeneratedGame } from '../types';
import { soundManager } from '../utils/sound';
import { triggerExplosion, triggerFireworks } from '../utils/confetti';
import { TicketReceiptModal } from './TicketReceiptModal';
import { Ball3D } from './Ball3D';

interface LotteryTumblerProps {
  config: LotteryConfig;
  pickCount: number;
  onComplete: (game: GeneratedGame) => void;
  onClose: () => void;
  onSaveGame: (game: GeneratedGame) => void;
  favorites: GeneratedGame[];
  onToggleFavorite: (id: string) => void;
}

export const LotteryTumbler: React.FC<LotteryTumblerProps> = ({
  config,
  pickCount,
  onComplete,
  onClose,
  onSaveGame,
  favorites,
  onToggleFavorite
}) => {
  const [stage, setStage] = useState<'tumbling' | 'revealing' | 'done'>('tumbling');
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
  const [revealedExtra, setRevealedExtra] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [extractingBall, setExtractingBall] = useState<number | null>(null);
  const [createdGame, setCreatedGame] = useState<GeneratedGame | null>(null);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Generate target numbers immediately
  const [targetResult] = useState(() => {
    const pool: number[] = [];
    for (let i = config.minNumber; i <= config.maxNumber; i++) {
      pool.push(i);
    }
    pool.sort(() => Math.random() - 0.5);
    const numbers = pool.slice(0, pickCount).sort((a, b) => a - b);

    let extraNumbers: number[] | undefined = undefined;
    if (config.hasExtra && config.extraMin !== undefined && config.extraMax !== undefined && config.extraPick) {
      const extraPool: number[] = [];
      for (let e = config.extraMin; e <= config.extraMax; e++) extraPool.push(e);
      extraPool.sort(() => Math.random() - 0.5);
      extraNumbers = extraPool.slice(0, config.extraPick).sort((a, b) => a - b);
    }
    return { numbers, extraNumbers };
  });

  const get3DStyle = () => {
    if (config.id === 'megasena') return 'ball-3d-emerald';
    if (config.id === 'lotofacil') return 'ball-3d-purple';
    if (config.id === 'quina') return 'ball-3d-blue';
    if (config.id === 'lotomania') return 'ball-3d-orange';
    if (config.id === 'duplasena') return 'ball-3d-red';
    return 'ball-3d-gold';
  };

  // Generate 18 realistic 3D balls circulating inside the tumbler globe
  const internalBalls = useMemo(() => {
    const ballsCount = 18;
    const items: Array<{
      num: number;
      initialX: number;
      initialY: number;
      speed: number;
      delay: number;
      dx: number;
      dy: number;
      isExtra?: boolean;
    }> = [];

    const step = Math.max(1, Math.floor((config.maxNumber - config.minNumber) / ballsCount));
    for (let i = 0; i < ballsCount; i++) {
      const num = Math.min(config.maxNumber, config.minNumber + (i * step) % (config.maxNumber - config.minNumber + 1));
      const angle = (i / ballsCount) * Math.PI * 2;
      const radiusPercent = 22 + (i % 3) * 12;

      items.push({
        num,
        initialX: 50 + Math.cos(angle) * radiusPercent,
        initialY: 50 + Math.sin(angle) * radiusPercent,
        speed: 0.85 + (i % 4) * 0.25,
        delay: (i % 5) * 0.12,
        dx: (i % 2 === 0 ? 1 : -1) * (14 + (i % 3) * 6),
        dy: (i % 3 === 0 ? -1 : 1) * (15 + (i % 4) * 5),
        isExtra: i % 6 === 0 && config.hasExtra
      });
    }
    return items;
  }, [config]);

  // Initial fast tumbling phase
  useEffect(() => {
    const rollInterval = setInterval(() => {
      soundManager.playBallRoll();
    }, 110);

    const timer = setTimeout(() => {
      clearInterval(rollInterval);
      setStage('revealing');
      triggerExplosion();
    }, 1800);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(timer);
    };
  }, []);

  // Extraction & reveal phase (one-by-one from the globe into the rack)
  useEffect(() => {
    if (stage === 'revealing') {
      if (currentIndex < targetResult.numbers.length) {
        const nextNum = targetResult.numbers[currentIndex];
        setExtractingBall(nextNum);

        const timer = setTimeout(() => {
          soundManager.playBallPop();
          setRevealedNumbers(prev => [...prev, nextNum]);
          setExtractingBall(null);
          setCurrentIndex(prev => prev + 1);
        }, 320);

        return () => clearTimeout(timer);
      } else {
        // Extract extra numbers if configured
        if (targetResult.extraNumbers && revealedExtra.length < targetResult.extraNumbers.length) {
          const nextExt = targetResult.extraNumbers[revealedExtra.length];
          setExtractingBall(nextExt);

          const timer = setTimeout(() => {
            soundManager.playBallPop();
            setRevealedExtra(prev => [...prev, nextExt]);
            setExtractingBall(null);
          }, 350);

          return () => clearTimeout(timer);
        } else {
          // Finished drawing!
          soundManager.playWinFanfare();
          triggerFireworks();
          setStage('done');

          const newGame: GeneratedGame = {
            id: Math.random().toString(36).substring(2, 9),
            lotteryId: config.id,
            lotteryName: config.name,
            numbers: targetResult.numbers,
            extraNumbers: targetResult.extraNumbers,
            createdAt: new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isFavorite: false
          };

          setCreatedGame(newGame);
          onSaveGame(newGame);
          setSavedStatus(true);
          onComplete(newGame);
        }
      }
    }
  }, [stage, currentIndex, targetResult, revealedExtra.length, onComplete, onSaveGame, config]);

  const handleSkipAnimation = () => {
    soundManager.playClick();
    setRevealedNumbers(targetResult.numbers);
    if (targetResult.extraNumbers) {
      setRevealedExtra(targetResult.extraNumbers);
    }
    soundManager.playWinFanfare();
    triggerFireworks();
    setStage('done');

    const newGame: GeneratedGame = {
      id: Math.random().toString(36).substring(2, 9),
      lotteryId: config.id,
      lotteryName: config.name,
      numbers: targetResult.numbers,
      extraNumbers: targetResult.extraNumbers,
      createdAt: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isFavorite: false
    };

    setCreatedGame(newGame);
    onSaveGame(newGame);
    setSavedStatus(true);
    onComplete(newGame);
  };

  const handleSaveManually = () => {
    if (!createdGame) return;
    soundManager.playClick();
    onSaveGame(createdGame);
    setSavedStatus(true);
    triggerFireworks();
  };

  const isFavorite = () => {
    if (!createdGame) return false;
    return favorites.some(
      f => f.id === createdGame.id || (f.lotteryId === config.id && f.numbers.every((n, i) => n === createdGame.numbers[i]))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 backdrop-blur-2xl p-3 md:p-5 animate-fadeIn overflow-y-auto">
      {showReceipt && createdGame && (
        <TicketReceiptModal game={createdGame} onClose={() => setShowReceipt(false)} />
      )}

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_0_80px_rgba(234,179,8,0.25)] text-center overflow-hidden my-auto">
        
        {/* Atmospheric Glow Backdrops */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Top Controls: Close & Skip Button */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
          {stage !== 'done' && (
            <button
              onClick={handleSkipAnimation}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/20 transition-all cursor-pointer"
              title="Pular para o resultado final"
            >
              Pular
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Badge */}
        <div className="flex items-center justify-center space-x-2 mb-1.5 pr-14 sm:pr-0">
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${config.badgeColor}`}>
            {config.name}
          </span>
          <span className="text-xs text-amber-400 font-bold tracking-wider">GLOBO OFICIAL 3D</span>
        </div>

        <h3 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-3 font-cinzel">
          {stage === 'tumbling'
            ? 'Girando o Globo da Sorte...'
            : stage === 'revealing'
            ? `Sorteando Dezena ${Math.min(currentIndex + 1, pickCount)} de ${pickCount}...`
            : 'Resultado Oficial Sorteado!'}
        </h3>

        {/* ======================================================== */}
        {/* 3D REALISTIC ACRYLIC LOTTERY GLOBE MACHINE                */}
        {/* ======================================================== */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          
          {/* Main Globe Assembly Wrapper */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center select-none">
            
            {/* 1. Heavy Polished Metallic Pedestal Base */}
            <div className="absolute -bottom-4 w-44 sm:w-52 md:w-60 h-7 bg-gradient-to-r from-amber-800 via-amber-400 to-amber-900 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.9)] border-t border-amber-200/70 z-0" />
            <div className="absolute -bottom-2 w-32 sm:w-40 md:w-44 h-4 bg-gradient-to-r from-amber-700 via-yellow-200 to-amber-700 rounded-full border border-amber-300/80 z-0 shadow-inner" />

            {/* 2. Chrome / Gold Stanchion Support Arms (Left and Right Columns) */}
            <div className="absolute top-1/2 -left-2 sm:-left-3 -translate-y-1/2 w-4 sm:w-5 h-28 sm:h-36 md:h-40 rounded-full bg-gradient-to-b from-amber-300 via-amber-600 to-amber-900 border border-amber-300/60 shadow-xl z-0" />
            <div className="absolute top-1/2 -right-2 sm:-right-3 -translate-y-1/2 w-4 sm:w-5 h-28 sm:h-36 md:h-40 rounded-full bg-gradient-to-b from-amber-300 via-amber-600 to-amber-900 border border-amber-300/60 shadow-xl z-0" />

            {/* 3. Center Axle Bearing Pivot Caps */}
            <div className="absolute top-1/2 -left-1 sm:-left-1.5 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-tr from-amber-200 via-yellow-300 to-amber-600 border border-amber-100 shadow-md z-30" />
            <div className="absolute top-1/2 -right-1 sm:-right-1.5 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-tl from-amber-200 via-yellow-300 to-amber-600 border border-amber-100 shadow-md z-30" />

            {/* 4. Top Extraction Funnel / Chute */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-8 rounded-t-2xl bg-gradient-to-b from-amber-400/40 via-white/20 to-transparent border-t-2 border-x-2 border-amber-400/60 z-20 flex flex-col items-center justify-start pt-1 backdrop-blur-sm">
              <div className="w-9 sm:w-11 h-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 shadow-sm border border-amber-300" />
              {/* Ball being actively drawn through chute */}
              {extractingBall !== null && (
                <motion.div
                  initial={{ y: 20, scale: 0.4, opacity: 0 }}
                  animate={{ y: -8, scale: 1, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-3 z-30"
                >
                  <Ball3D
                    number={extractingBall}
                    lotteryId={config.id}
                    size="sm"
                  />
                </motion.div>
              )}
            </div>

            {/* 5. The Spherical Transparent Acrylic Glass Globe */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full acrylic-globe border-2 border-amber-400/50 flex items-center justify-center overflow-hidden z-10">
              
              {/* Internal Agitator Paddle Wheel (Gira no sentido inverso) */}
              <div
                className={`absolute inset-4 rounded-full border border-dashed border-amber-400/30 ${
                  stage !== 'done' ? 'animate-globe-paddle' : ''
                }`}
              >
                {/* Internal spokes */}
                <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-gradient-to-r from-amber-400/50 via-transparent to-amber-400/50" />
                <div className="absolute left-1/2 top-0 h-full w-[1.5px] bg-gradient-to-b from-amber-400/50 via-transparent to-amber-400/50" />
              </div>

              {/* Central Golden Core Bearing */}
              <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500 border border-amber-200/80 shadow-[0_0_15px_rgba(234,179,8,0.7)] z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
              </div>

              {/* 6. Dynamic Tumbling 3D Balls Inside the Glass Sphere */}
              <div className="absolute inset-0">
                {internalBalls.map((b, i) => (
                  <motion.div
                    key={`ball-int-${i}`}
                    style={{
                      left: `${b.initialX}%`,
                      top: `${b.initialY}%`,
                    }}
                    animate={
                      stage !== 'done'
                        ? {
                            x: [0, b.dx, -b.dx * 0.85, b.dx * 0.4, 0],
                            y: [0, b.dy, -b.dy * 0.75, b.dy * 0.35, 0],
                            rotate: [0, 180, 360],
                          }
                        : {
                            // Settle gently to the bottom when done
                            y: 35 + (i % 4) * 4,
                            x: (i % 6 - 3) * 10,
                            rotate: 0,
                          }
                    }
                    transition={{
                      duration: stage === 'tumbling' ? b.speed * 0.7 : b.speed,
                      repeat: stage !== 'done' ? Infinity : 0,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: b.delay,
                    }}
                    className={`absolute w-7 h-7 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      b.isExtra ? 'ball-3d-gold' : get3DStyle()
                    } flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-950 shadow-md select-none border border-white/50 pointer-events-none transition-shadow`}
                  >
                    {/* 3D Specular Highlight Dot */}
                    <span className="absolute top-1 left-1.5 w-2 h-1 rounded-full bg-white/90 blur-[0.3px]" />
                    {/* Bottom sphere rim bounce reflection */}
                    <span className="absolute bottom-0.5 w-3/5 h-0.5 rounded-full bg-white/30 blur-[0.4px]" />
                    {/* Number */}
                    <span className="relative z-10 font-bold font-mono tracking-tighter">
                      {String(b.num).padStart(2, '0')}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 7. Convex Specular Glass Reflections (Curved Glare on Acrylic Shell) */}
              <div className="absolute top-2 left-4 w-28 sm:w-36 h-14 sm:h-18 rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent rotate-[-28deg] blur-[0.8px] pointer-events-none z-30" />
              <div className="absolute bottom-2 right-4 w-24 sm:w-30 h-10 sm:h-12 rounded-full bg-gradient-to-t from-white/20 via-white/5 to-transparent rotate-[-15deg] blur-[0.8px] pointer-events-none z-30" />
            </div>

            {/* Glowing Golden Equator Ring */}
            <div className="absolute w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full border border-amber-400/30 pointer-events-none z-15" />
          </div>

          {/* Machine Status Ticker */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs font-semibold">
            {stage === 'tumbling' && (
              <span className="text-amber-300 flex items-center space-x-1.5 animate-pulse">
                <Dices className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Agitando e misturando dezenas no globo...</span>
              </span>
            )}
            {stage === 'revealing' && (
              <span className="text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Extraindo dezenas em tempo real...</span>
              </span>
            )}
            {stage === 'done' && (
              <span className="text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Todas as dezenas foram extraídas com sucesso!</span>
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* REVEALED NUMBERS TRAY (BANDEJA OFICIAL DE DEZENAS)       */}
        {/* ======================================================== */}
        <div className="my-4 p-4 sm:p-5 rounded-3xl bg-slate-950/85 border border-amber-500/30 shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Dezenas Extraídas ({revealedNumbers.length} de {pickCount})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {stage === 'done' ? 'CONFERIDO' : 'EM ANDAMENTO'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 min-h-[56px]">
            <AnimatePresence>
              {revealedNumbers.map((num, idx) => (
                <Ball3D
                  key={`rev-${idx}`}
                  number={num}
                  lotteryId={config.id}
                  size="lg"
                  delayIndex={0}
                />
              ))}
            </AnimatePresence>

            {revealedNumbers.length === 0 && (
              <div className="text-slate-500 text-xs italic py-2">
                Aguardando a primeira dezena sair do globo...
              </div>
            )}
          </div>

          {/* Extra Numbers Section (Trevos / Meses / Extras) */}
          {targetResult.extraNumbers && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
                {config.extraName ? `${config.extraName.toUpperCase()} EXTRA` : 'DEZENAS EXTRAS'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[44px]">
                {revealedExtra.map((ext, idx) => (
                  <Ball3D
                    key={`ext-rev-${idx}`}
                    number={ext}
                    isExtra={true}
                    size="md"
                    delayIndex={0}
                  />
                ))}
                {revealedExtra.length === 0 && (
                  <span className="text-slate-500 text-xs italic">
                    Aguardando extração dos números extras...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RESULT ACTIONS WHEN DONE                                 */}
        {/* ======================================================== */}
        {stage === 'done' && createdGame && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            className="space-y-3 pt-1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleSaveManually}
                className={`py-3.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  savedStatus
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{savedStatus ? 'Salvo no Histórico' : 'Salvar Resultado'}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleFavorite(createdGame.id);
                  triggerFireworks();
                }}
                className={`py-3.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isFavorite()
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isFavorite() ? 'Nos Favoritos' : 'Favoritar Jogo'}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowReceipt(true);
                }}
                className="py-3.5 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Gerar PDF / Bilhete</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Concluir e Ver Painel
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
