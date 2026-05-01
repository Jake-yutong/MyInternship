import React from 'react';
import { addDays, addMonths, differenceInCalendarDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { Application, STATUS_CONFIG, dateValueToDate, getApplicationTimeline, getCompanyAccentColor, getCompanyInitial } from '../data';
import { useLogoColors } from '../hooks/useLogoColors';

interface GanttViewProps {
  applications: Application[];
}

export function GanttView({ applications }: GanttViewProps) {
  const logoColors = useLogoColors(applications);

  const timelineRows = applications.map((application) => ({
    application,
    stages: getApplicationTimeline(application),
  }));
  const allDates = timelineRows.flatMap((row) => row.stages.map((stage) => dateValueToDate(stage.date)));
  const fallbackStartDate = startOfMonth(new Date(2026, 7, 1));

  const startDate = allDates.length > 0
    ? startOfMonth(allDates.reduce((earliestDate, currentDate) => (currentDate < earliestDate ? currentDate : earliestDate)))
    : fallbackStartDate;
  const endDate = allDates.length > 0
    ? endOfMonth(addMonths(allDates.reduce((latestDate, currentDate) => (currentDate > latestDate ? currentDate : latestDate)), 1))
    : endOfMonth(addMonths(fallbackStartDate, 4));
  const totalDays = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);
  const months: Date[] = [];
  const weekMarkers: Date[] = [];

  for (let cursor = startDate; cursor <= endDate; cursor = addMonths(cursor, 1)) {
    months.push(cursor);
  }

  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 7)) {
    weekMarkers.push(cursor);
  }

  const getLeftPercentage = (date: Date) => {
    const daysSinceStart = differenceInCalendarDays(date, startDate);
    return Math.max(0, (daysSinceStart / totalDays) * 100);
  };

  const getWidthPercentage = (durationDays: number) => {
    return (Math.max(durationDays, 2) / totalDays) * 100;
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#151515] overflow-hidden transition-colors duration-200">
      <div className="p-8 pb-4">
        <h2 className="text-[26px] font-extrabold text-[#37352F] dark:text-[#EBEBEA] mb-2 transition-colors tracking-tight">进度追踪 (Timeline)</h2>
        <p className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400 transition-colors">根据 dates 字段动态生成时间轴，支持不同阶段颜色块与串联箭头。</p>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="min-w-[1080px] border border-[#E9E9E7] dark:border-neutral-800 rounded-lg bg-white dark:bg-[#191919] shadow-sm transition-colors duration-200">
          
          {/* Header Row (Months) */}
          <div className="flex border-b border-[#E9E9E7] dark:border-neutral-800 bg-neutral-50 dark:bg-[#202020] sticky top-0 z-10 transition-colors duration-200">
            <div className="w-72 shrink-0 border-r border-[#E9E9E7] dark:border-neutral-800 p-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300 flex items-end transition-colors">
              公司 / 岗位
            </div>
            <div className="flex-1 flex">
              {months.map((month) => {
                const daysInMonth = differenceInCalendarDays(endOfMonth(month), month) + 1;
                const weekCount = Math.ceil(daysInMonth / 7);

                return (
                <div 
                  key={month.toISOString()} 
                  className={`flex-1 p-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 border-l border-[#E9E9E7] dark:border-neutral-800 first:border-l-0 relative transition-colors`}
                  style={{ flexBasis: `${(daysInMonth / totalDays) * 100}%` }}
                >
                  {format(month, 'yyyy 年 M 月')}
                  <div className="flex w-full mt-2 opacity-50">
                    {Array.from({ length: weekCount }, (_, index) => index + 1).map((weekNumber) => (
                      <div key={weekNumber} className="flex-1 text-[10px] text-center">W{weekNumber}</div>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Body Rows */}
          <div className="relative">
            {/* Background grid lines */}
            <div className="absolute inset-0 left-72 pointer-events-none">
              {weekMarkers.map((marker) => (
                <div
                  key={`grid-${marker.toISOString()}`}
                  className="absolute top-0 bottom-0 border-l border-dashed border-[#E9E9E7] dark:border-neutral-800/70"
                  style={{ left: `${getLeftPercentage(marker)}%` }}
                />
              ))}
            </div>

            {timelineRows.map(({ application, stages }) => (
              <div key={application.id} className="flex border-b border-[#E9E9E7] dark:border-neutral-800 last:border-b-0 group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                
                {/* Left Column: Company Info */}
                <div className="w-72 shrink-0 border-r border-[#E9E9E7] dark:border-neutral-800 p-3 flex items-center gap-3 bg-white dark:bg-[#191919] group-hover:bg-neutral-50/50 dark:group-hover:bg-transparent transition-colors">
                  {application.logo ? (
                    <img
                      src={application.logo}
                      alt={`${application.companyName} logo`}
                      className="w-10 h-10 rounded-xl object-cover border border-black/5 dark:border-white/10"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getCompanyAccentColor(application.companyName) }}
                    >
                      {getCompanyInitial(application.companyName)}
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <div className="text-sm font-semibold text-[#37352F] dark:text-[#EBEBEA] truncate transition-colors">{application.companyName}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate transition-colors">{application.jobRole}</div>
                    <div className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CONFIG[application.status].className}`}>
                      {STATUS_CONFIG[application.status].label}
                    </div>
                  </div>
                </div>

                {/* Right Column: Timeline Bars */}
                <div className="flex-1 relative py-4">
                  {stages.length === 0 ? (
                    <div className="mx-4 h-9 rounded-full border border-dashed border-amber-300 dark:border-amber-700 flex items-center px-4 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-900/10 w-fit">
                      待投递，尚未形成时间节点
                    </div>
                  ) : null}

                  {/* Connectors (Dashed Lines) */}
                  {stages.map((stage, index) => {
                    if (index === stages.length - 1) {
                      return null;
                    }

                    const nextStage = stages[index + 1];
                    const stageStartDate = dateValueToDate(stage.date);
                    const nextStageDate = dateValueToDate(nextStage.date);
                    const startX = getLeftPercentage(stageStartDate) + getWidthPercentage(stage.durationDays);
                    const endX = getLeftPercentage(nextStageDate);

                    if (endX <= startX) {
                      return null;
                    }
                    
                    return (
                      <div 
                        key={`line-${application.id}-${stage.key}`}
                        className="absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
                        style={{
                          left: `${startX}%`,
                          width: `${endX - startX}%`,
                        }}
                      >
                        <div className="flex-1 h-px border-t border-dashed border-neutral-400 dark:border-neutral-600 transition-colors"></div>
                        <div className="w-1.5 h-1.5 border-t border-r border-neutral-400 dark:border-neutral-600 rotate-45 -ml-1 transition-colors"></div>
                      </div>
                    );
                  })}

                  {/* Bars */}
                  {stages.map((stage) => {
                    const stageDate = dateValueToDate(stage.date);
                    const left = getLeftPercentage(stageDate);
                    const width = getWidthPercentage(stage.durationDays);
                    
                    return (
                      <div
                        key={`${application.id}-${stage.key}`}
                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full shadow-sm flex items-center justify-center px-2 text-[10px] font-medium text-white whitespace-nowrap overflow-hidden z-10 hover:ring-2 ring-offset-1 dark:ring-offset-[#191919] ring-neutral-400 transition-all cursor-pointer"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          minWidth: 'fit-content',
                          backgroundColor: logoColors.get(application.id) ?? stage.accentColor,
                        }}
                        title={`${stage.label} (${stage.date})`}
                      >
                        {stage.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
