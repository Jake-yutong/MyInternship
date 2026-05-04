import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { fetchApplicationsFromServer, saveApplicationsToServer } from './api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CardView } from './components/CardView';
import { GanttView } from './components/GanttView';
import { SlideOutPanel } from './components/SlideOutPanel';
import { DeleteModal } from './components/DeleteModal';
import { Application, APPLICATIONS_STORAGE_BACKUP_KEY, APPLICATIONS_STORAGE_KEY, MOCK_APPLICATIONS, generateApplicationId, normalizeApplication, parseApplicationsStorage, resolveApplicationsStorage, serializeApplicationsStorage } from './data';
import { useLocalStorage } from './hooks/useLocalStorage';

type PersistenceMode = 'connecting' | 'server' | 'local';

function formatLastSyncedAt(value: string | null) {
  if (!value) {
    return '等待首次同步';
  }

  const savedAt = new Date(value);
  if (Number.isNaN(savedAt.getTime())) {
    return '等待首次同步';
  }

  const diffInMinutes = Math.floor((Date.now() - savedAt.getTime()) / 60000);

  if (diffInMinutes <= 0) {
    return '刚刚同步';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前同步`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} 小时前同步`;
  }

  return savedAt.toLocaleString('zh-CN', { hour12: false });
}

export default function App() {
  const [activeView, setActiveView] = useState<'card' | 'gantt'>('card');
  const [applications, setApplications] = useLocalStorage<Application[]>(APPLICATIONS_STORAGE_KEY, () => resolveApplicationsStorage().applications, {
    serialize: serializeApplicationsStorage,
    deserialize: parseApplicationsStorage,
    backupKey: APPLICATIONS_STORAGE_BACKUP_KEY,
  });
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('connecting');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const latestSaveRequestIdRef = useRef(0);
  const pendingSaveCountRef = useRef(0);

  const syncSelectedApplication = (nextApplications: Application[]) => {
    setSelectedApp((currentSelectedApp) => {
      if (!currentSelectedApp) {
        return currentSelectedApp;
      }

      return nextApplications.find((application) => application.id === currentSelectedApp.id) ?? currentSelectedApp;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storageResolution = resolveApplicationsStorage();

    if (!storageResolution.found || storageResolution.shouldResave) {
      setApplications(storageResolution.applications);
    }

    let cancelled = false;

    const bootstrapApplications = async () => {
      setPersistenceMode('connecting');

      try {
        const remotePayload = await fetchApplicationsFromServer();

        if (!remotePayload.found && storageResolution.applications.length > 0) {
          setIsSyncing(true);

          const seededPayload = await saveApplicationsToServer(storageResolution.applications);
          if (cancelled) {
            return;
          }

          setApplications(seededPayload.applications);
          setPersistenceMode('server');
          setLastSyncedAt(seededPayload.savedAt);
          setSyncMessage('已将浏览器中的历史记录迁移到后端。');
          return;
        }

        if (cancelled) {
          return;
        }

        setApplications(remotePayload.applications);
        syncSelectedApplication(remotePayload.applications);
        setPersistenceMode('server');
        setLastSyncedAt(remotePayload.savedAt);
        setSyncMessage(remotePayload.recovered ? '后端主数据异常，已自动从备份恢复。' : null);
      } catch {
        if (cancelled) {
          return;
        }

        if (!storageResolution.found) {
          setApplications(MOCK_APPLICATIONS);
        }

        setPersistenceMode('local');
        setSyncMessage('后端暂时不可用，当前继续使用浏览器本地缓存。');
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    };

    void bootstrapApplications();

    return () => {
      cancelled = true;
    };
  }, [setApplications]);

  const persistApplications = async (nextApplications: Application[]) => {
    setApplications(nextApplications);
    syncSelectedApplication(nextApplications);
    const requestId = ++latestSaveRequestIdRef.current;
    pendingSaveCountRef.current += 1;
    setIsSyncing(true);

    try {
      const remotePayload = await saveApplicationsToServer(nextApplications);

      if (requestId !== latestSaveRequestIdRef.current) {
        return;
      }

      setApplications(remotePayload.applications);
      syncSelectedApplication(remotePayload.applications);
      setPersistenceMode('server');
      setLastSyncedAt(remotePayload.savedAt);
      setSyncMessage(null);
    } catch {
      if (requestId !== latestSaveRequestIdRef.current) {
        return;
      }

      setPersistenceMode('local');
      setSyncMessage('后端保存失败，当前变更仅保存在浏览器本地缓存。');
    } finally {
      pendingSaveCountRef.current = Math.max(0, pendingSaveCountRef.current - 1);
      if (pendingSaveCountRef.current === 0) {
        setIsSyncing(false);
      }
    }
  };

  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
    setIsPanelOpen(true);
  };

  const handleAddNew = () => {
    setSelectedApp(null);
    setIsPanelOpen(true);
  };

  const handleSave = (savedApp: Application) => {
    const normalizedApp = normalizeApplication({
      ...savedApp,
      id: savedApp.id || generateApplicationId(),
    });

    const previousApplications = applications;
    const nextApplications = (() => {
      const existingApplication = previousApplications.some((application) => application.id === normalizedApp.id);
      if (existingApplication) {
        return previousApplications.map((application) => (application.id === normalizedApp.id ? normalizedApp : application));
      }

      return [normalizedApp, ...previousApplications];
    })();

    void persistApplications(nextApplications);

    setSelectedApp(normalizedApp);
  };

  const handleDeleteRequest = (app: Application) => {
    setAppToDelete(app);
  };

  const handleConfirmDelete = () => {
    if (appToDelete) {
      const nextApplications = applications.filter((application) => application.id !== appToDelete.id);
      void persistApplications(nextApplications);
      setAppToDelete(null);
    }
  };

  const storageStatusLabel = persistenceMode === 'server'
    ? isSyncing
      ? '后端同步中'
      : '后端已连接'
    : persistenceMode === 'local'
      ? '本地缓存模式'
      : '连接后端中';

  const storageStatusTone = persistenceMode === 'server'
    ? 'success'
    : persistenceMode === 'local'
      ? 'warning'
      : 'neutral';

  const footerStatusText = syncMessage ?? (persistenceMode === 'server'
    ? formatLastSyncedAt(lastSyncedAt)
    : persistenceMode === 'local'
      ? '后端未连接，当前仅保存在浏览器缓存'
      : '正在连接后端服务');

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen w-full bg-white dark:bg-[#191919] overflow-hidden font-sans transition-colors duration-200 text-neutral-900 dark:text-neutral-100">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onAddNew={handleAddNew}
          storageStatusText={footerStatusText}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            storageStatusLabel={storageStatusLabel}
            storageStatusTone={storageStatusTone}
          />
          
          <main className="flex-1 overflow-hidden relative">
            {activeView === 'card' ? (
              <CardView 
                applications={applications} 
                onCardClick={handleCardClick}
                onAddNew={handleAddNew}
                onDelete={handleDeleteRequest}
              />
            ) : (
              <GanttView 
                applications={applications} 
              />
            )}
          </main>
        </div>

        <SlideOutPanel 
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          application={selectedApp}
          onSave={handleSave}
        />

        <DeleteModal
          isOpen={appToDelete !== null}
          onClose={() => setAppToDelete(null)}
          onConfirm={handleConfirmDelete}
          application={appToDelete}
        />
      </div>
    </ThemeProvider>
  );
}
