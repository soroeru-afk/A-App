import React from 'react';
import { Film, Settings, Maximize2 } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  sidebarPos: 'left' | 'right';
  onSidebarPosChange: (pos: 'left' | 'right') => void;
}

export default function Header({
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  sidebarPos,
  onSidebarPosChange
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between bg-panel-bg border-b border-border-main px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-text-bright text-panel-bg w-6 h-6 rotate-45 border border-border-main">
           <Film size={12} className="-rotate-45" />
        </div>
        <div>
            <h1 className="text-sm font-bold tracking-widest text-text-bright m-0 leading-none">SOLID MOVIE MAKER</h1>
            <p className="text-[9px] text-text-dim tracking-widest uppercase mt-0.5">Media playback engine</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Settings Dropdown (Simplified) */}
        <div className="group relative">
            <button className="flex items-center gap-1.5 text-xs text-text-normal hover:text-text-bright px-2 py-1 border border-transparent hover:border-border-main">
                <Settings size={14} />
                <span>SETTINGS</span>
            </button>
            <div className="hidden group-hover:flex absolute right-0 top-full mt-1 bg-panel-bg border border-border-main p-3 flex-col gap-4 shadow-xl z-50 w-48">
                
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-text-dim">THEME</span>
                    <div className="flex gap-1">
                        {(['paperlight', 'onyxblack'] as Theme[]).map(t => (
                            <button
                                key={t}
                                onClick={() => onThemeChange(t)}
                                className={`flex-1 py-1 text-[10px] border ${theme === t ? 'bg-text-bright text-panel-bg border-text-bright' : 'border-border-main text-text-normal hover:bg-border-main'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-text-dim">SIDEBAR POS</span>
                    <div className="flex gap-1">
                        {(['left', 'right'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => onSidebarPosChange(p)}
                                className={`flex-1 py-1 text-[10px] border ${sidebarPos === p ? 'bg-text-bright text-panel-bg border-text-bright' : 'border-border-main text-text-normal hover:bg-border-main'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
      </div>
    </div>
  );
}
