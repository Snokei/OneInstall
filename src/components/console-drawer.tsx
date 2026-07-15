import React, { useRef, useEffect } from "react";
import { useInstallStore } from "@/store/useInstallStore";
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ConsoleDrawer: React.FC = () => {
  const isConsoleOpen = useInstallStore((state) => state.isConsoleOpen);
  const setConsoleOpen = useInstallStore((state) => state.setConsoleOpen);
  const activeConsoleTab = useInstallStore((state) => state.activeConsoleTab);
  const setActiveConsoleTab = useInstallStore((state) => state.setActiveConsoleTab);
  const logs = useInstallStore((state) => state.logs);
  const clearLogs = useInstallStore((state) => state.clearLogs);
  const packages = useInstallStore((state) => state.packages);
  const progress = useInstallStore((state) => state.progress);
  const addLog = useInstallStore((state) => state.addLog);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Derive tabs based on logs that have content + "unified"
  const tabs = Object.keys(logs).filter(
    (key) => logs[key].length > 0 || key === "unified"
  );

  // Auto-scroll to bottom of logs when active tab's logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs[activeConsoleTab]?.length, activeConsoleTab, isConsoleOpen]);

  // Map winget ID to app name for tab labels
  const getTabLabel = (tabId: string) => {
    if (tabId === "unified") return "Unified Feed";
    const pkg = packages.find((p) => p.wingetId === tabId);
    return pkg ? pkg.name : tabId;
  };

  // Color-code console lines for readability
  const renderLogLine = (line: string, index: number) => {
    let textColor = "text-white/80";
    
    if (line.includes("[SYSTEM]")) {
      textColor = "text-cyan-400 font-bold";
    } else if (line.includes("[ERROR]") || line.toLowerCase().includes("failed")) {
      textColor = "text-rose-400 font-bold";
    } else if (
      line.toLowerCase().includes("successfully installed") || 
      line.toLowerCase().includes("successfully uninstalled") ||
      line.includes("exit code 0")
    ) {
      textColor = "text-emerald-400 font-bold";
    } else if (line.toLowerCase().includes("downloading") || line.match(/\d+%/)) {
      textColor = "text-sky-400";
    } else if (line.toLowerCase().includes("installing") || line.toLowerCase().includes("configuring")) {
      textColor = "text-purple-400";
    }

    return (
      <div key={index} className={cn("py-0.5 leading-relaxed font-mono select-text", textColor)}>
        {line}
      </div>
    );
  };

  // Determine if there are active installation threads running
  const isInstalling = Object.values(progress).some((item) =>
    ["queued", "downloading", "installing", "uninstalling"].includes(item.status)
  );

  const handleSaveLogs = async () => {
    const activeLogs = logs[activeConsoleTab] || [];
    if (activeLogs.length === 0) return;

    const fileContent = activeLogs.join("\n");
    const tabName = getTabLabel(activeConsoleTab).replace(/\s+/g, "_").toLowerCase();

    const electronAPI = (window as any).electronAPI;
    if (electronAPI && typeof electronAPI.saveFile === "function") {
      try {
        const savedPath = await electronAPI.saveFile({
          title: `Save ${getTabLabel(activeConsoleTab)} Logs`,
          defaultPath: `${tabName}-install.log`,
          filters: [{ name: "Log Files", extensions: ["log", "txt"] }],
          content: fileContent
        });
        if (savedPath) {
          addLog("unified", `[SYSTEM] Exported logs to "${savedPath}".`);
        }
      } catch (err) {
        console.error("Failed to save logs:", err);
      }
    } else {
      // Browser Blob Download fallback
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tabName}-install.log`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-[#0E0E12]/95 border-t border-white/10 backdrop-blur-2xl transition-all duration-300 z-50 flex flex-col font-sans shrink-0",
        isConsoleOpen ? "h-80" : "h-10"
      )}
    >
      {/* Console Header Bar */}
      <div 
        onClick={() => setConsoleOpen(!isConsoleOpen)}
        className="h-10 flex items-center justify-between px-6 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] select-none shrink-0"
      >
        <div className="flex items-center gap-3">
          <Terminal size={14} className={cn("text-muted-foreground", isInstalling && "text-primary animate-pulse")} />
          <span className="text-xs font-bold text-foreground">
            Operation Console
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isInstalling ? "bg-amber-500 animate-ping" : "bg-neutral-600"
            )} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              {isInstalling ? "Running Tasks" : "Idle"}
            </span>
          </div>
        </div>

        {/* Tab Headers inside Header Bar (visible when console is open) */}
        {isConsoleOpen && (
          <div className="flex items-center gap-1 overflow-x-auto max-w-[50%] no-scrollbar h-full px-2" onClick={(e) => e.stopPropagation()}>
            {tabs.map((tab) => {
              const isActive = activeConsoleTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveConsoleTab(tab)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {getTabLabel(tab)}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {isConsoleOpen && (
            <>
              <button
                onClick={handleSaveLogs}
                disabled={(logs[activeConsoleTab] || []).length === 0}
                className={cn(
                  "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer border-0 bg-transparent",
                  (logs[activeConsoleTab] || []).length === 0 && "opacity-40 cursor-not-allowed hover:bg-transparent"
                )}
                title="Save logs to file"
              >
                <Download size={14} />
              </button>
              <button
                onClick={clearLogs}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer border-0 bg-transparent"
                title="Clear console buffers"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button 
            onClick={() => setConsoleOpen(!isConsoleOpen)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all border-0 bg-transparent cursor-pointer"
          >
            {isConsoleOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      {isConsoleOpen && (
        <div 
          ref={scrollRef}
          className="flex-1 bg-[#070709] overflow-y-auto p-5 font-mono text-xs select-text border-t border-white/5"
        >
          {logs[activeConsoleTab] && logs[activeConsoleTab].length > 0 ? (
            logs[activeConsoleTab].map((line, index) => renderLogLine(line, index))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 gap-2 font-sans py-12">
              <Terminal size={24} className="stroke-[1.5]" />
              <p className="text-xs">Console is empty. Install or uninstall packages to populate logs.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsoleDrawer;
