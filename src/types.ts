export type LotteryId = 
  | 'megasena' 
  | 'lotofacil' 
  | 'quina' 
  | 'lotomania' 
  | 'duplasena' 
  | 'maismilionaria' 
  | 'timemania' 
  | 'diadesorte'
  | 'supersete';

export interface LotteryConfig {
  id: LotteryId;
  name: string;
  subtitle: string;
  minNumber: number;
  maxNumber: number;
  defaultPick: number;
  minPick: number;
  maxPick: number;
  color: string;
  badgeColor: string;
  bgColor: string;
  hasExtra?: boolean;
  extraName?: string;
  extraMin?: number;
  extraMax?: number;
  extraPick?: number;
  description: string;
  jackpotEstimate: string;
}

export interface GeneratedGame {
  id: string;
  lotteryId: string;
  lotteryName: string;
  numbers: number[];
  extraNumbers?: number[];
  createdAt: string;
  isFavorite?: boolean;
  notes?: string;
  checkedResult?: {
    drawNumber: number;
    matchedCount: number;
    matchedExtraCount?: number;
    prizeTier: string;
    drawnNumbers: number[];
    drawnExtraNumbers?: number[];
    checkedAt: string;
  };
}

export interface FilterOptions {
  fixedNumbers: number[];
  excludedNumbers: number[];
  evenOddRatio?: 'any' | 'balanced' | 'more_even' | 'more_odd';
  sumRange?: [number, number];
  avoidConsecutive: boolean;
}

export interface LotteryStats {
  number: number;
  frequency: number;
  lastDrawnDaysAgo: number;
  status: 'hot' | 'cold' | 'normal';
}

export interface WheelConfig {
  totalNumbers: number;
  pickCount: number;
  guarantee: string;
  generatedGames: number[][];
}
