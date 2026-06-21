import React from 'react';
import { Theme, Language } from '../types';
import { t } from '../translations';

interface SystemControlProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (categories: any[], videos: any[]) => void;
}

export default function SystemControl({ theme, onThemeChange, lang, onLangChange, onResetData, onExportData, onImportData }: SystemControlProps) {
  const txt = t(lang).systemControl;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onImportData(json.categories || [], json.videos || []);
        } catch (err) {
          alert(lang === 'ja' ? 'JSONファイルの読み込みに失敗しました。ファイルが破損している可能性があります。' : 'Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section className="mb-2">
      <div className="text-[10px] text-text-dim mb-2 flex items-center gap-2">
        <span>01</span><span>{txt.title}</span>
      </div>
      <div className="border border-border-main bg-panel-bg p-3 flex flex-wrap items-center gap-6 text-xs mb-3">
        <div className="flex items-center gap-2">
            <span className="text-text-normal">{txt.environment}</span>
        </div>
        
        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
            <div className="flex bg-base-bg p-0.5 border border-border-main rounded">
                <button
                    onClick={() => onLangChange('en')}
                    className={`px-3 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${
                        lang === 'en' ? 'bg-text-bright text-base-bg' : 'text-text-dim hover:text-text-normal'
                    }`}
                >
                    EN
                </button>
                <button
                    onClick={() => onLangChange('ja')}
                    className={`px-3 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${
                        lang === 'ja' ? 'bg-text-bright text-base-bg' : 'text-text-dim hover:text-text-normal'
                    }`}
                >
                    JP
                </button>
            </div>
            
            <div className="w-[1px] h-4 bg-border-main"></div>

            <div className="flex items-center gap-2">
                <span className="text-text-normal">{txt.theme}</span>
                <div className="flex gap-1">
                    {(['paperlight', 'onyxblack'] as Theme[]).map(thm => (
                        <button
                            key={thm}
                            onClick={() => onThemeChange(thm)}
                            className={`px-3 py-1 border text-[10px] ${
                                theme === thm 
                                ? 'bg-border-light text-text-bright border-border-light font-bold' 
                                : 'border-border-main text-text-normal hover:border-text-dim'
                            }`}
                        >
                            {thm === 'paperlight' ? txt.themePaper : txt.themeOnyx}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-[1px] h-4 bg-border-main"></div>

            <button
                onClick={onExportData}
                className="px-3 py-1 bg-border-main text-text-bright border border-border-main hover:bg-border-light text-[10px] font-bold transition-all cursor-pointer"
            >
                {txt.exportData}
            </button>

            <label className="px-3 py-1 bg-border-main text-text-bright border border-border-main hover:bg-border-light text-[10px] font-bold transition-all cursor-pointer">
                {txt.importData}
                <input 
                    type="file" 
                    accept=".json"
                    className="hidden" 
                    onChange={handleImportFileChange}
                    ref={fileInputRef}
                />
            </label>

            <button
                onClick={onResetData}
                className="px-3 py-1 bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/40 hover:text-red-300 text-[10px] font-bold transition-all"
            >
                {txt.resetData}
            </button>
        </div>
      </div>
    </section>
  );
}
