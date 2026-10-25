import { FilterOptions, GeneratedGame, LotteryConfig, LotteryStats } from '../types';

// Generate random numbers with advanced filters
export function generateLotteryNumbers(
  config: LotteryConfig,
  pickCount: number,
  filters: FilterOptions
): { numbers: number[]; extraNumbers?: number[] } {
  const min = config.minNumber;
  const max = config.maxNumber;
  const fixed = filters.fixedNumbers || [];
  const excluded = filters.excludedNumbers || [];

  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;

    // Start with fixed numbers
    const selectedSet = new Set<number>(fixed);

    // Remaining slots to fill
    const remainingCount = pickCount - selectedSet.size;
    if (remainingCount < 0) {
      throw new Error('Número de dezenas fixas excede a quantidade total escolhida.');
    }

    // Available pool excluding fixed and excluded
    const pool: number[] = [];
    for (let i = min; i <= max; i++) {
      if (!selectedSet.has(i) && !excluded.includes(i)) {
        pool.push(i);
      }
    }

    if (pool.length < remainingCount) {
      throw new Error('Não há números suficientes no pool com os filtros aplicados.');
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < remainingCount; i++) {
      selectedSet.add(shuffled[i]);
    }

    const numbers = Array.from(selectedSet).sort((a, b) => a - b);

    // Check filters
    if (isValidGame(numbers, filters, config)) {
      // Generate extra numbers if applicable
      let extraNumbers: number[] | undefined = undefined;
      if (config.hasExtra && config.extraMin !== undefined && config.extraMax !== undefined && config.extraPick) {
        const extraPool: number[] = [];
        for (let e = config.extraMin; e <= config.extraMax; e++) {
          extraPool.push(e);
        }
        extraPool.sort(() => Math.random() - 0.5);
        extraNumbers = extraPool.slice(0, config.extraPick).sort((a, b) => a - b);
      }

      return { numbers, extraNumbers };
    }
  }

  // Fallback if filters are too strict
  const fallbackSet = new Set<number>(fixed);
  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!fallbackSet.has(i) && !excluded.includes(i)) pool.push(i);
  }
  pool.sort(() => Math.random() - 0.5);
  while (fallbackSet.size < pickCount && pool.length > 0) {
    fallbackSet.add(pool.pop()!);
  }
  const numbers = Array.from(fallbackSet).sort((a, b) => a - b);
  return { numbers };
}

function isValidGame(numbers: number[], filters: FilterOptions, config: LotteryConfig): boolean {
  // Even/Odd ratio
  if (filters.evenOddRatio && filters.evenOddRatio !== 'any') {
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const ratio = evenCount / oddCount;

    if (filters.evenOddRatio === 'balanced' && Math.abs(evenCount - oddCount) > 2) return false;
    if (filters.evenOddRatio === 'more_even' && evenCount <= oddCount) return false;
    if (filters.evenOddRatio === 'more_odd' && oddCount <= evenCount) return false;
  }

  // Sum range
  if (filters.sumRange) {
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    if (sum < filters.sumRange[0] || sum > filters.sumRange[1]) return false;
  }

  // Avoid consecutive (e.g. 12, 13, 14)
  if (filters.avoidConsecutive) {
    let consecutiveCount = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] === numbers[i] + 1) {
        consecutiveCount++;
        if (consecutiveCount >= 2) return false; // More than 2 consecutive is avoided
      }
    }
  }

  return true;
}

// Generate statistical data for lottery numbers
export function getLotteryStats(config: LotteryConfig): LotteryStats[] {
  const stats: LotteryStats[] = [];
  for (let i = config.minNumber; i <= config.maxNumber; i++) {
    // Pseudo-random consistent stats based on number and lottery
    const seed = (i * 31 + config.maxNumber * 7) % 100;
    const frequency = Math.floor(40 + (seed % 60));
    const lastDrawnDaysAgo = (seed % 15) + 1;
    let status: 'hot' | 'cold' | 'normal' = 'normal';
    if (frequency > 75) status = 'hot';
    else if (frequency < 50) status = 'cold';

    stats.push({
      number: i,
      frequency,
      lastDrawnDaysAgo,
      status
    });
  }
  return stats;
}

