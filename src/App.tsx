import React from 'react';
import { Layout } from './layouts/layout';
import { Home } from './pages/home';
import { useInstallStore } from './store/useInstallStore';

const AppContent: React.FC = () => {
  const updateProgress = useInstallStore((state) => state.updateProgress);

  React.useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    let unsubscribeProgress: any = () => {};
    let unsubscribeLogs: any = () => {};

    if (electronAPI) {
      if (typeof electronAPI.onInstallProgress === 'function') {
        unsubscribeProgress = electronAPI.onInstallProgress((payload: any) => {
          console.log('[App] Received install progress payload:', payload);
          const { wingetId, status, progress, error } = payload;
          
          // Map backend status to frontend InstallStatus
          let mappedStatus: any = status;
          if (status === 'waiting' || status === 'queued') {
            mappedStatus = 'queued';
          } else if (status === 'installed' || status === 'success') {
            mappedStatus = 'success';
          }

          updateProgress(wingetId, {
            status: mappedStatus,
            percent: progress,
            error: error,
            message: status === 'downloading' ? `Downloading... ${progress}%` : 
                     status === 'installing' ? 'Installing...' : 
                     status === 'uninstalling' ? 'Uninstalling...' : 
                     (status === 'installed' || status === 'success') ? 'Installed successfully!' : 
                     (status === 'waiting' || status === 'queued') ? 'Waiting in queue...' : '',
          });
        });
      }

      if (typeof electronAPI.onInstallLog === 'function') {
        const addLog = useInstallStore.getState().addLog;
        unsubscribeLogs = electronAPI.onInstallLog((data: any) => {
          addLog(data.wingetId, data.line);
        });
      }
    }

    return () => {
      unsubscribeProgress();
      unsubscribeLogs();
    };
  }, [updateProgress]);

  return (
    <Layout>
      <Home />
    </Layout>
  );
};

function App() {
  return <AppContent />;
}

export default App;
