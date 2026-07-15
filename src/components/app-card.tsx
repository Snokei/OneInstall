import React from 'react';
import type { Package } from '@/types';
import { useInstallStore } from '@/store/useInstallStore';
import LucideIcon from './ui/lucide-icon';
import SoftwareIcon from './ui/software-icon';
import { cn } from '@/lib/utils';

interface AppCardProps {
  app: Package;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const isSelected = useInstallStore((state) => state.queue.includes(app.wingetId));
  const install = useInstallStore((state) => state.progress[app.wingetId]);
  const activeFilter = useInstallStore((state) => state.activeFilter);
  
  const toggleSelect = useInstallStore((state) => state.toggleSelect);
  const cancelInstall = useInstallStore((state) => state.cancelInstall);

  const isInstalled = app.isInstalled || false;
  const updateAvailable = app.isUpdateAvailable || false;
  const installedVersion = app.installedVersion;

  // Fully installed with no updates – lock selection on non-installed tabs
  const isLocked = isInstalled && !updateAvailable && activeFilter !== 'installed';
  const availableVersion = app.latestVersion || app.version;

  const loadPackageDetails = useInstallStore((state) => state.loadPackageDetails);

  React.useEffect(() => {
    if (app.category === "Online Search" && !app.detailsFetched) {
      loadPackageDetails(app.wingetId);
    }
  }, [app.wingetId, app.category, app.detailsFetched, loadPackageDetails]);

  const isLoadingDetails = app.category === "Online Search" && !app.detailsFetched;
  const descriptionText = app.description?.trim() || app.publisher || "No description available.";

  // Determine active display status
  let statusText = '';
  let statusColor = '';
  let progress = 0;
  let isInstalling = false;
  let errorMsg = '';

  if (install) {
    if (['queued', 'downloading', 'installing', 'uninstalling'].includes(install.status)) {
      isInstalling = true;
      progress = install.percent;
    }

    switch (install.status) {
      case 'queued':
        statusText = 'Waiting...';
        statusColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
        break;
      case 'downloading':
        statusText = `Downloading (${progress}%)`;
        statusColor = 'text-blue-500 bg-blue-500/10 border-blue-500/30';
        break;
      case 'installing':
        statusText = 'Installing...';
        statusColor = 'text-purple-500 bg-purple-500/10 border-purple-500/30';
        break;
      case 'uninstalling':
        statusText = 'Uninstalling...';
        statusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
        break;
      case 'success':
        statusText = 'Installed';
        statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        break;
      case 'failed':
        statusText = 'Failed';
        statusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
        errorMsg = install.error || 'Failed';
        break;
    }
  } else if (isInstalled) {
    if (updateAvailable) {
      statusText = 'Update Ready';
      statusColor = 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30';
    } else {
      statusText = 'Installed';
      statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    }
  }

  const handleCardClick = () => {
    // Disable selection when active installation is in progress or app is locked
    if (isInstalling || isLocked) return;
    toggleSelect(app.wingetId);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-300 select-none cursor-pointer group backdrop-blur-2xl",
        isSelected 
          ? "bg-primary/15 border-primary/60 shadow-lg shadow-primary/10" 
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
        isInstalling && "cursor-default border-white/10 hover:translate-y-0 bg-white/5",
        isLocked && "cursor-default opacity-60 hover:translate-y-0"
      )}
    >
      {/* Glassy top-right shine */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none overflow-hidden opacity-60 dark:opacity-25">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/25 via-white/15 to-transparent rounded-full blur-[50px] transition-transform duration-700 group-hover:scale-125" />
      </div>
      {/* Glassy bottom-left subtle reflection */}
      <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none overflow-hidden opacity-30 dark:opacity-15">
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-full blur-[40px]" />
      </div>
      {/* Subtle glass edge highlight */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5" />
      {/* Top Options Bar (Checkbox) */}
      <div className="flex items-center justify-between w-full mb-3">
        {/* Selection Checkbox */}
        <div 
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded-md border transition-all duration-200 cursor-pointer",
            isSelected 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-muted-foreground/40 bg-background/50 group-hover:border-muted-foreground/80",
            isInstalling && "opacity-30 cursor-not-allowed",
            isLocked && "opacity-30 cursor-not-allowed border-muted-foreground/20 bg-muted/30"
          )}
        >
          {isLocked 
            ? <LucideIcon name="Lock" size={12} className="text-muted-foreground/50" />
            : isSelected && <LucideIcon name="Check" size={14} className="stroke-[3]" />}
        </div>
        {/* Spacer to keep layout */}
        <div className="w-8" />
      </div>

      {/* Main Info */}
      <div className="flex items-start gap-4 mb-4">
        {/* Dynamic App Icon */}
        <div className="flex items-center justify-center p-3 rounded-xl bg-background/60 border border-border/30 text-foreground group-hover:scale-105 transition-transform duration-300 w-14 h-14 shrink-0">
          <SoftwareIcon appId={app.id} wingetId={app.wingetId} fallbackIcon={app.icon} size={32} className="object-contain" />
        </div>

        {/* Name and Publisher */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight truncate text-foreground">
            {app.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate font-medium">
            {app.publisher}
          </p>
        </div>
      </div>

      {/* Description */}
      {isLoadingDetails ? (
        <div className="flex flex-col gap-2 mb-4 flex-1 animate-pulse">
          <div className="h-3.5 bg-white/10 rounded w-full" />
          <div className="h-3.5 bg-white/10 rounded w-5/6" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed mb-4 flex-1">
          {descriptionText}
        </p>
      )}



      {/* Footer Area: Version Numbers and Badges */}
      <div className="flex flex-col gap-3 pt-3 border-t border-border/20">
        <div className="flex items-center justify-between text-sm">
          {/* Versions */}
          <div className="text-muted-foreground font-mono">
            {isInstalled ? (
              <span className="flex flex-col gap-0.5">
                <span className="text-[10px]">v{installedVersion}</span>
                {updateAvailable && availableVersion && (
                  <span className="text-[10px] text-cyan-500 font-bold flex items-center gap-0.5">
                    <LucideIcon name="ArrowUpCircle" size={10} /> v{availableVersion}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-[10px]">ID: {app.wingetId}</span>
            )}
          </div>

          {/* Badge */}
          {statusText && (
            <span className={cn("px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase", statusColor)}>
              {statusText}
            </span>
          )}
        </div>

        {/* Installation Actions and Progress Bar */}
        {isInstalling && (
          <div className="flex flex-col gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  install?.status === 'uninstalling' ? 'bg-rose-500 animate-pulse' :
                  install?.status === 'installing' ? 'bg-purple-500 animate-pulse' : 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground">
                {install?.status === 'downloading' ? 'Downloading...' : 
                 install?.status === 'uninstalling' ? 'Uninstalling...' : 'Configuring...'}
              </span>
              <button
                onClick={() => cancelInstall(app.wingetId)}
                className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-0.5 bg-transparent border-0 cursor-pointer"
              >
                <LucideIcon name="XCircle" size={12} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errorMsg && !isInstalling && (
          <div className="text-[10px] text-rose-500 font-medium flex items-start gap-1" onClick={(e) => e.stopPropagation()}>
            <LucideIcon name="AlertTriangle" size={12} className="shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppCard;