// Simulate a latest official draw for checking results
export function simulateLatestDraw(config: LotteryConfig): { drawNumber: number; numbers: number[]; extraNumbers?: number[] } {
  const pool: number[] = [];
  for (let i = config.minNumber; i <= config.maxNumber; i++) {
    pool.push(i);
  }
  pool.sort(() => Math.random() - 0.5);
  const numbers = pool.slice(0, config.defaultPick).sort((a, b) => a - b);

  let extraNumbers: number[] | undefined = undefined;
  if (config.hasExtra && config.extraMin !== undefined && config.extraMax !== undefined && config.extraPick) {
    const extraPool: number[] = [];
    for (let e = config.extraMin; e <= config.extraMax; e++) extraPool.push(e);
    extraPool.sort(() => Math.random() - 0.5);
    extraNumbers = extraPool.slice(0, config.extraPick).sort((a, b) => a - b);
  }

  const drawNumber = Math.floor(2700 + Math.random() * 300);
  return { drawNumber, numbers, extraNumbers };
}

// Check game against draw results
export function checkGameResult(game: GeneratedGame, config: LotteryConfig): GeneratedGame['checkedResult'] {
  const latestDraw = simulateLatestDraw(config);
  
  const matchedNumbers = game.numbers.filter(n => latestDraw.numbers.includes(n));
  const matchedCount = matchedNumbers.length;

  let matchedExtraCount = 0;
  if (config.hasExtra && game.extraNumbers && latestDraw.extraNumbers) {
    matchedExtraCount = game.extraNumbers.filter(e => latestDraw.extraNumbers!.includes(e)).length;
  }

  let prizeTier = 'Não premiado';

  if (config.id === 'megasena') {
    if (matchedCount === 6) prizeTier = 'SENA! (Prêmio Máximo)';
    else if (matchedCount === 5) prizeTier = 'QUINA (Excelente Prêmio)';
    else if (matchedCount === 4) prizeTier = 'QUADRA (Premiação)';
  } else if (config.id === 'lotofacil') {
    if (matchedCount === 15) prizeTier = '15 PONTOS! (Prêmio Máximo)';
    else if (matchedCount === 14) prizeTier = '14 Pontos';
    else if (matchedCount === 13) prizeTier = '13 Pontos';
    else if (matchedCount === 12) prizeTier = '12 Pontos';
    else if (matchedCount === 11) prizeTier = '11 Pontos';
  } else if (config.id === 'quina') {
    if (matchedCount === 5) prizeTier = 'QUINA! (Prêmio Máximo)';
    else if (matchedCount === 4) prizeTier = 'Quadra';
    else if (matchedCount === 3) prizeTier = 'Terno';
    else if (matchedCount === 2) prizeTier = 'Duque';
  } else if (config.id === 'lotomania') {
    if (matchedCount === 20) prizeTier = '20 PONTOS! (Prêmio Máximo)';
    else if (matchedCount === 19) prizeTier = '19 Pontos';
    else if (matchedCount === 0) prizeTier = '0 PONTOS (Nenhum acerto!)';
  } else {
    if (matchedCount >= config.defaultPick - 1) prizeTier = 'Faixa Principal de Premiação';
    else if (matchedCount >= config.defaultPick - 2) prizeTier = 'Premiação Secundária';
  }

  return {
    drawNumber: latestDraw.drawNumber,
    matchedCount,
    matchedExtraCount,
    prizeTier,
    drawnNumbers: latestDraw.numbers,
    drawnExtraNumbers: latestDraw.extraNumbers,
    checkedAt: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
}
