import {
  Audacity,
  Blender,
  BraveBrowser,
  Chrome,
  Cursor,
  Discord,
  Docker,
  EpicGames,
  Figma,
  FirefoxBrowser,
  Gimp,
  Git,
  GoogleAntigravity,
  I7zip,
  Instagram,
  Libreoffice,
  LmStudio,
  Nodejs,
  Notepadplusplus,
  Notion,
  Obsidian,
  Ollama,
  Opera,
  Postman,
  Powertoys,
  Python,
  Slack,
  Spotify,
  Steam,
  Telegram,
  VisualStudioCode,
  VlcMediaPlayer,
  Whatsapp,
  Zoom,
} from "@thesvg/react";
import React from "react";
import GithubDesktopIcon from "../../SVG/GithubDesktop";
import TermiusIcon from "../../SVG/Termius";
import UbisoftIcon from "../../SVG/Ubisoft";
import InkscapeIcon from "../../SVG/Inkscape";
import ObsStudioIcon from "../../SVG/ObsStudio";
import LightshotIcon from "../../SVG/Lightshot";
import EverythingIcon from "../../SVG/Everything";
import WinrarIcon from "../../SVG/Winrar";
import LucideIcon from "./lucide-icon";

interface SoftwareIconProps {
  appId: string;
  wingetId?: string;
  fallbackIcon?: string;
  size?: number;
  className?: string;
}

