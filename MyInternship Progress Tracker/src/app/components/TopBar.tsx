import React, { useEffect, useState } from 'react';
import { Search, Bell, MoreHorizontal, LayoutGrid, GanttChartSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  activeView: 'card' | 'gantt';
  setActiveView: (view: 'card' | 'gantt') => void;
}

export function TopBar({ activeView, setActiveView }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
