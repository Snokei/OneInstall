import { cn } from "@/lib/utils";
import { useInstallStore } from "@/store/useInstallStore";
import {
  ArrowUpCircle,
  CheckSquare,
  Download,
  Sparkles,
  Trash,
} from "lucide-react";
import React from "react";

interface ModuleHeaderProps {
  title?: string;
  description?: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  isActionLoading?: boolean;
}

// Tab-based content configuration
const TAB_CONTENT: Record<
  string,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    actionText: string;
    actionIcon: React.ReactNode;
  }
> = {
  all: {
    title: "Install Popular Windows Apps",
    description:
      "Select the software packages you want to install or update, then click Install Selected. All commands run silently behind the scenes via Windows WinGet.",
    icon: Sparkles,
    actionText: "Install Selected",
    actionIcon: <Download className="w-3.5 h-3.5" />,
  },
  "not-installed": {
    title: "Not Installed Packages",
    description:
      "View and select software packages that are not currently installed on your system. You can easily install them silently with one click.",
    icon: Sparkles,
    actionText: "Install Selected",
    actionIcon: <Download className="w-3.5 h-3.5" />,
  },
  installed: {
    title: "Installed Software Packages",
    description:
      "View, search, and manage all software packages currently installed on your system. Keep track of versions, publishers, and silent uninstall options.",
    icon: CheckSquare,
    actionText: "Uninstall Selected",
    actionIcon: <Trash className="w-3.5 h-3.5" />,
  },
  updates: {
    title: "Available Software Updates",
    description:
      "Cross-reference your installed packages with the latest database releases. Select packages to update them via Windows WinGet.",
    icon: ArrowUpCircle,
    actionText: "Update Selected",
    actionIcon: <Download className="w-3.5 h-3.5" />,
  },
};

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title: propTitle,
  description: propDescription,
  icon: propIcon,
  actionText: propActionText,
  actionIcon: propActionIcon,
  onAction: propOnAction,
  isActionLoading: propIsActionLoading,
}) => {
  const activeFilter = useInstallStore((state) => state.activeFilter);
  const queue = useInstallStore((state) => state.queue);
  const installSelected = useInstallStore((state) => state.installSelected);
  const uninstallSelected = useInstallStore((state) => state.uninstallSelected);

  // Resolve content: props override tab-based defaults
  const tabConfig = TAB_CONTENT[activeFilter] || TAB_CONTENT.all;
  const title = propTitle ?? tabConfig.title;
  const description = propDescription ?? tabConfig.description;
  const Icon = propIcon ?? tabConfig.icon;
  const resolvedActionText =
    queue.length > 0
      ? `${tabConfig.actionText} (${queue.length})`
      : tabConfig.actionText;
  const actionText = propActionText ?? resolvedActionText;
  const actionIcon = propActionIcon ?? tabConfig.actionIcon;
  const onAction = propOnAction ?? (activeFilter === 'installed' ? uninstallSelected : installSelected);
  const isActionLoading =
    propIsActionLoading ?? (queue.length === 0 && !propActionText);

  return (
    <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-2xl transition-all duration-300 gap-4 group">
      {/* Glassy top-right shine */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-gradient-to-br from-white/25 via-white/15 to-transparent rounded-full blur-[60px] transition-transform duration-700 group-hover:scale-125" />
      </div>

      {/* Glassy bottom-left subtle reflection */}
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none overflow-hidden opacity-30 dark:opacity-15">
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-full blur-[50px]" />
      </div>

      {/* Premium background radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-40">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[60px] transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/5 rounded-full blur-[50px] transition-transform duration-700 group-hover:scale-125" />
      </div>

      {/* Subtle glass edge highlight */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />

      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex items-start gap-4">
        {Icon && (
          <div className="p-3 rounded-xl bg-primary/5 text-primary border border-border/30 shrink-0 mt-0.5 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {title}
          </h2>
          <p className="text-sm md:text-sm text-muted-foreground/80 mt-1 max-w-3xl font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Optional action button */}
      {actionText && (
        <button
          onClick={onAction}
          disabled={isActionLoading}
          className={cn(
            "relative z-10 flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all self-start md:self-center shrink-0 active:scale-[0.98] shadow-md cursor-pointer",
            isActionLoading && "opacity-80",
          )}
        >
          {actionIcon && (
            <span className={cn("inline-flex shrink-0")}>{actionIcon}</span>
          )}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default ModuleHeader;
