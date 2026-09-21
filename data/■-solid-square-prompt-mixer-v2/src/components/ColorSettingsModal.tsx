import React, { useState } from 'react';
import { X, RotateCcw, Palette, Pin, Star, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Language, t } from '../i18n';
import { 
  ThemeName, 
  THEME_DEFAULT_COLORS, 
  COLOR_PALETTE_PRESETS, 
  getCustomThemeColors, 
  saveCustomThemeColors, 
  applyThemeColors 
} from '../utils/themeColors';

interface ColorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeName;
  lang: Language;
  onColorsUpdated?: () => void;
}

export const ColorSettingsModal: React.FC<ColorSettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  lang,
  onColorsUpdated
}) => {
  const [selectedThemeTab, setSelectedThemeTab] = useState<ThemeName>(currentTheme);
  const [colorsState, setColorsState] = useState<Record<ThemeName, { markColor?: string; toolbarIconColor?: string }>>(() => {
    return getCustomThemeColors();
  });
  const [customColorInput, setCustomColorInput] = useState<string>('#38BDF8');

  if (!isOpen) return null;

  const currentConfig = colorsState[selectedThemeTab] || {};
  const currentDefaults = THEME_DEFAULT_COLORS[selectedThemeTab] || THEME_DEFAULT_COLORS.dark;
  const activeColor = currentConfig.markColor || currentDefaults.markColor;

  const handleSelectColor = (color: string) => {
    const updated = {
      ...colorsState,
      [selectedThemeTab]: {
        ...colorsState[selectedThemeTab],
        markColor: color,
        toolbarIconColor: color
      }
    };
    setColorsState(updated);
    saveCustomThemeColors(updated);
    applyThemeColors(currentTheme);
    if (onColorsUpdated) onColorsUpdated();
  };

  const handleResetToDefault = () => {
    const updated = {
      ...colorsState,
      [selectedThemeTab]: {}
    };
    setColorsState(updated);
    saveCustomThemeColors(updated);
    applyThemeColors(currentTheme);
    if (onColorsUpdated) onColorsUpdated();
  };

  const handleResetAll = () => {
    const reset: Record<ThemeName, {}> = {
      light: {},
      dark: {},
      black: {},
      navy: {},
      mono: {}
    };
    setColorsState(reset);
    saveCustomThemeColors(reset);
    applyThemeColors(currentTheme);
    if (onColorsUpdated) onColorsUpdated();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-bg-panel border border-border-main w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-main bg-bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent-main" />
            <span className="text-xs font-mono font-bold text-text-main uppercase tracking-wider">
              {lang === 'en' ? 'Theme Icon & Mark Color Settings' : 'テーマ別 アイコン・マーク色設定'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-main p-1 hover:bg-bg-input transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Theme Selector Tabs */}
          <div>
            <label className="text-[11px] font-mono text-text-dim block mb-2 font-bold">
              {lang === 'en' ? 'TARGET THEME:' : '設定対象テーマ:'}
            </label>
            <div className="grid grid-cols-5 gap-1 bg-bg-base p-1 border border-border-main">
              {(['light', 'dark', 'black', 'navy', 'mono'] as ThemeName[]).map(themeName => {
                const isCurrent = themeName === selectedThemeTab;
                const isGlobalActive = themeName === currentTheme;
                return (
                  <button
                    key={themeName}
                    onClick={() => setSelectedThemeTab(themeName)}
                    className={`px-2 py-1.5 text-[10px] font-mono font-bold uppercase transition-colors relative flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'bg-bg-surface border border-border-hover text-text-main shadow-xs'
                        : 'text-text-dim hover:text-text-main hover:bg-bg-input'
                    }`}
                  >
                    <span>{THEME_DEFAULT_COLORS[themeName].label}</span>
                    {isGlobalActive && (
                      <span className="text-[8px] text-green-500 font-normal leading-none mt-0.5">
                        {lang === 'en' ? 'Active' : '現在'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="bg-bg-surface/50 border border-border-main p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-text-main flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" style={{ color: activeColor }} />
                <span>
                  {lang === 'en'
                    ? `Mark & Icon Color (${THEME_DEFAULT_COLORS[selectedThemeTab].label})`
                    : `マーク・アイコン色 (${THEME_DEFAULT_COLORS[selectedThemeTab].nameJa})`}
                </span>
              </span>

              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 bg-bg-input hover:bg-border-main border border-border-main text-text-dim hover:text-text-main transition-colors"
                title={lang === 'en' ? 'Reset to default theme color' : 'テーマ標準色に戻す'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'en' ? 'Reset to Default' : '標準色に戻す'}</span>
              </button>
            </div>

            {/* Preset Color Swatches */}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {COLOR_PALETTE_PRESETS.map(({ hex, label }) => {
                const isSelected = activeColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    onClick={() => handleSelectColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 border transition-transform relative ${
                      isSelected
                        ? 'border-white ring-2 ring-blue-500 scale-110 shadow-md'
                        : 'border-border-main hover:scale-105'
                    }`}
                    title={`${label} (${hex})`}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-black drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                    )}
                  </button>
                );
              })}

              {/* Custom Color Picker Input */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-border-main ml-1">
                <input
                  type="color"
                  value={activeColor.startsWith('#') ? activeColor : customColorInput}
                  onChange={(e) => {
                    setCustomColorInput(e.target.value);
                    handleSelectColor(e.target.value);
                  }}
                  className="w-7 h-7 p-0 bg-transparent border border-border-main cursor-pointer"
                  title={lang === 'en' ? 'Custom Color Picker' : 'カラーピッカーで指定'}
                />
                <span className="text-[10px] font-mono text-text-dim">
                  {activeColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-bg-base border border-border-main p-3 space-y-2">
            <span className="text-[10px] font-mono text-text-dim block uppercase font-bold">
              {lang === 'en' ? 'Live Preview:' : '表示プレビュー:'}
            </span>
            <div className="p-3 bg-bg-surface border border-border-main flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center" style={{ color: activeColor }}>
                  <Pin className="w-4 h-4 fill-current" />
                </span>
                <span className="inline-flex items-center" style={{ color: activeColor }}>
                  <Star className="w-4 h-4 fill-current" />
                </span>
                <span className="inline-flex items-center" style={{ color: activeColor }}>
                  <Check className="w-4 h-4" />
                </span>
                <span className="inline-flex items-center" style={{ color: activeColor }}>
                  <Sparkles className="w-4 h-4 fill-current" />
                </span>
                <span className="inline-flex items-center" style={{ color: activeColor }}>
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold text-text-main ml-2">
                  1girl, portrait, realistic lighting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-main bg-bg-surface shrink-0">
          <button
            onClick={handleResetAll}
            className="text-[10px] font-mono text-text-dim hover:text-red-400 hover:underline transition-colors"
          >
            {lang === 'en' ? 'Reset All Themes' : 'すべてのテーマを初期化'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-bg-input hover:bg-border-main border border-border-hover text-xs font-mono text-text-main transition-colors"
          >
            {lang === 'en' ? 'Close' : '閉じる'}
          </button>
        </div>

      </div>
    </div>
  );
};
