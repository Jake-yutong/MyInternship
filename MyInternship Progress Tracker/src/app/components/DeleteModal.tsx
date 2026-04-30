import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Application } from '../data';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  application: Application | null;
}

export function DeleteModal({ isOpen, onClose, onConfirm, application }: DeleteModalProps) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#202020] rounded-[20px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-black/50 w-full max-w-[400px] border border-neutral-200 dark:border-neutral-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                删除投递记录
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                确定要删除对 <span className="font-semibold text-neutral-700 dark:text-neutral-300">{application.companyName}</span> 的投递记录吗？此操作无法恢复。
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
