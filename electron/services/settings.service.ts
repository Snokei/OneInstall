import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import { UserSettings } from "../../src/types";

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: true,
  theme: "fluent-dark",
  parallelCount: 2,
  installLocation: "",
};

export class SettingsService {
  private filePath: string;
  private settings: UserSettings;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.filePath = path.join(userDataPath, "settings.json");
    this.settings = this.loadSettings();
  }

  private loadSettings(): UserSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public async getSettings(): Promise<UserSettings> {
    return this.settings;
  }

  public async saveSettings(newSettings: UserSettings): Promise<void> {
    try {
      this.settings = { ...newSettings };
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.settings, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  }
}
