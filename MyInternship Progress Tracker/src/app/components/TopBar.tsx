import React, { useEffect, useState } from 'react';
import { Search, Bell, MoreHorizontal, LayoutGrid, GanttChartSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  activeView: 'card' | 'gantt';
  setActiveView: (view: 'card' | 'gantt') => void;
  storageStatusLabel: string;
  storageStatusTone: 'success' | 'warning' | 'neutral';
}

export function TopBar({ activeView, setActiveView, storageStatusLabel, storageStatusTone }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const storageStatusClassName = storageStatusTone === 'success'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
    : storageStatusTone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
      : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-14 border-b border-[#E9E9E7] dark:border-neutral-800 flex items-center justify-between px-6 bg-white dark:bg-[#191919] shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-neutral-500 dark:text-neutral-400 transition-colors">所有投递 /</span>
        <span className="text-neutral-800 dark:text-neutral-200 transition-colors">
          {activeView === 'card' ? '卡片视图' : '甘特图视图'}
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${storageStatusClassName}`}>
          {storageStatusLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 shadow-inner transition-colors">
          <button
            onClick={() => setActiveView('card')}
            className={`px-4 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              activeView === 'card' 
                ? 'bg-white dark:bg-[#202020] shadow-sm font-medium text-neutral-800 dark:text-neutral-100' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutGrid size={14} />
            卡片
          </button>
          <button
            onClick={() => setActiveView('gantt')}
            className={`px-4 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
              activeView === 'gantt' 
                ? 'bg-white dark:bg-[#202020] shadow-sm font-medium text-neutral-800 dark:text-neutral-100' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <GanttChartSquare size={14} />
            甘特图
          </button>
        </div>

        <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 ml-2">
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1.5 rounded-md transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} />}
            </button>
          )}
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
          <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1.5 rounded-md transition-colors"><Search size={16} /></button>
          <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1.5 rounded-md transition-colors"><Bell size={16} /></button>
          <button className="hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1.5 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
        </div>
      </div>
    </div>
  );
}
