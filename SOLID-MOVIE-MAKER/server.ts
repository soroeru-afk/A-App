import express from "express";
import path from "path";
import fs from "fs";
import { spawn, exec } from "child_process";
import { createServer as createViteServer } from "vite";

const POTPLAYER_PATHS = [
  "C:\\Program Files\\DAUM\\PotPlayer\\PotPlayer64.exe",
  "C:\\Program Files (x86)\\DAUM\\PotPlayer\\PotPlayer.exe",
  "C:\\Program Files\\PotPlayer\\PotPlayer64.exe",
  "C:\\Program Files (x86)\\PotPlayer\\PotPlayer.exe",
];

const KMPLAYER_PATHS = [
  "C:\\Program Files\\KMPlayer 64X\\KMPlayer64.exe",
  "C:\\Program Files\\KMPlayer\\KMPlayer.exe",
  "C:\\Program Files (x86)\\The KMPlayer\\KMPlayer.exe",
  "C:\\Program Files (x86)\\KMPlayer\\KMPlayer.exe",
  "C:\\KMPlayer\\KMPlayer.exe",
  "C:\\KMPlayer 64X\\KMPlayer64.exe",
];

function findExecutable(paths: string[]): string | null {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

const SUPPORTED_EXTENSIONS = new Set([
  ".mkv", ".mp4", ".avi", ".ts", ".m2ts", ".webm", ".wmv", ".mov", ".flv", ".vob", ".iso"
]);

function scanDirectoryRecursively(dir: string, baseDir: string, results: any[]) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDirectoryRecursively(fullPath, baseDir, results);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          let stat: fs.Stats | null = null;
          try {
            stat = fs.statSync(fullPath);
          } catch {
            // ignore
          }
          const rel = path.relative(baseDir, fullPath);
          const parts = rel.split(path.sep);
          const categoryName = parts.length > 1 ? parts[0] : path.basename(baseDir);
          const sizeMb = stat ? (stat.size / (1024 * 1024)).toFixed(1) + " MB" : undefined;
          
          results.push({
            id: "vid_" + Buffer.from(fullPath).toString("base64url").slice(0, 16),
            title: path.basename(entry.name, ext),
            categoryId: categoryName,
            localPath: fullPath,
            originalName: entry.name,
            createdAt: stat ? stat.mtimeMs : Date.now(),
            extension: ext.replace(".", "").toUpperCase(),
            fileSize: sizeMb,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error reading dir:", dir, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS for local communication
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // System player status endpoint
  app.get("/api/player-status", (req, res) => {
    const potplayer = findExecutable(POTPLAYER_PATHS);
    const kmplayer = findExecutable(KMPLAYER_PATHS);
    res.json({
      status: "online",
      platform: process.platform,
      potplayer: potplayer || null,
      kmplayer: kmplayer || null,
      hasPlayer: Boolean(potplayer || kmplayer || process.platform === "win32")
    });
  });

  // Scan folder endpoint
  app.post("/api/scan-folder", (req, res) => {
    const { folderPath } = req.body;
    if (!folderPath || typeof folderPath !== "string") {
      return res.status(400).json({ error: "Folder path is required" });
    }

    const cleanPath = path.normalize(folderPath.trim());
    if (!fs.existsSync(cleanPath)) {
      return res.status(404).json({ error: `Directory not found: ${cleanPath}` });
    }

    const videos: any[] = [];
    scanDirectoryRecursively(cleanPath, cleanPath, videos);

    // Group categories
    const categorySet = new Set<string>();
    videos.forEach(v => categorySet.add(v.categoryId));
    const categories = Array.from(categorySet).map(name => ({
      id: "cat_" + Buffer.from(name).toString("base64url").slice(0, 10),
      name,
    }));

    // Map video categoryId to matching category id
    const catMap = new Map(categories.map(c => [c.name, c.id]));
    videos.forEach(v => {
      v.categoryId = catMap.get(v.categoryId) || v.categoryId;
    });

    res.json({
      folder: cleanPath,
      count: videos.length,
      categories,
      videos,
    });
  });

  // Launch video in PotPlayer / KMPlayer / default player
  app.post("/api/play", (req, res) => {
    const { filePath, preferredPlayer } = req.body;
    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ error: "filePath is required" });
    }

    const cleanPath = path.normalize(filePath.trim());
    const potplayer = findExecutable(POTPLAYER_PATHS);
    const kmplayer = findExecutable(KMPLAYER_PATHS);

    let chosenPlayer: string | null = null;
    if (preferredPlayer === "potplayer" && potplayer) {
      chosenPlayer = potplayer;
    } else if (preferredPlayer === "kmplayer" && kmplayer) {
      chosenPlayer = kmplayer;
    } else {
      chosenPlayer = potplayer || kmplayer || null;
    }

    if (chosenPlayer) {
      const child = spawn(chosenPlayer, [cleanPath], {
        detached: true,
        stdio: "ignore",
      });
      child.unref();
      return res.json({
        status: "launched",
        player: path.basename(chosenPlayer),
        path: cleanPath,
      });
    }

    // Fallback: Windows default file association
    if (process.platform === "win32") {
      exec(`start "" "${cleanPath}"`, (error) => {
        if (error) {
          console.error("Failed to launch default player:", error);
          return res.status(500).json({ error: error.message });
        }
      });
      return res.json({
        status: "launched_default",
        player: "Windows Default Player",
        path: cleanPath,
      });
    }

    res.json({
      status: "fallback_needed",
      path: cleanPath,
      message: "No specific player found on host; use URL scheme or m3u launcher.",
    });
  });

  // Open enclosing folder in Windows Explorer
  app.post("/api/open-folder", (req, res) => {
    const { filePath } = req.body;
    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ error: "filePath is required" });
    }
    const cleanPath = path.normalize(filePath.trim());
    if (process.platform === "win32") {
      exec(`explorer /select,"${cleanPath}"`);
    } else {
      const dir = path.dirname(cleanPath);
      exec(`open "${dir}"`);
    }
    res.json({ status: "opened", path: cleanPath });
  });

  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
    });
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

