import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, Link as LinkIcon, Calendar, MessageSquare, ChevronDown, ExternalLink } from 'lucide-react';
import { Application, ApplicationStatus, DATE_FIELDS, STATUS_CONFIG, TimelineDateField, createEmptyApplication, getCompanyAccentColor, getCompanyInitial, parseApplicationSource } from '../data';

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSave: (app: Application) => void;
}

export function SlideOutPanel({ isOpen, onClose, application, onSave }: SlideOutPanelProps) {
  const [formData, setFormData] = useState<Application>(createEmptyApplication());
  const [sourceInput, setSourceInput] = useState('');
  const [parseMessage, setParseMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (application) {
      setFormData(application);
      setSourceInput(application.jobDescription || application.jobLink);
    } else {
      setFormData(createEmptyApplication());
      setSourceInput('');
    }

    setParseMessage('');
  }, [application, isOpen]);

  const handleChange = <K extends keyof Application>(field: K, value: Application[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: TimelineDateField, value: string) => {
    setFormData((previousFormData) => ({
      ...previousFormData,
      dates: {
        ...previousFormData.dates,
        [field]: value || null,
      },
    }));
  };

  const handleParse = () => {
    const parsedApplication = parseApplicationSource([formData.jobLink, sourceInput].filter(Boolean).join('\n'));

    setFormData((previousFormData) => ({
      ...previousFormData,
      companyName: parsedApplication.companyName || previousFormData.companyName,
      jobRole: parsedApplication.jobRole || previousFormData.jobRole,
      jobDescription: parsedApplication.jobDescription || previousFormData.jobDescription,
      jobLink: parsedApplication.jobLink || previousFormData.jobLink,
    }));

    setParseMessage(
      parsedApplication.matchedFields.length > 0
        ? `已自动填充：${parsedApplication.matchedFields.join('、')}`
        : '暂未识别出明确字段，请继续手动补充。',
    );
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        handleChange('logo', fileReader.result);
      }
    };
    fileReader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = () => {
    const nextApplication: Application = {
      ...formData,
      companyName: formData.companyName.trim(),
      jobRole: formData.jobRole.trim(),
      jobDescription: formData.jobDescription.trim() || sourceInput.trim(),
      jobLink: formData.jobLink.trim(),
      notes: formData.notes.trim(),
    };

    if (nextApplication.companyName && nextApplication.jobRole) {
      onSave(nextApplication);
      onClose();
    }
  };

  const saveDisabled = !formData.companyName.trim() || !formData.jobRole.trim();
  const previewAccentColor = getCompanyAccentColor(formData.companyName);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 backdrop-blur-sm transition-colors"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[500px] bg-white dark:bg-[#202020] shadow-2xl dark:shadow-neutral-900/50 z-50 flex flex-col border-l border-[#E9E9E7] dark:border-neutral-800 transition-colors"
          >
            {/* Header */}
            <div className="h-14 border-b border-[#E9E9E7] dark:border-neutral-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-[#202020] transition-colors">
              <h2 className="font-semibold text-lg text-[#37352F] dark:text-[#EBEBEA]">
                {application ? '投递详情 (Details)' : '新建投递 (New)'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              
              {/* Logo Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E9E9E7] dark:border-neutral-700 rounded-xl min-h-24 px-4 py-4 flex items-center gap-4 text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/30 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt={`${formData.companyName || '公司'} logo`}
                    className="w-16 h-16 rounded-2xl object-cover border border-black/5 dark:border-white/10 shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ backgroundColor: previewAccentColor }}
                  >
                    {getCompanyInitial(formData.companyName)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
                    <UploadCloud size={18} />
                    <span className="text-sm font-semibold">上传公司 Logo</span>
                  </div>
                  <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    图片会转换成 Base64 存到本地浏览器，关闭页面后仍可恢复。
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">公司名称 (Company)</label>
                  <input 
                    type="text" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 bg-transparent dark:bg-[#191919] rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm text-neutral-900 dark:text-neutral-100 transition-colors"
                    placeholder="e.g. ByteDance"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">岗位名称 (Role)</label>
                  <input 
                    type="text" 
                    value={formData.jobRole}
                    onChange={(e) => handleChange('jobRole', e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 bg-transparent dark:bg-[#191919] rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 text-sm text-neutral-900 dark:text-neutral-100 transition-colors"
                    placeholder="e.g. Frontend Engineer Intern"
                  />
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">当前状态 (Status)</label>
                  <div className="relative">
                    <select 
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as ApplicationStatus)}
                      className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none text-sm bg-white dark:bg-[#191919] text-neutral-900 dark:text-neutral-100 transition-colors"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                {DATE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">{field.label}</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dates[field.key] || ''}
                        onChange={(e) => handleDateChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 pl-9 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent dark:bg-[#191919] text-sm text-neutral-900 dark:text-neutral-100 transition-colors dark:[color-scheme:dark]"
                      />
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* JD Link & Parse */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">JD 网页链接 (JD Link)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="url" 
                      value={formData.jobLink}
                      onChange={(e) => handleChange('jobLink', e.target.value)}
                      className="w-full px-3 py-2 pl-9 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent dark:bg-[#191919] text-sm text-neutral-900 dark:text-neutral-100 transition-colors"
                      placeholder="https://..."
                    />
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleParse}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
                  >
                    一键解析
                  </button>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  可直接粘贴招聘页链接，解析函数会尝试从域名或文本关键词补齐公司和岗位信息。
                </p>
              </div>

              {/* Apply Link */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">网申链接 (Apply Link)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.applyLink}
                    onChange={(e) => handleChange('applyLink', e.target.value)}
                    className="w-full px-3 py-2 pl-9 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent dark:bg-[#191919] text-sm text-neutral-900 dark:text-neutral-100 transition-colors"
                    placeholder="https://（在线投递/网申系统链接）"
                  />
                  <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  填写后，卡片上会出现一键直达图标，点击即可直接打开网申页面。
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">智能输入区 (Paste JD or Link)</label>
                <textarea
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent dark:bg-[#191919] text-sm text-neutral-900 dark:text-neutral-100 min-h-[110px] resize-none transition-colors"
                  placeholder="粘贴 JD 原文、招聘公告，或直接贴一个网页链接。"
                />
                {parseMessage ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{parseMessage}</p>
                ) : null}
              </div>

              {/* JD Textarea */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">职位描述 (Job Description)</label>
                <textarea 
                  value={formData.jobDescription}
                  onChange={(e) => handleChange('jobDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 bg-transparent dark:bg-[#191919] text-sm text-neutral-900 dark:text-neutral-100 min-h-[120px] resize-none transition-colors"
                  placeholder="Paste job description here..."
                />
              </div>

              {/* Notes / Reflection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  日志/复盘记录 (Notes & Reflection)
                </label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-[#E9E9E7] dark:border-neutral-700 rounded-md outline-none focus:border-neutral-400 dark:focus:border-neutral-500 text-sm min-h-[100px] resize-none bg-yellow-50/30 dark:bg-yellow-900/10 text-neutral-900 dark:text-neutral-100 transition-colors"
                  placeholder="Record interview notes, lessons learned..."
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E9E9E7] dark:border-neutral-800 bg-white dark:bg-[#202020] shrink-0 transition-colors">
              <button 
                onClick={handleSave}
                disabled={saveDisabled}
                className="w-full py-2.5 bg-[#37352F] dark:bg-[#EBEBEA] hover:bg-black dark:hover:bg-white disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500 text-white dark:text-[#191919] rounded-md font-medium text-sm transition-colors shadow-sm"
              >
                保存 (Save)
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
