import React, { useState, useRef } from 'react';
import { FolderSearch, Plus, Upload, FolderOpen, HardDrive, Check, AlertCircle } from 'lucide-react';
import { Category, VideoInfo, Language } from '../types';
import { t } from '../translations';

interface DataRegistrationProps {
  categories: Category[];
  onAddBatchVideos: (newCats: Category[], newVideos: VideoInfo[]) => void;
  onAddSingleVideo: (video: VideoInfo, categoryId: string) => void;
  lang: Language;
}

const cleanUnicode = (str: string) => {
  if (!str) return '';
  return str.replace(/[\u0080-\u009f\u200b-\u200d\ufeff]/g, '').trim();
};

export default function DataRegistration({
  categories,
  onAddBatchVideos,
  onAddSingleVideo,
  lang,
}: DataRegistrationProps) {
  const txt = t(lang).dataReg;
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'browser'>('scan');

  // Folder Scan Tab state
  const [folderPathInput, setFolderPathInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Manual Tab state
  const [manualTitle, setManualTitle] = useState('');
  const [manualPath, setManualPath] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [newCatNameInput, setNewCatNameInput] = useState('');

  // Browser folder picker ref
  const browserDirInputRef = useRef<HTMLInputElement>(null);
  const [browserBasePath, setBrowserBasePath] = useState('E:\\');

  const handleScanFolder = async () => {
    if (!folderPathInput.trim()) {
      setScanMessage({ text: 'フォルダパスを入力してください (例: E:\\Movies)', isError: true });
      return;
    }

    setIsScanning(true);
    setScanMessage(null);

    // 1. Try Node server API (/api/scan-folder)
    try {
      const res = await fetch('/api/scan-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: folderPathInput.trim() }),
        signal: AbortSignal.timeout(60000),
      });

      if (res.ok) {
        const data = await res.json();
        const scannedVideos: VideoInfo[] = data.videos || [];
        const scannedCats: Category[] = data.categories || [];

        if (scannedVideos.length === 0) {
          setScanMessage({ text: '指定されたフォルダに動画ファイルが見つかりませんでした。', isError: true });
        } else {
          onAddBatchVideos(scannedCats, scannedVideos);
          setScanMessage({
            text: `スキャン完了: ${scannedCats.length} カテゴリ、${scannedVideos.length} 本の映画を取り込みました。`,
          });
          setFolderPathInput('');
        }
        setIsScanning(false);
        return;
      }
    } catch {
      // ignore, fall through to python
    }

    // 2. Try Python/Node server API for native folder dialog (/select-folder)
    const selectEndpoints = [
      '/api/select-folder',
      '/select-folder',
      'http://127.0.0.1:3009/api/select-folder',
      'http://127.0.0.1:3009/select-folder',
      'http://localhost:3009/select-folder',
      'http://127.0.0.1:8000/select-folder',
    ];

    for (const ep of selectEndpoints) {
      try {
        const res = await fetch(ep, {
          signal: AbortSignal.timeout(60000),
          mode: 'cors',
        });
        if (res.ok) {
          const data = await res.json();
          const rawVideos = data.videos || [];
          const catMap = new Map<string, string>();
          const newCats: Category[] = [];

          rawVideos.forEach((v: any) => {
            if (!catMap.has(v.categoryId)) {
              const catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              catMap.set(v.categoryId, catId);
              newCats.push({ id: catId, name: v.categoryId });
            }
          });

          const formattedVideos: VideoInfo[] = rawVideos.map((v: any) => ({
            id: v.id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: v.title,
            categoryId: catMap.get(v.categoryId) || categories[0]?.id || 'cat_default',
            localPath: v.localPath,
            originalName: v.originalName,
            extension: v.extension,
            fileSize: v.fileSize,
            createdAt: v.createdAt || Date.now(),
          }));

          onAddBatchVideos(newCats, formattedVideos);
          setScanMessage({
            text: `スキャン完了: ${formattedVideos.length} 本の映画を取り込みました。`,
          });
          setIsScanning(false);
          return;
        }
      } catch {
        // try next
      }
    }

    setIsScanning(false);
    setScanMessage({
      text: 'ローカルサーバーに接続できませんでした。start_local_server.bat を実行するか、下の「ブラウザフォルダ選択」をご利用ください。',
      isError: true,
    });
  };

  // Manual Add submit
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPath.trim()) return;

    const pathClean = manualPath.trim();
    const fileName = pathClean.split(/[\\/]/).pop() || pathClean;
    const titleClean = manualTitle.trim() || fileName.replace(/\.[^/.]+$/, '');
    const ext = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : 'MKV';

    let catId = selectedCatId;
    if (newCatNameInput.trim()) {
      catId = `cat_${Date.now()}`;
    }

    const newVideo: VideoInfo = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: titleClean,
      categoryId: catId || categories[0]?.id || 'cat_default',
      localPath: pathClean,
      originalName: fileName,
      extension: ext,
      createdAt: Date.now(),
    };

    if (newCatNameInput.trim()) {
      onAddBatchVideos([{ id: catId, name: newCatNameInput.trim() }], [newVideo]);
      setNewCatNameInput('');
    } else {
      onAddSingleVideo(newVideo, catId);
    }

    setManualTitle('');
    setManualPath('');
    setScanMessage({ text: `「${titleClean}」を登録しました。` });
  };

  // Browser folder picker handler
  const handleBrowserFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files) as File[];
    const validExtensions = ['.mkv', '.mp4', '.m4v', '.mov', '.avi', '.ts', '.m2ts', '.webm', '.wmv', '.flv', '.3gp'];

    const newCats: Category[] = [];
    const newVideos: VideoInfo[] = [];
    const catByName = new Map<string, string>();
    categories.forEach(c => catByName.set(c.name, c.id));

    files.forEach(file => {
      const cleanFileName = cleanUnicode(file.name);
      const lowerName = cleanFileName.toLowerCase();
      const isVideo = validExtensions.some(ext => lowerName.endsWith(ext));
      if (!isVideo) return;

      const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name];
      const rawCatName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '未分類';
      const categoryName = cleanUnicode(rawCatName) || '未分類';

      let catId = catByName.get(categoryName);
      if (!catId) {
        catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        catByName.set(categoryName, catId);
        newCats.push({ id: catId, name: categoryName });
      }

      // Reconstruct local path with base path (Smart Deduplication of root folder)
      const baseClean = cleanUnicode(browserBasePath).replace(/[\\/]+$/, '');
      const baseLastDir = baseClean.split(/[\\/]/).pop()?.toLowerCase();

      let relativeWindowsPath = cleanUnicode(file.webkitRelativePath).replace(/\//g, '\\');
      const firstPart = relativeWindowsPath.split('\\')[0]?.toLowerCase();

      if (baseLastDir && firstPart && baseLastDir === firstPart) {
        relativeWindowsPath = relativeWindowsPath.substring(firstPart.length).replace(/^[\\/]+/, '');
      }

      const synthesizedLocalPath = relativeWindowsPath 
        ? `${baseClean}\\${relativeWindowsPath}`
        : `${baseClean}\\${cleanFileName}`;

      const ext = cleanFileName.split('.').pop()?.toUpperCase() || 'MKV';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      newVideos.push({
        id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        title: cleanFileName.replace(/\.[^/.]+$/, ''),
        categoryId: catId,
        localPath: synthesizedLocalPath,
        originalName: cleanFileName,
        extension: ext,
        fileSize: sizeMb,
        createdAt: file.lastModified || Date.now(),
        file,
      });
    });

    if (newVideos.length > 0) {
      onAddBatchVideos(newCats, newVideos);
      setScanMessage({
        text: `ブラウザ経由で ${newVideos.length} 本の映画を取り込みました（ベースパス: ${browserBasePath}）。`,
      });
    }

    if (browserDirInputRef.current) browserDirInputRef.current.value = '';
  };

  return (
    <section className="mb-4">
      <div className="text-[10px] text-text-dim mb-1.5 flex items-center gap-2">
        <span>02</span><span>{txt.title}</span>
      </div>

      <div className="border border-border-main bg-panel-bg p-3 flex flex-col gap-3">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-border-main pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeTab === 'scan'
                ? 'border-text-bright text-text-bright font-bold'
                : 'border-transparent text-text-dim hover:text-text-normal'
            }`}
          >
            <FolderSearch size={14} />
            <span>{txt.folderScan}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-text-bright text-text-bright font-bold'
                : 'border-transparent text-text-dim hover:text-text-normal'
            }`}
          >
            <Plus size={14} />
            <span>{txt.singleFile}</span>
          </button>

          <button
            onClick={() => setActiveTab('browser')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeTab === 'browser'
                ? 'border-text-bright text-text-bright font-bold'
                : 'border-transparent text-text-dim hover:text-text-normal'
            }`}
          >
            <FolderOpen size={14} />
            <span>{txt.browserFolder}</span>
          </button>
        </div>

        {/* Tab 1: Folder Auto Scan */}
        {activeTab === 'scan' && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2 items-stretch">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={folderPathInput}
                  onChange={(e) => setFolderPathInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanFolder()}
                  placeholder={txt.folderPathPlaceholder}
                  className="w-full bg-base-bg border border-border-main px-3 py-1.5 text-xs text-text-bright font-mono focus:border-text-dim"
                />
              </div>
              <button
                onClick={handleScanFolder}
                disabled={isScanning}
                className="px-4 py-1.5 bg-border-main hover:bg-border-light text-text-bright text-xs font-mono font-bold flex items-center justify-center gap-2 border border-border-light disabled:opacity-50"
              >
                <FolderSearch size={14} />
                <span>{isScanning ? txt.scanning : txt.startScan}</span>
              </button>
            </div>
            <div className="text-[10px] text-text-dim font-mono">
              ※ PC内の映画保存先（例: D:\Movies や E:\映画）を入力すると、各サブフォルダをジャンル/カテゴリとして一発自動登録します。
            </div>
          </div>
        )}

        {/* Tab 2: Manual Single Video Add */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-dim">{txt.targetCat}</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="p-1.5 bg-base-bg border border-border-main text-text-bright text-xs font-mono"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-dim">{txt.movieTitle}</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder={txt.movieTitlePlaceholder}
                className="p-1.5 bg-base-bg border border-border-main text-text-bright text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] text-text-dim">{txt.moviePath}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={manualPath}
                  onChange={(e) => setManualPath(e.target.value)}
                  placeholder={txt.moviePathPlaceholder}
                  className="flex-1 p-1.5 bg-base-bg border border-border-main text-text-bright text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-border-main hover:bg-border-light text-text-bright font-mono font-bold shrink-0 border border-border-light"
                >
                  {txt.addBtn}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Browser Folder Picker */}
        {activeTab === 'browser' && (
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 w-full flex flex-col gap-1">
                <label className="text-[10px] text-text-dim font-mono">
                  ローカル上のベースパス設定 (ブラウザセキュリティで隠蔽されるドライブパスを補完します):
                </label>
                <input
                  type="text"
                  value={browserBasePath}
                  onChange={(e) => setBrowserBasePath(e.target.value)}
                  className="p-1.5 bg-base-bg border border-border-main text-text-bright text-xs font-mono w-full"
                  placeholder="例: D:\Movies"
                />
              </div>

              <div className="shrink-0 self-end">
                <label className="px-4 py-2 bg-border-main hover:bg-border-light text-text-bright cursor-pointer font-mono font-bold flex items-center gap-2 border border-border-light">
                  <FolderOpen size={14} />
                  <span>フォルダを選択して一括取込</span>
                  <input
                    type="file"
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={handleBrowserFolderChange}
                    ref={browserDirInputRef}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Feedback notification message */}
        {scanMessage && (
          <div
            className={`p-2 text-xs font-mono flex items-center gap-2 border ${
              scanMessage.isError
                ? 'bg-red-950/40 border-red-800 text-red-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}
          >
            {scanMessage.isError ? <AlertCircle size={14} /> : <Check size={14} />}
            <span>{scanMessage.text}</span>
          </div>
        )}
      </div>
    </section>
  );
}
