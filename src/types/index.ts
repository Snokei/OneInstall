export interface Package {
  id: string;
  name: string;
  version?: string;
  publisher: string;
  description: string;
  icon?: string;
  category: string; // Required category for grouping in grid lists
  size?: string;
  wingetId: string; // The identifier used by WinGet (e.g. 'Microsoft.VisualStudioCode')
  isInstalled?: boolean;
  isUpdateAvailable?: boolean;
  installedVersion?: string; // Version currently installed locally
  latestVersion?: string;
  homepage?: string;
  license?: string;
  detailsFetched?: boolean;
}

export type InstallStatus =
  | "idle"
  | "queued"
  | "downloading"
  | "installing"
  | "uninstalling"
  | "success"
  | "failed"
  | "uninstalled";

export interface InstallProgress {
  status: InstallStatus;
  percent: number;
  message?: string;
  error?: string;
  logs?: string[];
}

export interface AppScanStatus {
  wingetId: string;
  isInstalled: boolean;
  installedVersion?: string;
  availableVersion?: string;
  updateAvailable: boolean;
}

export interface AppInstallStatus {
  wingetId: string;
  status: InstallStatus;
  progress: number;
  error?: string;
}

export interface UserSettings {
  darkMode: boolean;
  theme: string;
  parallelCount: number;
  installLocation: string;
}

export interface LogLine {
  wingetId: string;
  line: string;
  timestamp: string;
}
