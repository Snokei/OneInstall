import { app, BrowserWindow } from "electron";
import * as path from "path";
import { registerIpcHandlers } from "./ipc/ipcHandlers";
import { SettingsService } from "./services/settings.service";
import { WingetService } from "./services/winget.service";

let mainWindow: BrowserWindow | null = null;
let settingsService: SettingsService;
let wingetService: WingetService;

function createWindow() {
  const iconPath = path.join(
    __dirname,
    process.env.VITE_DEV_SERVER_URL
      ? "../public/favicon.ico"
      : "../dist/favicon.ico",
  );

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load the dev server URL.
  // In production, load the local index.html file.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  settingsService = new SettingsService();
  wingetService = new WingetService();

  // Load and apply initial parallel limit settings
  const settings = await settingsService.getSettings();
  wingetService.setParallelLimit(settings.parallelCount);
  wingetService.setInstallLocation(settings.installLocation || "");

  registerIpcHandlers(wingetService, settingsService);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
