import React from 'react';
import { 
  Inbox, 
  LayoutGrid, 
  GanttChartSquare, 
  PlusSquare, 
  Archive, 
  Settings,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activeView: 'card' | 'gantt';
  setActiveView: (view: 'card' | 'gantt') => void;
  onAddNew: () => void;
}

export function Sidebar({ activeView, setActiveView, onAddNew }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#F7F7F5] dark:bg-[#202020] border-r border-[#E9E9E7] dark:border-neutral-800 flex flex-col flex-shrink-0 text-[#37352F] dark:text-[#EBEBEA] select-none transition-colors duration-200">
      <div className="p-4 pt-6 pb-2">
        <h1 className="font-semibold text-lg flex items-center gap-2">
          <span className="bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors">M</span>
          麦恩忒诗 <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal ml-1 transition-colors">(MyInternship)</span>
        </h1>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-2 mt-4 transition-colors">VIEWS</div>
        
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-sm transition-colors text-neutral-600 dark:text-neutral-300">
          <Inbox size={16} />
          所有投递 (All)
        </button>

        <button 
          onClick={() => setActiveView('card')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            activeView === 'card' ? 'bg-neutral-200/70 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-100' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <LayoutGrid size={16} />
          卡片视图 (Card View)
        </button>

        <button 
          onClick={() => setActiveView('gantt')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            activeView === 'gantt' ? 'bg-neutral-200/70 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-100' : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <GanttChartSquare size={16} />
          甘特图视图 (Gantt View)
        </button>

        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-2 mt-6 transition-colors">ACTIONS</div>

        <button 
          onClick={onAddNew}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-sm transition-colors text-neutral-600 dark:text-neutral-300"
        >
          <PlusSquare size={16} />
          新建投递 (Add New)
        </button>

        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-sm transition-colors text-neutral-600 dark:text-neutral-300">
          <Archive size={16} />
          归档 (Archives)
        </button>

        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-sm transition-colors text-neutral-600 dark:text-neutral-300">
          <Settings size={16} />
          设置 (Settings)
        </button>
      </div>

      <div className="p-4 border-t border-[#E9E9E7] dark:border-neutral-800 text-xs flex items-center gap-2 text-neutral-400 dark:text-neutral-500 transition-colors">
        <Clock size={14} />
        <span>本地运行中 (Local Host) • 刚刚保存</span>
      </div>
    </div>
  );
}
