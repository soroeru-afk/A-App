import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";

async function startServer() {
  const app = express();
  const PORT = 3009;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/select-folder", (req, res) => {
    // PowerShell command to open FolderBrowserDialog modal to the active window (browser)
    const psCommand = `powershell -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.Description = '動画フォルダーを選択してください'; $w = New-Object System.Windows.Forms.NativeWindow; $owner = Get-Process | Where-Object { $_.MainWindowTitle -and $_.MainWindowHandle -ne [IntPtr]::Zero } | Sort-Object -Property LastProcessorTime -Descending | Select-Object -First 1; if ($owner) { $w.AssignHandle($owner.MainWindowHandle); }; if ($f.ShowDialog($w) -eq 'OK') { $f.SelectedPath }"`;
    
    exec(psCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Folder dialog error:", error);
        return res.status(500).json({ error: "Failed to open folder dialog" });
      }
      const folderPath = stdout.trim();
      if (!folderPath) {
        return res.status(400).json({ error: "Cancelled" });
      }
      res.json({ folderPath });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
