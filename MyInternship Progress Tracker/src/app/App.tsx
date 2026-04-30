import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CardView } from './components/CardView';
import { GanttView } from './components/GanttView';
import { SlideOutPanel } from './components/SlideOutPanel';
import { DeleteModal } from './components/DeleteModal';
import { Application, APPLICATIONS_STORAGE_BACKUP_KEY, APPLICATIONS_STORAGE_KEY, MOCK_APPLICATIONS, generateApplicationId, normalizeApplication, parseApplicationsStorage, resolveApplicationsStorage, serializeApplicationsStorage } from './data';
import { useLocalStorage } from './hooks/useLocalStorage';

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storageResolution = resolveApplicationsStorage();

    if (!storageResolution.found) {
      setApplications(MOCK_APPLICATIONS);
      return;
    }

    if (storageResolution.shouldResave) {
      setApplications(storageResolution.applications);
    }
  }, [setApplications]);

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

    setApplications((previousApplications) => {
      const existingApplication = previousApplications.some((application) => application.id === normalizedApp.id);
      if (existingApplication) {
        return previousApplications.map((application) => (application.id === normalizedApp.id ? normalizedApp : application));
      }

      return [normalizedApp, ...previousApplications];
    });

    setSelectedApp(normalizedApp);
  };

  const handleDeleteRequest = (app: Application) => {
    setAppToDelete(app);
  };

  const handleConfirmDelete = () => {
    if (appToDelete) {
      setApplications(prev => prev.filter(a => a.id !== appToDelete.id));
      setAppToDelete(null);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen w-full bg-white dark:bg-[#191919] overflow-hidden font-sans transition-colors duration-200 text-neutral-900 dark:text-neutral-100">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onAddNew={handleAddNew}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            activeView={activeView} 
            setActiveView={setActiveView} 
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
