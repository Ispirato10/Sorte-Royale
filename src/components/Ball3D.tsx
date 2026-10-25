import React from 'react';
import { motion } from 'motion/react';
import { soundManager } from '../utils/sound';

interface Ball3DProps {
  number: number | string;
  lotteryId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delayIndex?: number;
  isExtra?: boolean;
  isMatched?: boolean;
}

export const Ball3D: React.FC<Ball3DProps> = ({
  number,
  lotteryId,
  size = 'md',
  delayIndex = 0,
  isExtra = false,
  isMatched = false
}) => {
  const get3DStyle = () => {
    if (isMatched) return 'ball-3d-emerald ring-2 ring-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]';
    if (isExtra) return 'ball-3d-gold';
    if (lotteryId === 'megasena') return 'ball-3d-emerald';
    if (lotteryId === 'lotofacil') return 'ball-3d-purple';
    if (lotteryId === 'quina') return 'ball-3d-blue';
    if (lotteryId === 'lotomania') return 'ball-3d-orange';
    if (lotteryId === 'duplasena') return 'ball-3d-red';
    return 'ball-3d-gold';
  };

  const getGlowStyle = () => {
    if (isMatched) return 'hover:shadow-[0_0_22px_rgba(52,211,153,0.85)]';
    if (isExtra) return 'hover:shadow-[0_0_22px_rgba(234,179,8,0.75)]';
    if (lotteryId === 'megasena') return 'hover:shadow-[0_0_22px_rgba(16,185,129,0.75)]';
    if (lotteryId === 'lotofacil') return 'hover:shadow-[0_0_22px_rgba(168,85,247,0.75)]';
    if (lotteryId === 'quina') return 'hover:shadow-[0_0_22px_rgba(2,132,199,0.75)]';
    if (lotteryId === 'lotomania') return 'hover:shadow-[0_0_22px_rgba(249,115,22,0.75)]';
    if (lotteryId === 'duplasena') return 'hover:shadow-[0_0_22px_rgba(239,68,68,0.75)]';
    return 'hover:shadow-[0_0_22px_rgba(234,179,8,0.75)]';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm md:w-11 md:h-11 md:text-base',
    lg: 'w-12 h-12 text-base md:w-14 md:h-14 md:text-xl',
    xl: 'w-14 h-14 text-xl md:w-16 md:h-16 md:text-2xl'
  }[size];

  const shineSizes = {
    sm: 'w-2 h-1.5 top-1 left-1.5',
    md: 'w-3 h-2 top-1.5 left-2',
    lg: 'w-4 h-2.5 top-2 left-2.5',
    xl: 'w-5 h-3 top-2.5 left-3'
  }[size];

  const handleClick = () => {
    soundManager.playBallPop();
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 15 }}
      animate={{ scale: isMatched ? 1.1 : 1, opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 18,
        delay: Math.min(delayIndex * 0.04, 0.45)
      }}
      whileHover={{
        scale: 1.24,
        y: -5,
        rotate: 6,
        transition: { type: 'spring', stiffness: 500, damping: 15 }
      }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`group relative rounded-full ${get3DStyle()} ${getGlowStyle()} ${sizeClasses} flex items-center justify-center font-black text-slate-950 select-none cursor-pointer border border-white/40 transition-all duration-300`}
      title={`Número ${String(number).padStart(2, '0')}${isMatched ? ' (Acertado!)' : ''}`}
    >
      {/* 3D Specular Light Reflection (Primary Highlight) */}
      <span className={`absolute rounded-full bg-white/85 blur-[0.4px] pointer-events-none ${shineSizes}`} />
      
      {/* Secondary Soft Gloss Oval */}
      <span className="absolute top-1 left-1/4 w-1/2 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

      {/* Subtle bottom bounce reflection for realistic spherical volume */}
      <span className="absolute bottom-1 w-3/5 h-1 rounded-full bg-white/30 blur-[0.6px] pointer-events-none" />

      {/* Number Label printed on the sphere */}
      <span className="relative z-10 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] font-mono tracking-tight leading-none group-hover:scale-105 transition-transform">
        {typeof number === 'number' ? String(number).padStart(2, '0') : number}
      </span>
    </motion.div>
  );
};
