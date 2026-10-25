import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { GeneratorView } from './components/GeneratorView';
import { FavoritesView } from './components/FavoritesView';
import { StatsView } from './components/StatsView';
import { WheelsView } from './components/WheelsView';
import { HistoryView } from './components/HistoryView';
import { AIConsultantView } from './components/AIConsultantView';
import { GeneratedGame } from './types';
import { soundManager } from './utils/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('generator');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistent Favorites in localStorage
  const [favorites, setFavorites] = useState<GeneratedGame[]>(() => {
    try {
      const saved = localStorage.getItem('sorte_royale_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent History in localStorage with automatic deduplication
  const [history, setHistory] = useState<GeneratedGame[]>(() => {
    try {
      const saved = localStorage.getItem('sorte_royale_history');
      if (!saved) return [];
      const parsed: GeneratedGame[] = JSON.parse(saved);
      const seen = new Set<string>();
      const deduped: GeneratedGame[] = [];
      for (const item of parsed) {
        const key = `${item.lotteryId}-${item.numbers.join(',')}-${(item.extraNumbers || []).join(',')}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      }
      return deduped.slice(0, 10);
    } catch {
      return [];
    }
  });

  const [activeAIGame, setActiveAIGame] = useState<GeneratedGame | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sorte_royale_favorites', JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('sorte_royale_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const handleSaveGame = (game: GeneratedGame) => {
    setHistory(prev => {
      const filtered = prev.filter(h => 
        h.id !== game.id &&
        !(h.lotteryId === game.lotteryId &&
          h.numbers.length === game.numbers.length &&
          h.numbers.every((n, i) => n === game.numbers[i]) &&
          (h.extraNumbers || []).join(',') === (game.extraNumbers || []).join(','))
      );
      return [game, ...filtered].slice(0, 10);
    });
  };

  const handleToggleFavorite = (id: string) => {
    // Check in history first, or favorites
    const gameInHistory = history.find(h => h.id === id);
    const gameInFavs = favorites.find(f => f.id === id);

    if (gameInFavs) {
      setFavorites(prev => prev.filter(f => f.id !== id));
    } else if (gameInHistory) {
      setFavorites(prev => [{ ...gameInHistory, isFavorite: true }, ...prev]);
    } else {
      // If it's passed by id that might be in generator modal
      const found = history.find(h => h.id === id) || favorites.find(f => f.id === id);
      if (found) {
        const exists = favorites.some(f => f.id === id);
        if (exists) {
          setFavorites(prev => prev.filter(f => f.id !== id));
        } else {
          setFavorites(prev => [{ ...found, isFavorite: true }, ...prev]);
        }
      }
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateGame = (updated: GeneratedGame) => {
    setFavorites(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const handleNavigateToAI = (game: GeneratedGame) => {
    setActiveAIGame(game);
    setCurrentTab('ai');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      <Header soundEnabled={soundEnabled} onToggleSound={handleToggleSound} />
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} favoritesCount={favorites.length} />

      <main className="flex-1 pb-16">
        {currentTab === 'generator' && (
          <GeneratorView
            onSaveGame={handleSaveGame}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToAI={handleNavigateToAI}
            history={history}
          />
        )}
        {currentTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateGame={handleUpdateGame}
            onNavigateToAI={handleNavigateToAI}
          />
        )}
        {currentTab === 'stats' && <StatsView />}
        {currentTab === 'wheels' && <WheelsView />}
        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onToggleFavorite={handleToggleFavorite}
            onClearHistory={() => setHistory([])}
            favorites={favorites}
          />
        )}
        {currentTab === 'ai' && (
          <AIConsultantView activeGame={activeAIGame} favorites={favorites} />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-cinzel tracking-wider text-amber-500/70 font-semibold mb-1">SORTE ROYALE • LOTERIAS DO BRASIL</p>
        <p>Gerador e conferidor estatístico independente para entretenimento. Jogue com responsabilidade.</p>
      </footer>
    </div>
  );
}
