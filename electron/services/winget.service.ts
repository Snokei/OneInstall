import { ChildProcess, exec, spawn } from "child_process";
import { WebContents } from "electron";
import {
  AppInstallStatus,
  AppScanStatus,
  InstallStatus,
} from "../../src/types";

export class WingetService {
  private activeInstalls = new Map<string, ChildProcess>();
  private pendingQueue: string[] = [];
  private parallelLimit = 2; // Default, will be updated by settings
  private eventSender: WebContents | null = null;
  private installLocation = "";

  // Set maximum parallel installations
  public setParallelLimit(limit: number) {
    this.parallelLimit = limit;
    this.processQueue();
  }

  // Set custom installation location
  public setInstallLocation(location: string) {
    this.installLocation = location;
  }

  // Helper to clean Winget ID by stripping MSIX/ARP prefixes
  private cleanWingetId(rawId: string): string {
    let cleaned = rawId;
    cleaned = cleaned.replace(/^(MSIX|ARP\\[^\\]+)\\(Local|Machine)?\\?/i, "");
    cleaned = cleaned.replace(/^(MSIX|ARP\\[^\\]+)\\/i, "");
    cleaned = cleaned.replace(/^(MSIX|ARP)\\/i, "");
    cleaned = cleaned.replace(
      /^(MSIX|ARP\\[^\\]+)\\\\(Local|Machine)?\\\\?/i,
      "",
    );
    cleaned = cleaned.replace(/^(MSIX|ARP\\[^\\]+)\\\\/i, "");
    cleaned = cleaned.replace(/^(MSIX|ARP)\\\\/i, "");
    return cleaned;
  }

