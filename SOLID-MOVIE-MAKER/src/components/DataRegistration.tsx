import React, { useRef } from 'react';
import { Upload, FolderPlus } from 'lucide-react';
import { Category, Language } from '../types';
import { t } from '../translations';

interface DataRegistrationProps {
  categories: Category[];
  onAddVideo: (videoFile: File, categoryId: string, localFolderPath: string) => void;
  onAddDirectory: (directoryFiles: FileList, localFolderPath: string) => void;
  lang: Language;
}

export default function DataRegistration({ categories, onAddVideo, onAddDirectory, lang }: DataRegistrationProps) {
  const txt = t(lang).dataReg;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const [selectedCatId, setSelectedCatId] = React.useState<string>(categories[0]?.id || '');
  const [localFolderPath, setLocalFolderPath] = React.useState<string>(() => {
    return localStorage.getItem('solid_last_folder_path') || '';
  });

  React.useEffect(() => {
    if (!selectedCatId && categories.length > 0) {
        setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  React.useEffect(() => {
    localStorage.setItem('solid_last_folder_path', localFolderPath);
  }, [localFolderPath]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onAddVideo(e.target.files[0], selectedCatId || `cat_${Date.now()}`, localFolderPath.trim());
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onAddDirectory(e.target.files, localFolderPath.trim());
        if (dirInputRef.current) dirInputRef.current.value = '';
    }
  };

  const handleBrowseFolder = async () => {
    try {
      const response = await fetch('/api/select-folder');
      if (response.ok) {
        const data = await response.json();
        if (data.folderPath) {
          setLocalFolderPath(data.folderPath);
        }
      }
    } catch (error) {
      console.error("Browse folder error:", error);
    }
  };

  return (
    <section className="">
      <div className="text-[10px] text-text-dim mb-2 flex items-center gap-2">
        <span>02</span><span>{txt.title}</span>
      </div>
      <div className="border border-border-main bg-panel-bg p-4 flex flex-col gap-4">
        
        <div className="flex gap-4 border-b border-border-main pb-2">
           <div className="flex items-center gap-1 text-text-bright font-bold text-xs pb-1 border-b-2 border-text-bright">
               <Upload size={14} /> {txt.singleFile}
           </div>
           <div className="flex items-center gap-1 text-text-dim font-bold text-xs cursor-pointer hover:text-text-normal relative">
               <input 
                   type="file" 
                   webkitdirectory="" 
                   directory="" 
                   multiple 
                   className="absolute inset-0 opacity-0 cursor-pointer"
                   onChange={handleDirChange}
                   ref={dirInputRef}
               />
               <FolderPlus size={14} /> {txt.folderImport}
           </div>
        </div>

        {/* Local Folder Path Input */}
        <div className="flex flex-col gap-1 border-b border-border-main/50 pb-3">
          <label className="text-[10px] text-text-dim font-bold">{txt.localFolderPath}</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-1.5 text-xs bg-base-bg border border-border-main text-text-bright font-mono"
              placeholder={txt.localFolderPlaceholder}
              value={localFolderPath}
              onChange={(e) => setLocalFolderPath(e.target.value)}
            />
            <button
              onClick={handleBrowseFolder}
              className="px-4 py-1.5 bg-border-main text-text-bright hover:bg-border-light text-xs transition-colors cursor-pointer border border-border-main font-bold shrink-0"
            >
              {txt.browse}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-dim">{txt.targetCat}</label>
                <select 
                    className="p-1.5 text-xs bg-base-bg border border-border-main text-text-bright w-full"
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                >
                    <option value="">{txt.newUnassigned}</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name === '未割り当て' ? t(lang).sidebar.uncategorized : c.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] text-text-dim">{txt.videoFile}</label>
                <div className="flex gap-2">
                    <label className="flex-1 flex text-xs bg-base-bg border border-border-main cursor-pointer relative overflow-hidden group">
                        <span className="px-3 py-1.5 bg-border-main text-text-bright group-hover:bg-border-light transition-colors relative z-10 pointer-events-none">
                            {txt.chooseFile}
                        </span>
                        <span className="px-3 py-1.5 text-text-dim flex-1 truncate pointer-events-none">
                            {txt.noFileChosen}
                        </span>
                        <input 
                            type="file" 
                            accept="video/mp4,video/x-matroska,video/webm,video/ogg"
                            className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer z-0 w-full h-full"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </label>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
