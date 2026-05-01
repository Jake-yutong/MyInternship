import React from 'react';
import { Application, STATUS_CONFIG, getCompanyAccentColor, getCompanyInitial } from '../data';
import { Plus, Clock, ArrowRight, Quote, Trash2, ExternalLink } from 'lucide-react';

interface CardProps {
  application: Application;
  onClick: () => void;
  onDelete: (app: Application) => void;
}

export function ApplicationCard({ application, onClick, onDelete }: CardProps) {
  const statusConfig = STATUS_CONFIG[application.status];
  const companyAccentColor = getCompanyAccentColor(application.companyName);
  const applyDate = application.dates.appliedAt || '待补充';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(application);
  };

  const handleApplyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(application.applyLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#202020] border border-[#E9E9E7] dark:border-neutral-800 rounded-[20px] p-5 cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-neutral-900/50 transition-all duration-300 group flex flex-col h-[240px] hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Folder Tab Status Badge */}
      <div 
        className={`absolute top-0 right-0 px-3.5 py-1.5 text-[11px] font-bold tracking-wide rounded-bl-[16px] rounded-tr-[19px] transition-colors shadow-sm z-10 border-b border-l border-white/20 dark:border-black/20 ${statusConfig.className}`}
      >
        {statusConfig.label}
      </div>

      <div className="flex justify-between items-start mb-5 pt-1">
        <div className="flex items-center gap-3.5 pr-16 w-full">
          {application.logo ? (
            <img
              src={application.logo}
              alt={`${application.companyName} logo`}
              className="w-12 h-12 rounded-[14px] object-cover shadow-sm shrink-0 border border-black/5 dark:border-white/10"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-white font-bold text-xl shadow-sm relative overflow-hidden shrink-0"
              style={{ backgroundColor: companyAccentColor }}
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="relative z-10">{getCompanyInitial(application.companyName)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-[#37352F] dark:text-[#EBEBEA] transition-colors mb-0.5 truncate">
              {application.jobRole}
            </h3>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 transition-colors truncate">
              {application.companyName}
            </p>
          </div>
        </div>
      </div>

      {/* JD Summary Box */}
      <div className={`flex-1 rounded-2xl p-3.5 mb-4 text-sm leading-relaxed transition-colors relative ${statusConfig.boxClassName}`}>
        <Quote size={14} className="absolute opacity-20 top-3 left-3" />
        <div className="line-clamp-3 ml-5 relative z-10 font-medium opacity-90">
          {application.jobDescription || '粘贴 JD 或链接后，系统会在这里保留职位描述原文。'}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto mb-1.5">
        <div className="text-[13px] font-semibold text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 transition-colors">
          <Clock size={14} className="opacity-70" />
          投递日期: {applyDate}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="删除记录"
          >
            <Trash2 size={15} />
          </button>
          {application.applyLink ? (
            <button
              onClick={handleApplyLink}
              className="w-8 h-8 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
              title="打开网申页面"
            >
              <ExternalLink size={15} />
            </button>
          ) : null}
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-all duration-300">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardViewProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
  onAddNew: () => void;
  onDelete: (app: Application) => void;
}

export function CardView({ applications, onCardClick, onAddNew, onDelete }: CardViewProps) {
  return (
    <div className="p-8 h-full overflow-y-auto bg-[#FAFAFA] dark:bg-[#151515] transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-[26px] font-extrabold text-[#37352F] dark:text-[#EBEBEA] mb-8 transition-colors tracking-tight">
          所有投递 <span className="text-neutral-400 dark:text-neutral-600 font-medium ml-2 text-xl">({applications.length})</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {applications.map(app => (
            <ApplicationCard 
              key={app.id} 
              application={app} 
              onClick={() => onCardClick(app)} 
              onDelete={onDelete}
            />
          ))}
          
          {/* Add New Card */}
          <div 
            onClick={onAddNew}
            className="border-[2px] border-dashed border-[#E9E9E7] dark:border-neutral-800 rounded-[20px] p-5 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-[#202020] bg-transparent transition-all duration-300 flex flex-col items-center justify-center h-[240px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 group hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-full bg-white dark:bg-[#191919] shadow-sm border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-4 transition-colors group-hover:scale-110 duration-300">
              <Plus size={24} className="text-neutral-600 dark:text-neutral-400" />
            </div>
            <span className="font-bold text-[15px]">添加新投递</span>
            <span className="text-xs mt-1.5 opacity-60 font-medium">Record a new internship</span>
          </div>
        </div>
      </div>
    </div>
  );
}