export const SoftwareIcon: React.FC<SoftwareIconProps> = ({
  appId,
  wingetId = "",
  fallbackIcon = "Package",
  size = 28,
  className = "",
}) => {
  const normId = appId.toLowerCase();
  const normWingetId = wingetId.toLowerCase();

  const [iconSource, setIconSource] = React.useState<'iconify' | 'simple-icons' | 'fallback'>('iconify');

  React.useEffect(() => {
    setIconSource('iconify');
  }, [wingetId]);

  const iconifySlug = React.useMemo(() => {
    if (!wingetId) return "";
    
    const parts = wingetId.split('.');
    const lastPart = parts[parts.length - 1];
    const cleanPart = lastPart.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const mappings: Record<string, string> = {
      "chrome": "chrome",
      "firefox": "firefox",
      "vscode": "visual-studio-code",
      "visualstudiocode": "visual-studio-code",
      "nodejs": "nodejs-icon",
      "node": "nodejs-icon",
      "py": "python",
      "python": "python",
      "7zip": "7zip",
      "sevenzip": "7zip",
      "epicgames": "epic-games",
      "githubdesktop": "github-icon",
      "github": "github-icon",
      "ubisoftconnect": "ubisoft",
      "whatsapp": "whatsapp",
      "telegramdesktop": "telegram",
      "telegram": "telegram",
      "termius": "termius",
      "notion": "notion-icon",
      "obsidian": "obsidian",
      "slack": "slack-icon",
      "spotify": "spotify-icon",
      "zoom": "zoom",
      "discord": "discord-icon",
      "steam": "steam",
      "instagram": "instagram",
      "brave": "brave"
    };

    if (mappings[cleanPart]) return mappings[cleanPart];
    
    // Fallback: convert camelCase/PascalCase to kebab-case
    return lastPart
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ""); // Keep hyphens for kebab case
  }, [wingetId]);

  const simpleIconsSlug = React.useMemo(() => {
    if (!wingetId) return "";
    
    const parts = wingetId.toLowerCase().split('.');
    const lastPart = parts[parts.length - 1];
    
    const mappings: Record<string, string> = {
      "chrome": "googlechrome",
      "firefox": "firefoxbrowser",
      "vscode": "visualstudiocode",
      "visualstudiocode": "visualstudiocode",
      "nodejs": "nodedotjs",
      "node": "nodedotjs",
      "py": "python",
      "7zip": "sevenzip",
      "sevenzip": "sevenzip",
      "epicgames": "epicgames",
      "githubdesktop": "github",
      "ubisoftconnect": "ubisoft",
      "whatsapp": "whatsapp",
      "telegramdesktop": "telegram",
      "termius": "termius",
      "notion": "notion",
      "obsidian": "obsidian",
      "slack": "slack",
      "spotify": "spotify",
      "zoom": "zoom",
      "discord": "discord",
      "steam": "steam",
      "instagram": "instagram",
      "brave": "brave"
    };

    if (mappings[lastPart]) return mappings[lastPart];
    return lastPart.replace(/[^a-z0-9]/g, "");
  }, [wingetId]);

  const isMatch = (id: string, wId: string) => {
    return normId === id.toLowerCase() || normWingetId === wId.toLowerCase();
  };

  if (isMatch("google-chrome", "Google.Chrome")) {
    return <Chrome width={size} height={size} className={className} />;
  }

  if (isMatch("mozilla-firefox", "Mozilla.Firefox")) {
    return <FirefoxBrowser width={size} height={size} className={className} />;
  }

  if (isMatch("brave-browser", "Brave.Brave")) {
    return <BraveBrowser width={size} height={size} className={className} />;
  }

  if (isMatch("opera", "Opera.Opera")) {
    return <Opera width={size} height={size} className={className} />;
  }

  if (isMatch("vscode", "Microsoft.VisualStudioCode")) {
    return (
      <VisualStudioCode width={size} height={size} className={className} />
    );
  }

  if (isMatch("git", "Git.Git")) {
    return <Git width={size} height={size} className={className} />;
  }

  if (isMatch("nodejs", "OpenJS.NodeJS")) {
    return <Nodejs width={size} height={size} className={className} />;
  }

  if (isMatch("python", "Python.Python.3")) {
    return <Python width={size} height={size} className={className} />;
  }

  if (isMatch("docker-desktop", "Docker.DockerDesktop")) {
    return <Docker width={size} height={size} className={className} />;
  }

  if (isMatch("notepad-plus-plus", "Notepad++.Notepad++")) {
    return <Notepadplusplus width={size} height={size} className={className} />;
  }

  if (isMatch("seven-zip", "7zip.7zip")) {
    return (
      <I7zip width={size} height={size} className={className} variant="mono" />
    );
  }

  if (isMatch("powertoys", "Microsoft.PowerToys")) {
    return <Powertoys width={size} height={size} className={className} />;
  }

  if (isMatch("discord", "Discord.Discord")) {
    return <Discord width={size} height={size} className={className} />;
  }

  if (isMatch("slack", "Slack.Slack") || normWingetId === "slacktechnologies.slack") {
    return <Slack width={size} height={size} className={className} />;
  }

  if (isMatch("zoom", "Zoom.Zoom")) {
    return <Zoom width={size} height={size} className={className} />;
  }

  if (isMatch("vlc", "VideoLAN.VLC")) {
    return <VlcMediaPlayer width={size} height={size} className={className} />;
  }

  if (isMatch("spotify", "Spotify.Spotify")) {
    return <Spotify width={size} height={size} className={className} />;
  }

  if (isMatch("obs-studio", "OBSProject.OBSStudio")) {
    return <ObsStudioIcon width={size} height={size} className={className} />;
  }

  if (isMatch("audacity", "Audacity.Audacity")) {
    return <Audacity width={size} height={size} className={className} />;
  }

  if (isMatch("steam", "Valve.Steam")) {
    return <Steam width={size} height={size} className={className} />;
  }

  if (isMatch("epic-games-launcher", "EpicGames.EpicGamesLauncher")) {
    return (
      <EpicGames
        width={size}
        height={size}
        className={className}
        variant="mono"
      />
    );
  }

  if (isMatch("antigravity", "Google.Antigravity")) {
    return (
      <GoogleAntigravity width={size} height={size} className={className} />
    );
  }

  if (isMatch("cursor", "Anysphere.Cursor")) {
    return (
      <Cursor width={size} height={size} className={className} variant="mono" />
    );
  }

  if (isMatch("figma", "Figma.Figma")) {
    return <Figma width={size} height={size} className={className} />;
  }

  if (isMatch("gimp", "GIMP.GIMP")) {
    return <Gimp width={size} height={size} className={className} />;
  }

  if (isMatch("inkscape", "Inkscape.Inkscape")) {
    return <InkscapeIcon width={size} height={size} className={className} />;
  }

  if (isMatch("blender", "Blender.Blender")) {
    return <Blender width={size} height={size} className={className} />;
  }

  if (isMatch("libreoffice", "LibreOffice.LibreOffice")) {
    return <Libreoffice width={size} height={size} className={className} />;
  }

  if (isMatch("obsidian", "Obsidian.Obsidian")) {
    return <Obsidian width={size} height={size} className={className} />;
  }

  if (isMatch("notion", "Notion.Notion") || normWingetId === "makenotion.notion") {
    return (
      <Notion width={size} height={size} className={className} variant="mono" />
    );
  }

  if (isMatch("ollama", "Ollama.Ollama")) {
    return <Ollama width={size} height={size} className={className} />;
  }

  if (isMatch("lmstudio", "LMStudio.LMStudio")) {
    return <LmStudio width={size} height={size} className={className} />;
  }

  if (isMatch("github-desktop", "GitHub.GitHubDesktop")) {
    return (
      <GithubDesktopIcon width={size} height={size} className={className} />
    );
  }

  if (isMatch("postman", "Postman.Postman")) {
    return <Postman width={size} height={size} className={className} />;
  }

  if (isMatch("whatsapp", "WhatsApp.WhatsApp")) {
    return <Whatsapp width={size} height={size} className={className} />;
  }

  if (isMatch("telegram", "Telegram.TelegramDesktop")) {
    return <Telegram width={size} height={size} className={className} />;
  }

  if (isMatch("instagram", "Facebook.Instagram") || normWingetId === "instagram.instagram" || normId.includes("instagram")) {
    return <Instagram width={size} height={size} className={className} />;
  }

  if (isMatch("termius", "Termius.Termius")) {
    return <TermiusIcon width={size} height={size} className={className} />;
  }

  if (isMatch("ubisoft-connect", "Ubisoft.Connect")) {
    return <UbisoftIcon width={size} height={size} className={className} />;
  }

  if (isMatch("lightshot", "Skillbrains.Lightshot")) {
    return <LightshotIcon width={size} height={size} className={className} />;
  }

  if (isMatch("everything", "voidtools.Everything")) {
    return <EverythingIcon width={size} height={size} className={className} />;
  }

  if (isMatch("winrar", "RARLab.WinRAR")) {
    return <WinrarIcon width={size} height={size} className={className} />;
  }

  if (iconifySlug && iconSource === 'iconify') {
    const iconUrl = `https://api.iconify.design/logos:${iconifySlug}.svg`;
    return (
      <img
        src={iconUrl}
        alt={appId}
        style={{ width: size, height: size }}
        className={`object-contain ${className}`}
        onError={() => setIconSource('simple-icons')}
      />
    );
  }

  if (simpleIconsSlug && iconSource === 'simple-icons') {
    const iconUrl = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${simpleIconsSlug}.svg`;
    return (
      <img
        src={iconUrl}
        alt={appId}
        style={{ width: size, height: size }}
        className={`brightness-0 invert opacity-80 object-contain ${className}`}
        onError={() => setIconSource('fallback')}
      />
    );
  }

  // Fallback to lucide-react icon
  return <LucideIcon name={fallbackIcon} size={size} className={className} />;
};

export default SoftwareIcon;
