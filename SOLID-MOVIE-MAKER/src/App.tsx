import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SystemControl from './components/SystemControl';
import DataRegistration from './components/DataRegistration';
import VideoList from './components/VideoList';
import { Category, VideoInfo, Theme, Language, PreferredPlayer, ConnectionStatus } from './types';
import { t } from './translations';
import { checkServerStatus } from './utils/playerLauncher';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('knav_theme');
    if (saved === 'paperlight' || saved === 'onyxblack') return saved as Theme;
    return 'onyxblack';
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('knav_lang');
    if (saved === 'en' || saved === 'ja') return saved as Language;
    return 'ja';
  });

  const [preferredPlayer, setPreferredPlayer] = useState<PreferredPlayer>(() => {
    const saved = localStorage.getItem('knav_player');
    if (saved === 'potplayer' || saved === 'kmplayer' || saved === 'auto') return saved as PreferredPlayer;
    return 'auto';
  });

  // Font & List Size
  const [listSize, setListSize] = useState<number>(() => {
    const saved = localStorage.getItem('solid_list_size');
    return saved ? Math.max(11, Math.min(22, parseInt(saved, 10))) : 17;
  });

  const [titleSize, setTitleSize] = useState<number>(() => {
    const saved = localStorage.getItem('solid_title_size');
    return saved ? Math.max(12, Math.min(24, parseInt(saved, 10))) : 16;
  });

  // Resizable Sidebar width
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('solid_sidebar_width');
    return saved ? Math.max(180, Math.min(500, parseInt(saved, 10))) : 250;
  });

  useEffect(() => {
    localStorage.setItem('solid_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(500, startWidth + (moveEvent.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('solid_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'cat_sf', name: 'SF・サイバーパンク' },
      { id: 'cat_action', name: 'アクション・ミリタリー' },
      { id: 'cat_anime', name: 'アニメーション' },
      { id: 'cat_default', name: '未分類' },
    ];
  });

  const [videos, setVideos] = useState<VideoInfo[]>(() => {
    const saved = localStorage.getItem('solid_videos');
    if (saved) {
      try {
        const parsed: VideoInfo[] = JSON.parse(saved);
        return parsed.map((v, i) => ({
          ...v,
          order: v.order ?? i,
        }));
      } catch {
        return [];
      }
    }
    // Initial sample data if completely empty
    return [
      {
        id: 'vid_demo_1',
        title: '[映画] [HD] オッペンハイマー/Oppenheimer.2023.1080p.BluRay[日本語字幕]',
        categoryId: 'cat_sf',
        localPath: 'E:\\■HD映画\\オッペンハイマー\\Oppenheimer.2023.1080p.BluRay[日本語字幕].mkv',
        originalName: 'Oppenheimer.2023.1080p.BluRay[日本語字幕].mkv',
        extension: 'MKV',
        fileSize: '3481.1 MB',
        createdAt: 1725926400000,
        order: 0,
      },
      {
        id: 'vid_demo_2',
        title: '[映画] [HD] クワイエット・プレイス - DAY 1/A.Quiet.Place.Day.One.2024.1080p.WEBRip',
        categoryId: 'cat_sf',
        localPath: 'E:\\■HD映画\\クワイエット・プレイス\\A.Quiet.Place.Day.One.2024.1080p.WEBRip.mkv',
        originalName: 'A.Quiet.Place.Day.One.2024.1080p.WEBRip.mkv',
        extension: 'MKV',
        fileSize: '1873.8 MB',
        createdAt: 1724976000000,
        order: 1,
      },
      {
        id: 'vid_demo_3',
        title: '[映画] [HD] ゴジラ VS コング 新たなる帝国/Godzilla.X.Kong.The.New.Empire.2024',
        categoryId: 'cat_sf',
        localPath: 'E:\\■HD映画\\ゴジラ\\Godzilla.X.Kong.The.New.Empire.2024.REPACK.1080p.WEBRip.mkv',
        originalName: 'Godzilla.X.Kong.The.New.Empire.2024.mkv',
        extension: 'MKV',
        fileSize: '2283.1 MB',
        createdAt: 1724976000000,
        order: 2,
      },
      {
        id: 'vid_demo_4',
        title: '[映画] [HD] ゴーストバスターズ - アフターライフ/Ghostbusters.Afterlife.2021',
        categoryId: 'cat_sf',
        localPath: 'E:\\■HD映画\\ゴーストバスターズ\\Ghostbusters.Afterlife.2021.1080p.WEBRip.mkv',
        originalName: 'Ghostbusters.Afterlife.2021.1080p.WEBRip.mkv',
        extension: 'MKV',
        fileSize: '2345.3 MB',
        createdAt: 1641600000000,
        order: 3,
      },
    ];
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Connection & Player status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [detectedPlayers, setDetectedPlayers] = useState<{ potplayer?: boolean; kmplayer?: boolean }>({});

  // Toast Notification State (Rendered at bottom of Sidebar with ZERO layout shift)
  const [actionToast, setActionToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setActionToast({ message, isError });
    setTimeout(() => setActionToast(null), 3500);
  }, []);

  const refreshConnection = useCallback(async () => {
    const res = await checkServerStatus();
    setConnectionStatus(res.connected ? 'connected' : 'disconnected');
    setDetectedPlayers({
      potplayer: res.potplayerFound,
      kmplayer: res.kmplayerFound,
    });
  }, []);

  useEffect(() => {
    refreshConnection();
    const timer = setInterval(refreshConnection, 10000);
    return () => clearInterval(timer);
  }, [refreshConnection]);

  useEffect(() => {
    localStorage.setItem('knav_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('knav_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('knav_player', preferredPlayer);
  }, [preferredPlayer]);

  useEffect(() => {
    localStorage.setItem('solid_list_size', listSize.toString());
  }, [listSize]);

  useEffect(() => {
    localStorage.setItem('solid_title_size', titleSize.toString());
  }, [titleSize]);

  useEffect(() => {
    localStorage.setItem('solid_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('solid_videos', JSON.stringify(videos));
  }, [videos]);

  const handleAddCategory = () => {
    const name = prompt(t(lang).sidebar.newCategoryPrompt);
    if (name && name.trim()) {
      setCategories([...categories, { id: `cat_${Date.now()}`, name: name.trim() }]);
    }
  };

  const handleAddSingleVideo = (video: VideoInfo, categoryId: string) => {
    let finalCatId = categoryId;
    if (!categories.find((c) => c.id === finalCatId)) {
      const newCat = { id: `cat_${Date.now()}`, name: '未分類' };
      setCategories((prev) => [...prev, newCat]);
      finalCatId = newCat.id;
    }
    const maxOrder = videos.reduce((acc, v) => Math.max(acc, v.order ?? 0), 0);
    setVideos((prev) => [{ ...video, categoryId: finalCatId, order: maxOrder + 1 }, ...prev]);
  };

  const handleAddBatchVideos = (newCats: Category[], newVideos: VideoInfo[]) => {
    if (newCats.length > 0) {
      setCategories((prev) => {
        const existingNames = new Set(prev.map((c) => c.name));
        const filteredNew = newCats.filter((c) => !existingNames.has(c.name));
        return [...prev, ...filteredNew];
      });
    }

    if (newVideos.length > 0) {
      setVideos((prev) => {
        const existingPaths = new Set(prev.map((v) => v.localPath || v.originalName));
        const nonDuplicates = newVideos.filter(
          (v) => !existingPaths.has(v.localPath || v.originalName)
        );
        let startOrder = prev.reduce((acc, v) => Math.max(acc, v.order ?? 0), 0);
        const indexedNew = nonDuplicates.map((v) => ({
          ...v,
          order: ++startOrder,
        }));
        return [...prev, ...indexedNew];
      });
    }
  };

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((vid) => vid.id !== id));
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, title: newTitle } : v)));
  };

  const handleUpdatePath = (id: string, newPath: string) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, localPath: newPath } : v)));
  };

  const handleBatchReplacePath = (fromStr: string, toStr: string) => {
    if (!fromStr) return;
    setVideos((prev) =>
      prev.map((v) => {
        if (v.localPath && v.localPath.includes(fromStr)) {
          return { ...v, localPath: v.localPath.split(fromStr).join(toStr) };
        }
        return v;
      })
    );
  };

  const handleBulkDelete = (ids: string[]) => {
    setVideos((prev) => prev.filter((vid) => !ids.includes(vid.id)));
  };

  const handleUpdateCategory = (id: string, newName: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setVideos((prev) => prev.filter((v) => v.categoryId !== id));
    if (activeCategoryId === id) {
      setActiveCategoryId(null);
    }
  };

  // Move Category up / down
  const handleMoveCategoryUp = (id: string) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const handleMoveCategoryDown = (id: string) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  // Move Video top / up / down / bottom (Order management)
  const handleMoveTop = (id: string) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.unshift(moved);
      return copy.map((v, i) => ({ ...v, order: i }));
    });
  };

  const handleMoveUp = (id: string) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      // re-index order
      return copy.map((v, i) => ({ ...v, order: i }));
    });
  };

  const handleMoveDown = (id: string) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      // re-index order
      return copy.map((v, i) => ({ ...v, order: i }));
    });
  };

  const handleMoveBottom = (id: string) => {
    setVideos((prev) => {
      const idx = prev.findIndex((v) => v.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.push(moved);
      return copy.map((v, i) => ({ ...v, order: i }));
    });
  };

  // Instant category move for a video
  const handleMoveCategory = (videoId: string, targetCategoryId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, categoryId: targetCategoryId } : v))
    );
  };

  // Bulk category move for multiple selected videos
  const handleBulkMoveCategory = (videoIds: string[], targetCategoryId: string) => {
    setVideos((prev) =>
      prev.map((v) => (videoIds.includes(v.id) ? { ...v, categoryId: targetCategoryId } : v))
    );
  };

  // Clear all videos but keep categories
  const handleClearAllVideos = () => {
    setVideos([]);
    localStorage.removeItem('solid_videos');
  };

  // DB Export (JSON for PC1 & PC2 sync)
  const handleExportDb = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories,
      videos,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solid_movies_db_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // DB Import (JSON for PC1 & PC2 sync)
  const handleImportDb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.categories && Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
        }
        if (parsed.videos && Array.isArray(parsed.videos)) {
          setVideos(parsed.videos);
        }
        alert(`データベースを復元しました（カテゴリ: ${parsed.categories?.length || 0}件、映画: ${parsed.videos?.length || 0}件）`);
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Check file existence
  const handleCheckFilesExist = async () => {
    const paths = videos.map((v) => v.localPath || v.originalName);
    const endpoints = [
      '/api/check-files',
      '/check-files',
      'http://127.0.0.1:3009/api/check-files',
      'http://127.0.0.1:3009/check-files',
      'http://127.0.0.1:8000/check-files',
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths }),
          signal: AbortSignal.timeout(3000),
          mode: 'cors',
        });
        if (res.ok) {
          const data = await res.json();
          const results: Record<string, boolean> = data.results || {};
          setVideos((prev) =>
            prev.map((v) => {
              const p = v.localPath || v.originalName;
              return {
                ...v,
                exists: results[p] ?? true,
              };
            })
          );
          return;
        }
      } catch {}
    }
    // Fallback: mark all existing if cannot reach server
    setVideos((prev) => prev.map((v) => ({ ...v, exists: true })));
  };

  // Filter videos based on selection
  const displayedVideos = activeCategoryId
    ? videos.filter((v) => v.categoryId === activeCategoryId)
    : videos;

  return (
    <div
      className="flex h-screen w-screen bg-base-bg text-text-normal overflow-hidden select-none font-mono"
      data-theme={theme}
    >
      {/* Left Sidebar: Categories & Stats */}
      <Sidebar
        lang={lang}
        categories={categories}
        videos={videos}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        onAddCategory={handleAddCategory}
        onEditCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onMoveCategoryUp={handleMoveCategoryUp}
        onMoveCategoryDown={handleMoveCategoryDown}
        listSize={listSize}
        sidebarWidth={sidebarWidth}
        onResizeStart={handleResizeStart}
        actionToast={actionToast}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden min-w-0">
        {/* System Control & Player Selector */}
        <SystemControl
          theme={theme}
          onThemeChange={setTheme}
          lang={lang}
          onLangChange={setLang}
          preferredPlayer={preferredPlayer}
          onPlayerChange={setPreferredPlayer}
          connectionStatus={connectionStatus}
          detectedPlayers={detectedPlayers}
          onRefreshConnection={refreshConnection}
          listSize={listSize}
          onListSizeChange={setListSize}
          titleSize={titleSize}
          onTitleSizeChange={setTitleSize}
          onClearAllVideos={handleClearAllVideos}
          onExportDb={handleExportDb}
          onImportDb={handleImportDb}
        />

        {/* Ingestion & Folder Scan Section */}
        <DataRegistration
          lang={lang}
          categories={categories}
          onAddBatchVideos={handleAddBatchVideos}
          onAddSingleVideo={handleAddSingleVideo}
        />

        {/* Movie Database Table */}
        <VideoList
          lang={lang}
          videos={displayedVideos}
          categories={categories}
          preferredPlayer={preferredPlayer}
          onDelete={handleDeleteVideo}
          onUpdateTitle={handleUpdateTitle}
          onUpdatePath={handleUpdatePath}
          onBatchReplacePath={handleBatchReplacePath}
          onBulkDelete={handleBulkDelete}
          onMoveTop={handleMoveTop}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onMoveBottom={handleMoveBottom}
          onMoveCategory={handleMoveCategory}
          onBulkMoveCategory={handleBulkMoveCategory}
          onCheckFilesExist={handleCheckFilesExist}
          listSize={listSize}
          titleSize={titleSize}
          showToast={showToast}
        />
      </div>
    </div>
  );
}