  // Parse table structure from winget output safely
  private parseWingetTable(stdout: string): {
    name: string;
    id: string;
    version: string;
    availableVersion?: string;
    source: string;
  }[] {
    const lines = stdout.split(/\r?\n/);
    if (lines.length < 3) return [];

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes("Name") &&
        line.includes("Id") &&
        line.includes("Version")
      ) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) return [];

    const header = lines[headerIndex];
    // Strip BOM
    const cleanHeader = header.replace(/^\uFEFF/, "");

    const idIdx = cleanHeader.indexOf("Id ");
    const verIdx = cleanHeader.indexOf("Version ");
    const avIdx = cleanHeader.indexOf("Available ");
    const srcIdx = cleanHeader.indexOf("Source");

    if (idIdx === -1 || verIdx === -1) return [];

    const apps: {
      name: string;
      id: string;
      version: string;
      availableVersion?: string;
      source: string;
    }[] = [];
    const dataStartIndex = headerIndex + 2;

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.startsWith("---")) continue;
      if (line.length < idIdx) continue;

      const name = line.substring(0, idIdx).trim();
      const id = line
        .substring(idIdx, verIdx === -1 ? line.length : verIdx)
        .trim();
      if (!id) continue;

      const version =
        verIdx !== -1
          ? line.substring(verIdx, avIdx === -1 ? line.length : avIdx).trim()
          : "";
      const availableVersion =
        avIdx !== -1
          ? line.substring(avIdx, srcIdx === -1 ? line.length : srcIdx).trim()
          : "";
      const source = srcIdx !== -1 ? line.substring(srcIdx).trim() : "";

      apps.push({
        name,
        id,
        version,
        availableVersion: availableVersion || undefined,
        source,
      });
    }

    return apps;
  }

  // Find the best match using the prioritized approach
  private findBestMatch(
    installedList: {
      name: string;
      id: string;
      version: string;
      availableVersion?: string;
      source: string;
    }[],
    catalogName: string,
    catalogId: string,
  ) {
    const normCatName = (catalogName || "").toLowerCase().trim();
    const normCatId = (catalogId || "").toLowerCase().trim();

    if (!normCatId && !normCatName) return null;

    // Priority 1: Exact ID match or prefix ID match with boundary
    for (const ia of installedList) {
      if (!ia || !ia.id) continue;
      const cleanedInstId = this.cleanWingetId(ia.id).toLowerCase().trim();
      if (normCatId && cleanedInstId === normCatId) {
        return ia;
      }
      if (normCatId && cleanedInstId.startsWith(normCatId)) {
        const suffix = cleanedInstId.substring(normCatId.length);
        if (!suffix || /^[._\-\s]/.test(suffix) || /^\d/.test(suffix)) {
          return ia;
        }
      }
    }

    // Priority 2: Substring ID match
    for (const ia of installedList) {
      if (!ia || !ia.id) continue;
      const cleanedInstId = this.cleanWingetId(ia.id).toLowerCase().trim();
      if (normCatId && cleanedInstId.includes(normCatId)) {
        return ia;
      }
    }

    // Priority 3: Name exact or prefix match
    for (const ia of installedList) {
      if (!ia || !ia.name) continue;
      const normInstName = ia.name.toLowerCase().trim();
      if (normCatName && normInstName === normCatName) {
        return ia;
      }
      if (normCatName && normInstName.startsWith(normCatName)) {
        const suffix = normInstName.substring(normCatName.length);
        // Suffix starts with a non-alphanumeric character (e.g. space, version number)
        if (!suffix || /^[^\w]/.test(suffix)) {
          return ia;
        }
      }
    }

    return null;
  }

  // Run winget list to detect if apps in our catalog are installed
  public async checkInstalled(
    apps: { wingetId: string; name: string }[],
    eventSender: WebContents,
  ): Promise<AppScanStatus[]> {
    this.eventSender = eventSender;
    return new Promise((resolve) => {
      // Run winget list once
      exec(
        "winget list --accept-source-agreements",
        { encoding: "utf-8" },
        (error, stdout) => {
          const output = stdout || "";
          const installedList = this.parseWingetTable(output);

          const results: AppScanStatus[] = apps.map((app) => {
            const match = this.findBestMatch(
              installedList,
              app.name,
              app.wingetId,
            );

            if (match) {
              return {
                wingetId: app.wingetId,
                isInstalled: true,
                installedVersion: match.version || "Installed",
                updateAvailable: false,
              };
            }

            return {
              wingetId: app.wingetId,
              isInstalled: false,
              updateAvailable: false,
            };
          });

          resolve(results);
        },
      );
    });
  }

  // Run winget upgrade to check which apps have updates available
  public async checkUpdates(
    apps: { wingetId: string; name: string }[],
    eventSender: WebContents,
  ): Promise<AppScanStatus[]> {
    this.eventSender = eventSender;
    return new Promise((resolve) => {
      exec(
        "winget upgrade --accept-source-agreements",
        { encoding: "utf-8" },
        (error, stdout) => {
          const output = stdout || "";
          const upgradeList = this.parseWingetTable(output);

          const results: AppScanStatus[] = apps.map((app) => {
            const match = this.findBestMatch(
              upgradeList,
              app.name,
              app.wingetId,
            );

            if (match) {
              return {
                wingetId: app.wingetId,
                isInstalled: true,
                installedVersion: match.version || "Unknown",
                availableVersion: match.availableVersion || "Unknown",
                updateAvailable: true,
              };
            }

            return {
              wingetId: app.wingetId,
              isInstalled: false,
              updateAvailable: false,
            };
          });

          resolve(results);
        },
      );
    });
  }

  // Search winget for packages
  public async searchOnline(query: string): Promise<any[]> {
    return new Promise((resolve) => {
      exec(
        `winget search "${query}" --accept-source-agreements --source winget`,
        { encoding: "utf-8" },
        (error, stdout) => {
          const output = stdout || "";
          const lines = output.split(/\r?\n/);
          const results: any[] = [];

          let headerFound = false;

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (!headerFound) {
              // Find the separator line that looks like "----  ---  ---"
              if (trimmed.startsWith("---")) {
                headerFound = true;
              }
              continue;
            }

            // Split by 2 or more spaces
            const parts = trimmed.split(/\s{2,}/);
            if (parts.length >= 3) {
              const name = parts[0];
              const wingetId = parts[1];

              // Basic filtering to ensure valid id
              if (wingetId && wingetId.includes(".")) {
                results.push({
                  id: wingetId.replace(/\./g, "-").toLowerCase(),
                  name,
                  wingetId,
                  category: "Online Search",
                  description: `Found via Winget search`,
                  publisher: wingetId.split(".")[0] || "Unknown",
                  isInstalled: false,
                  isUpdateAvailable: false,
                });
              }
            }
          }

          resolve(results);
        },
      );
    });
  }

  // Show package info from winget
  public async showPackageInfo(wingetId: string): Promise<any> {
    console.log(`[Winget Service] Fetching package details for: ${wingetId}`);
    return new Promise((resolve) => {
      exec(
        `winget show "${wingetId}" --accept-source-agreements`,
        { encoding: "utf-8" },
        (error, stdout) => {
          if (error) {
            console.error(
              `[Winget Service] Failed to run winget show for ${wingetId}:`,
              error,
            );
          }

          const output = stdout || "";
          const lines = output.split(/\r?\n/);

          let description = "";
          let publisher = "";
          let homepage = "";
          let license = "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("Publisher:")) {
              publisher = trimmed.substring("Publisher:".length).trim();
            } else if (trimmed.startsWith("Description:")) {
              description = trimmed.substring("Description:".length).trim();
            } else if (trimmed.startsWith("Homepage:")) {
              homepage = trimmed.substring("Homepage:".length).trim();
            } else if (trimmed.startsWith("License:")) {
              license = trimmed.substring("License:".length).trim();
            }
          }

          const details = {
            wingetId,
            publisher: publisher || undefined,
            description: description || undefined,
            homepage: homepage || undefined,
            license: license || undefined,
          };

          console.log(
            `[Winget Service] Resolved details for ${wingetId}:`,
            details,
          );
          resolve(details);
        },
      );
    });
  }

  // Add packages to the installer queue
  public async install(
    wingetIds: string[],
    eventSender: WebContents,
  ): Promise<void> {
    this.eventSender = eventSender;

    for (const wingetId of wingetIds) {
      // Skip if already in queue or active
      if (
        this.pendingQueue.includes(wingetId) ||
        this.activeInstalls.has(wingetId)
      ) {
        continue;
      }

      this.pendingQueue.push(wingetId);
      this.notifyStatus(wingetId, "queued", 0);
    }

    this.processQueue();
  }

  // Uninstall packages silently
  public async uninstall(
    wingetIds: string[],
    eventSender: WebContents,
  ): Promise<void> {
    this.eventSender = eventSender;

    for (const wingetId of wingetIds) {
      if (this.activeInstalls.has(wingetId)) {
        continue;
      }

      this.notifyStatus(wingetId, "uninstalling", 50); // Mark state as uninstalling
      this.notifyLog(
        wingetId,
        `[SYSTEM] Spawning Winget uninstaller for ${wingetId}...`,
      );
      this.notifyLog(
        wingetId,
        `[SYSTEM] Command: winget uninstall --id "${wingetId}" --silent --accept-source-agreements`,
      );

      const child = spawn("winget", [
        "uninstall",
        "--id",
        wingetId,
        "--silent",
        "--accept-source-agreements",
      ]);

      this.activeInstalls.set(wingetId, child);

      child.stdout.on("data", (data) => {
        const text = data.toString();
        const lines = text.split(/[\r\n]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            this.notifyLog(wingetId, trimmed);
          }
        }
        console.log(`[Uninstall CLI - ${wingetId}]:`, text);
      });
      child.stderr.on("data", (data) => {
        const text = data.toString();
        const lines = text.split(/[\r\n]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            this.notifyLog(wingetId, `[ERROR] ${trimmed}`);
          }
        }
        console.error(`[Uninstall CLI Error - ${wingetId}]:`, text);
      });

      child.on("close", (code) => {
        this.activeInstalls.delete(wingetId);
        if (code === 0) {
          console.log(`[Winget Service] Successfully uninstalled: ${wingetId}`);
          this.notifyLog(
            wingetId,
            `[SYSTEM] Process exited successfully (code 0).`,
          );
          this.notifyLog(
            wingetId,
            `[SYSTEM] ${wingetId} has been successfully uninstalled.`,
          );
          this.notifyStatus(wingetId, "uninstalled", 100);
        } else {
          console.error(
            `[Winget Service] Uninstall failed for ${wingetId} with exit code ${code}`,
          );
          this.notifyLog(
            wingetId,
            `[SYSTEM] Process exited with code ${code}.`,
          );
          this.notifyLog(wingetId, `[SYSTEM] Uninstall failed.`);
          this.notifyStatus(
            wingetId,
            "failed",
            0,
            `Uninstall failed (Exit Code: ${code})`,
          );
        }
      });
    }
  }

  // Cancel installations
  public async cancel(wingetIds: string[]): Promise<void> {
    for (const wingetId of wingetIds) {
      // 1. Remove from pending queue
      const qIndex = this.pendingQueue.indexOf(wingetId);
      if (qIndex !== -1) {
        this.pendingQueue.splice(qIndex, 1);
        this.notifyLog(
          wingetId,
          `[SYSTEM] Installation cancelled by user while in queue.`,
        );
        this.notifyStatus(wingetId, "failed", 0, "Cancelled by user");
      }

      // 2. Kill running process
      const child = this.activeInstalls.get(wingetId);
      if (child) {
        this.notifyLog(
          wingetId,
          `[SYSTEM] Installation cancelled by user. Terminating process...`,
        );
        child.kill(); // This will trigger the close listener and mark failed
        this.activeInstalls.delete(wingetId);
      }
    }
    this.processQueue();
  }

  // Process the installation queue based on concurrency limit
  private processQueue() {
    if (!this.eventSender) return;

    while (
      this.activeInstalls.size < this.parallelLimit &&
      this.pendingQueue.length > 0
    ) {
      const wingetId = this.pendingQueue.shift();
      if (!wingetId) break;

      this.spawnInstall(wingetId);
    }
  }

  // Spawn individual winget process
  private spawnInstall(wingetId: string) {
    if (!this.eventSender) return;

    this.notifyStatus(wingetId, "downloading", 0);
    this.notifyLog(
      wingetId,
      `[SYSTEM] Spawning Winget installer for ${wingetId}...`,
    );

    const args = [
      "install",
      "--id",
      wingetId,
      "--silent",
      "--accept-source-agreements",
      "--accept-package-agreements",
    ];

    if (this.installLocation && this.installLocation.trim()) {
      args.push("--location", this.installLocation.trim());
    }

    this.notifyLog(
      wingetId,
      `[SYSTEM] Command: winget ${args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`,
    );

    // Spawn winget process
    const child = spawn("winget", args);

    this.activeInstalls.set(wingetId, child);

    let stdoutBuffer = "";

    child.stdout.on("data", (data) => {
      const text = data.toString();
      stdoutBuffer += text;

      // Handle progress bars/updates that typically end with carriage return (\r)
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        this.notifyLog(wingetId, trimmed);

        // Parse Downloading state and progress
        if (trimmed.toLowerCase().includes("downloading")) {
          this.notifyStatus(wingetId, "downloading", 10);
        }

        // Try parsing download sizes (e.g. "1.2 MB / 5.4 MB")
        const sizeMatch = trimmed.match(
          /([\d.]+)\s*(KB|MB|GB)\s*\/\s*([\d.]+)\s*(KB|MB|GB)/i,
        );
        if (sizeMatch) {
          const current = parseFloat(sizeMatch[1]);
          const currentUnit = sizeMatch[2].toUpperCase();
          const total = parseFloat(sizeMatch[3]);
          const totalUnit = sizeMatch[4].toUpperCase();

          const toBytes = (val: number, unit: string) => {
            if (unit === "GB") return val * 1024 * 1024 * 1024;
            if (unit === "MB") return val * 1024 * 1024;
            return val * 1024;
          };

          const currentBytes = toBytes(current, currentUnit);
          const totalBytes = toBytes(total, totalUnit);
          const progress =
            totalBytes > 0 ? Math.round((currentBytes / totalBytes) * 100) : 10;

          this.notifyStatus(wingetId, "downloading", Math.min(progress, 99));
          continue;
        }

        // Try parsing percentage (e.g. "45%")
        const pctMatch = trimmed.match(/(\d+)%/);
        if (pctMatch) {
          const progress = parseInt(pctMatch[1]);
          this.notifyStatus(wingetId, "downloading", progress);
          continue;
        }

        // Parse Hash Verification
        if (trimmed.toLowerCase().includes("verified installer hash")) {
          this.notifyStatus(wingetId, "downloading", 100);
        }

        // Parse Installing state
        if (
          trimmed.toLowerCase().includes("installing") ||
          trimmed.toLowerCase().includes("starting package install")
        ) {
          this.notifyStatus(wingetId, "installing", 50);
        }
      }
    });

    child.stderr.on("data", (data) => {
      const text = data.toString();
      const lines = text.split(/[\r\n]+/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          this.notifyLog(wingetId, `[ERROR] ${trimmed}`);
        }
      }
      console.error(`[Winget CLI Error - ${wingetId}]:`, text);
    });

    child.on("close", (code) => {
      this.activeInstalls.delete(wingetId);

      const bufferLower = stdoutBuffer.toLowerCase();
      const successfullyInstalled =
        bufferLower.includes("successfully installed") ||
        bufferLower.includes("command completed successfully") ||
        code === 0;

      if (successfullyInstalled) {
        this.notifyLog(
          wingetId,
          `[SYSTEM] Process exited successfully (code 0).`,
        );
        this.notifyLog(
          wingetId,
          `[SYSTEM] ${wingetId} has been successfully installed.`,
        );
        this.notifyStatus(wingetId, "success", 100);
      } else {
        // Find error messages in the buffer
        let errorMsg = "Installation failed";
        if (bufferLower.includes("hash mismatch")) {
          errorMsg = "Installer hash mismatch";
        } else if (
          bufferLower.includes("requires administrator privileges") ||
          bufferLower.includes("admin")
        ) {
          errorMsg = "Requires administrator elevation";
        } else if (code !== null) {
          errorMsg = `Installation failed (Exit Code: ${code})`;
        }
        this.notifyLog(wingetId, `[SYSTEM] Process exited with code ${code}.`);
        this.notifyLog(wingetId, `[SYSTEM] Error: ${errorMsg}`);
        this.notifyStatus(wingetId, "failed", 0, errorMsg);
      }

      // Run next item in queue
      this.processQueue();
    });
  }

  // Emit status change event to React renderer via IPC
  private notifyStatus(
    wingetId: string,
    status: InstallStatus,
    progress: number,
    error?: string,
  ) {
    if (!this.eventSender) return;

    const payload: AppInstallStatus = {
      wingetId,
      status,
      progress,
      error,
    };

    console.log(
      `[WingetService Notification] ${wingetId} -> ${status} (${progress}%) ${error ? `Error: ${error}` : ""}`,
    );
    this.eventSender.send("winget:install-progress", payload);
  }

  // Emit log lines to React renderer via IPC
  private notifyLog(wingetId: string, line: string) {
    if (!this.eventSender) return;
    this.eventSender.send("winget:install-log", {
      wingetId,
      line,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
}
