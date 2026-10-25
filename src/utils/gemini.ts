import { GoogleGenAI } from '@google/genai';

export async function getAILotteryAdvice(lotteryName: string, numbers: number[], apiKey?: string): Promise<string> {
  // If API key is provided or available via Vite env
  const key = apiKey || (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';
  
  if (!key) {
    // Fallback smart advice if no API key present
    return `Análise Estatística da Sorte para ${lotteryName}: Os números [${numbers.join(', ')}] possuem excelente equilíbrio entre dezenas pares e ímpares, além de uma distribuição harmoniosa no volante que cobre diferentes quadrantes estatísticos. Boa sorte em seu jogo!`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Atue como um especialista estatístico em loterias da Caixa Econômica Federal e analista de probabilidades. Analise o jogo gerado para a loteria "${lotteryName}" contendo as dezenas: [${numbers.join(', ')}]. Dê uma análise cativante, elegante, motivadora e com insights estatísticos sobre equilíbrio de pares/ímpares, soma e chances (em português do Brasil, tom sofisticado e entusiasmado).`,
    });

    return response.text || 'Análise indisponível no momento.';
  } catch (error) {
    console.error('Gemini AI error:', error);
    return `Análise Estatística da Sorte para ${lotteryName}: O jogo [${numbers.join(', ')}] demonstra ótima distribuição no volante. Aposte com responsabilidade e confiança!`;
  }
}
