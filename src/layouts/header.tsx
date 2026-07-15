import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInstallStore } from "@/store/useInstallStore";
import { Package, RotateCw, Search, X } from "lucide-react";
import React from "react";
import { ProfileDropdown } from "@/components/profile-dropdown";

export const Header: React.FC = () => {
  const activeFilter = useInstallStore((state) => state.activeFilter);
  const searchQuery = useInstallStore((state) => state.searchQuery);
  const isScanning = useInstallStore((state) => state.isScanning);

  const setSearchQuery = useInstallStore((state) => state.setSearchQuery);
  const refreshStatus = useInstallStore((state) => state.refreshStatus);

  // Navigation Items definitions

  // Search input placeholder based on current filter
  const getSearchPlaceholder = () => {
    switch (activeFilter) {
      case "installed":
        return "Search installed packages...";
      case "updates":
        return "Search upgradeable packages...";
      case "not-installed":
        return "Search uninstalled packages...";
      default:
        return "Search software (e.g. VS Code, Chrome)...";
    }
  };

  return (
    <header className="relative z-50 h-16 w-full flex items-center justify-between px-6 border-b border-border/40 bg-card/10 backdrop-blur-xl shrink-0 font-sans">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        {/* App Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Package size={17} className="stroke-[2]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm leading-tight tracking-wider text-foreground uppercase">
              OneInstall
            </h1>
            <p className="text-[9px] text-muted-foreground font-semibold">
              WinGet GUI Core
            </p>
          </div>
        </div>
      </div>

      {/* Center: Dynamic Search Box */}
      <div className="relative w-full max-w-[28rem] mx-8 group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search
            size={16}
            className="text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-300"
          />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={getSearchPlaceholder()}
          className="w-full h-10 pl-11 pr-10 rounded-full bg-card/60 hover:bg-card/90 border border-border/60 text-sm focus:outline-none focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground shadow-sm group-focus-within:shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 group/clear bg-transparent border-none cursor-pointer outline-none"
          >
            <div className="p-1 rounded-full bg-muted/0 hover:bg-muted/80 text-muted-foreground/60 hover:text-foreground transition-all duration-200">
              <X size={14} className="stroke-[2.5]" />
            </div>
          </button>
        )}
      </div>

      {/* Right: Action Toolbar */}
      <div className="flex items-center gap-3">
        <ProfileDropdown />

        {/* Rescan packages button */}
        <Button
          onClick={refreshStatus}
          disabled={isScanning}
          variant="outline"
          size="icon"
          title="Rescan package installation status"
          className="bg-background/50 border border-border/30 text-muted-foreground hover:text-foreground shrink-0 flex items-center justify-center cursor-pointer"
        >
          <RotateCw size={15} className={cn(isScanning && "animate-spin")} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
