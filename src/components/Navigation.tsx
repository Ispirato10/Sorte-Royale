import React from 'react';
import { Dices, BookmarkCheck, BarChart3, Grid2X2, History, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type TabType = 'generator' | 'favorites' | 'stats' | 'wheels' | 'history' | 'ai';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  favoritesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, favoritesCount }) => {
  const tabs = [
    { id: 'generator' as TabType, label: 'Gerador de Sorte', icon: Dices },
    { id: 'favorites' as TabType, label: 'Favoritos & Conferidor', icon: BookmarkCheck, count: favoritesCount },
    { id: 'stats' as TabType, label: 'Estatísticas', icon: BarChart3 },
    { id: 'wheels' as TabType, label: 'Fechamentos', icon: Grid2X2 },
    { id: 'history' as TabType, label: 'Últimas Geradas', icon: History },
    { id: 'ai' as TabType, label: 'Consultor IA', icon: Sparkles },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur sticky top-[65px] z-40 overflow-x-auto scrollbar-none px-4 py-2">
      <div className="max-w-7xl mx-auto flex space-x-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                onTabChange(tab.id);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-slate-950 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
