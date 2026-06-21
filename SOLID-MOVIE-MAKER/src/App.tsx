import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SystemControl from './components/SystemControl';
import DataRegistration from './components/DataRegistration';
import VideoList from './components/VideoList';
import PlayerView from './components/PlayerView';
import { Category, VideoInfo, Theme, Language } from './types';
import { t } from './translations';

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

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('solid_categories');
    return saved ? JSON.parse(saved) : [{ id: 'cat_default', name: '未割り当て' }];
  });

  const [videos, setVideos] = useState<VideoInfo[]>(() => {
    const saved = localStorage.getItem('solid_videos');
    return saved ? JSON.parse(saved) : [];
  });

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('solid_sidebar_width');
    return saved ? parseInt(saved, 10) : 256;
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoInfo | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('solid_config_open');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('solid_config_open', isConfigOpen.toString());
  }, [isConfigOpen]);

  useEffect(() => {
    localStorage.setItem('knav_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('knav_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('solid_sidebar_width', sidebarWidth.toString());
  }, [sidebarWidth]);

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

  const handleAddVideo = (file: File, categoryId: string, localFolderPath: string) => {
    const url = URL.createObjectURL(file);
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    // Ensure category exists, else fallback to default or create one
    let finalCatId = categoryId;
    if (!categories.find(c => c.id === finalCatId)) {
        const newCat = { id: `cat_${Date.now()}`, name: 'New Folder' };
        setCategories(prev => [...prev, newCat]);
        finalCatId = newCat.id;
    }

    let localPath: string | undefined = undefined;
    if (localFolderPath) {
        const cleanBase = localFolderPath.replace(/[/\\]+$/, '');
        localPath = cleanBase + '\\' + file.name;
    }

    const newVideo: VideoInfo = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title,
        categoryId: finalCatId,
        url,
        originalName: file.name,
        createdAt: Date.now(),
        type: file.type,
        localPath
    };

    setVideos(prev => [...prev, newVideo]);
  };

  const handleAddDirectory = (files: FileList, localFolderPath: string) => {
    const newCats: Category[] = [];
    const newVideos: VideoInfo[] = [];

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('video/')) return;

        // Extract folder name from webkitRelativePath
        const pathParts = file.webkitRelativePath.split('/');
        // Usually: folderName/Subfolder/filename.mp4 
        // We take the top level folder, or just use "Imported" if none
        const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'インポート済';

        // Check if we already created a category for this in current batch
        let cat = newCats.find(c => c.name === folderName) || categories.find(c => c.name === folderName);
        if (!cat) {
            cat = { id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: folderName };
            newCats.push(cat);
        }

        const url = URL.createObjectURL(file);
        const title = file.name.replace(/\.[^/.]+$/, "");

        // Compute local absolute path if folder path is provided
        let localPath: string | undefined = undefined;
        if (localFolderPath) {
            const cleanBase = localFolderPath.replace(/[/\\]+$/, ''); // Strip trailing slashes
            const baseFolderName = cleanBase.split(/[/\\]/).pop();
            const relPathParts = file.webkitRelativePath.split('/');
            
            if (baseFolderName && relPathParts.length > 0 && baseFolderName.toLowerCase() === relPathParts[0].toLowerCase()) {
                // If the input path ends with the selected directory name, avoid duplicating the first level
                const subPath = relPathParts.slice(1).join('\\');
                localPath = cleanBase + (subPath ? '\\' + subPath : '');
            } else {
                const relativePath = relPathParts.join('\\');
                localPath = cleanBase + '\\' + relativePath;
            }
        }

        newVideos.push({
            id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title,
            categoryId: cat.id,
            url,
            originalName: file.name,
            createdAt: Date.now(),
            type: file.type,
            localPath
        });
    });

    if (newCats.length > 0) setCategories(prev => [...prev, ...newCats]);
    if (newVideos.length > 0) setVideos(prev => [...prev, ...newVideos]);
  };

  const handleDeleteVideo = (id: string) => {
    const v = videos.find(vid => vid.id === id);
    if (v && v.url.startsWith('blob:')) {
        URL.revokeObjectURL(v.url);
    }
    setVideos(prev => prev.filter(vid => vid.id !== id));
    if (playingVideo?.id === id) setPlayingVideo(null);
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, title: newTitle } : v));
  };

  const handleBulkDelete = (ids: string[]) => {
    const deletedVideos = videos.filter(v => ids.includes(v.id));
    deletedVideos.forEach(v => {
        if (v.url && v.url.startsWith('blob:')) {
            URL.revokeObjectURL(v.url);
        }
    });
    setVideos(prev => prev.filter(vid => !ids.includes(vid.id)));
    if (playingVideo && ids.includes(playingVideo.id)) setPlayingVideo(null);
  };

  const handleUpdateCategory = (id: string, newName: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteCategory = (id: string) => {
    // Collect videos that belong to this category to clean up blobs
    const categoryVideos = videos.filter(v => v.categoryId === id);
    categoryVideos.forEach(v => {
        if (v.url && v.url.startsWith('blob:')) {
            URL.revokeObjectURL(v.url);
        }
    });
    
    // Remove category and its videos
    setCategories(prev => prev.filter(c => c.id !== id));
    setVideos(prev => prev.filter(v => v.categoryId !== id));
    
    if (activeCategoryId === id) {
        setActiveCategoryId(null);
    }
  };

  const handleResetAllData = () => {
    if (window.confirm(t(lang).systemControl.resetConfirm)) {
        videos.forEach(v => {
            if (v.url && v.url.startsWith('blob:')) {
                URL.revokeObjectURL(v.url);
            }
        });
        setVideos([]);
        setCategories([{ id: 'cat_default', name: '未割り当て' }]);
        setActiveCategoryId(null);
        setPlayingVideo(null);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ categories, videos }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'solid_movie_maker_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (importedCategories: Category[], importedVideos: VideoInfo[]) => {
    if (!Array.isArray(importedCategories) || !Array.isArray(importedVideos)) {
        alert(lang === 'ja' ? '無効なデータ形式です。' : 'Invalid data format.');
        return;
    }
    
    const confirmMsg = lang === 'ja' 
      ? 'データを上書きインポートしますか？現行のリストとカテゴリはすべて上書きされます。' 
      : 'Are you sure you want to import and overwrite current data?';
      
    if (window.confirm(confirmMsg)) {
        videos.forEach(v => {
            if (v.url && v.url.startsWith('blob:')) {
                URL.revokeObjectURL(v.url);
            }
        });
        
        setCategories(importedCategories);
        setVideos(importedVideos);
        setActiveCategoryId(null);
        setPlayingVideo(null);
        
        alert(lang === 'ja' ? 'インポートが完了しました。' : 'Import completed.');
    }
  };

  const handleMoveVideo = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setVideos(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (index === -1) return prev;
      const next = [...prev];
      
      if (direction === 'up' && index > 0) {
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
      } else if (direction === 'down' && index < next.length - 1) {
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
      } else if (direction === 'top' && index > 0) {
        const [element] = next.splice(index, 1);
        next.unshift(element);
      } else if (direction === 'bottom' && index < next.length - 1) {
        const [element] = next.splice(index, 1);
        next.push(element);
      }
      return next;
    });
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      const next = [...prev];
      
      if (direction === 'up' && index > 0) {
        // Prevent moving default category down if it is at 0, or just regular swap
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
      } else if (direction === 'down' && index < next.length - 1) {
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
      }
      return next;
    });
  };

  // Filter videos based on selection
  const displayedVideos = activeCategoryId 
    ? videos.filter(v => v.categoryId === activeCategoryId)
    : videos;

  return (
    <div className="flex h-screen w-screen bg-base-bg text-text-normal overflow-hidden select-none" data-theme={theme}>
      
      <Sidebar 
        lang={lang}
        categories={categories}
        videos={videos}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        onAddCategory={handleAddCategory}
        onEditCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onMoveCategory={handleMoveCategory}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <SystemControl 
            theme={theme}
            onThemeChange={setTheme}
            lang={lang}
            onLangChange={setLang}
            onResetData={handleResetAllData}
            onExportData={handleExportData}
            onImportData={handleImportData}
        />

        <div className="flex justify-between items-center mb-3 shrink-0">
          <div className="text-[10px] text-text-dim tracking-wider font-mono">
            {isConfigOpen ? "▼ DATA REGISTRATION" : "▶ DATA REGISTRATION"}
          </div>
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-3 py-1 bg-panel-bg hover:bg-border-main text-text-bright text-[10px] font-bold border border-border-main transition-all cursor-pointer rounded-sm"
          >
            {isConfigOpen ? (lang === 'ja' ? 'データ取込を閉じる [-]' : 'Hide Import Panel [-]') : (lang === 'ja' ? 'データ取込を開く [+]' : 'Show Import Panel [+]')}
          </button>
        </div>

        {isConfigOpen && (
          <div className="mb-4 flex flex-col gap-4 border-b border-border-main pb-4 shrink-0 overflow-y-auto max-h-[40vh]">
            <DataRegistration 
                lang={lang}
                categories={categories}
                onAddVideo={handleAddVideo}
                onAddDirectory={handleAddDirectory}
            />
          </div>
        )}

        <VideoList 
            lang={lang}
            videos={displayedVideos}
            categories={categories}
            onDelete={handleDeleteVideo}
            onUpdateTitle={handleUpdateTitle}
            onBulkDelete={handleBulkDelete}
            onMoveVideo={handleMoveVideo}
        />
      </div>

      <PlayerView 
        lang={lang}
        video={playingVideo}
        onClose={() => setPlayingVideo(null)}
      />

    </div>
  );
}
