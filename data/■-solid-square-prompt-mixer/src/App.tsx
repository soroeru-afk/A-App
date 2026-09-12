import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MasterColumn } from './components/MasterColumn';
import { VariationColumn } from './components/VariationColumn';

import { PreviewColumn } from './components/PreviewColumn';
import { MemoColumn } from './components/MemoColumn';
import { SavePartModal } from './components/SavePartModal';
import { SaveMasterModal } from './components/SaveMasterModal';
import { SaveMixerModal } from './components/SaveMixerModal';
import { Toast } from './components/Toast';
import { initialData } from './data';
import { AppData, MasterPrompt, VariationPart } from './types';
import { Language, t, translations } from './i18n';
import { ArrowLeftRight, Undo2, Redo2, ChevronLeft, ChevronRight, Check, Maximize, Minimize, Layers, FileText, Bookmark, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import { getFileHandle, setFileHandle, clearFileHandle } from './idb';
import { calculateCursorPos } from './utils/cursorUtils';

const STORAGE_KEY = 'prompt_console_data';


const mergeMixerData = (parsed: any, isAutoLoad: boolean = false) => {
  const fileTime = parsed.exportDate ? new Date(parsed.exportDate).getTime() : 0;

  // Categories
  if (parsed.attributeMixerCategories) {
    const localUpdated = Number(localStorage.getItem('attribute_mixer_categories_updated_at') || 0);
    if (!isAutoLoad || localUpdated <= fileTime) {
      const incomingCats = typeof parsed.attributeMixerCategories === 'string' ? JSON.parse(parsed.attributeMixerCategories) : parsed.attributeMixerCategories;
      
      // Get existing
      const existingCatsStr = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
      let existingCats = [];
      if (existingCatsStr) {
        try { existingCats = JSON.parse(existingCatsStr); } catch(e) {}
      }
      
      // Merge
      const mergedCats = [...existingCats];
      const existingIds = new Set(existingCats.map((c: any) => c.id));
      for (const cat of incomingCats) {
        if (!existingIds.has(cat.id)) {
          mergedCats.push(cat);
          existingIds.add(cat.id);
        }
      }
      
      localStorage.setItem('attribute_mixer_categories_v2', JSON.stringify(mergedCats));
    }
  }
  
  // Presets
  if (parsed.attributeMixerPresets) {
    const localUpdated = Number(localStorage.getItem('attribute_mixer_presets_updated_at') || 0);
    if (!isAutoLoad || localUpdated <= fileTime) {
      const incomingPresets = typeof parsed.attributeMixerPresets === 'string' ? JSON.parse(parsed.attributeMixerPresets) : parsed.attributeMixerPresets;
      
      const existingPresetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
      let existingPresets: any = {};
      if (existingPresetsStr) {
        try { existingPresets = JSON.parse(existingPresetsStr); } catch(e) {}
      }
      
      const mergedPresets = { ...existingPresets };
      for (const catId in incomingPresets) {
        if (!mergedPresets[catId]) {
          mergedPresets[catId] = incomingPresets[catId];
        } else {
          const existingValues = new Set(mergedPresets[catId].map((i: any) => i.value));
          const newItems = incomingPresets[catId].filter((i: any) => !existingValues.has(i.value));
          mergedPresets[catId] = [...mergedPresets[catId], ...newItems];
        }
      }
      localStorage.setItem('attribute_mixer_custom_presets_v7', JSON.stringify(mergedPresets));
    }
  }

  // Combos
  if (parsed.attributeMixerCombos) {
    const localUpdated = Number(localStorage.getItem('attribute_mixer_combos_updated_at') || 0);
    if (!isAutoLoad || localUpdated <= fileTime) {
      const incomingCombos = typeof parsed.attributeMixerCombos === 'string' ? JSON.parse(parsed.attributeMixerCombos) : parsed.attributeMixerCombos;
      
      const existingCombosStr = localStorage.getItem('attribute_mixer_combinations_v1') || localStorage.getItem('attribute_mixer_combinations');
      let existingCombos = [];
      if (existingCombosStr) {
        try { existingCombos = JSON.parse(existingCombosStr); } catch(e) {}
      }
      
      const mergedCombos = [...existingCombos];
      const existingComboIds = new Set(existingCombos.map((c: any) => c.id));
      for (const combo of incomingCombos) {
        if (!existingComboIds.has(combo.id)) {
          mergedCombos.push(combo);
          existingComboIds.add(combo.id);
        }
      }
      localStorage.setItem('attribute_mixer_combinations_v1', JSON.stringify(mergedCombos));
    }
  }
  
  if (parsed.uiEditorTabs) {
    const incomingTabs = typeof parsed.uiEditorTabs === 'string' ? JSON.parse(parsed.uiEditorTabs) : parsed.uiEditorTabs;
    localStorage.setItem('ui_editor_tabs', JSON.stringify(incomingTabs));
  }
  if (parsed.variationSectionOrder) {
    const incomingOrder = typeof parsed.variationSectionOrder === 'string' ? JSON.parse(parsed.variationSectionOrder) : parsed.variationSectionOrder;
    localStorage.setItem('variation_section_order', JSON.stringify(incomingOrder));
  }
  window.dispatchEvent(new Event('attributeMixerDataImported'));
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('ui_lang') as Language) || 'ja';
  });
  const [theme, setTheme] = useState<'dark' | 'red' | 'light' | 'navy' | 'black' | 'mono'>(() => {
    return (localStorage.getItem('ui_theme') as any) || 'light';
  });
  const [paperMode, setPaperMode] = useState<boolean>(() => {
    return localStorage.getItem('ui_paper_mode') === 'true';
  });
  const [activeMasterTab, setActiveMasterTab] = useState<'master' | 'negative'>(() => {
    return (localStorage.getItem('ui_active_master_tab') as any) || 'master';
  });
  const [activeVariationTab, setActiveVariationTab] = useState<'parts' | 'mixer'>(() => {
    return (localStorage.getItem('ui_active_variation_tab') as any) || 'parts';
  });
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('prompt_console_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppData;
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return initialData;
  });

    const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const [autoOptimize, setAutoOptimize] = useState<boolean>(() => {
    const saved = localStorage.getItem('auto_optimize');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('auto_optimize', String(autoOptimize));
  }, [autoOptimize]);

  useEffect(() => {
    localStorage.setItem('ui_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ui_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ui_paper_mode', String(paperMode));
  }, [paperMode]);

  useEffect(() => {
    localStorage.setItem('ui_active_master_tab', activeMasterTab);
  }, [activeMasterTab]);
  useEffect(() => {
    localStorage.setItem('ui_active_variation_tab', activeVariationTab);
  }, [activeVariationTab]);

  const [savePartFromMasterData, setSavePartFromMasterData] = useState<{name?: string, content?: string, items?: {name: string, content: string}[]} | null>(null);
  const [saveMasterFromPartData, setSaveMasterFromPartData] = useState<{name?: string, content?: string, items?: {name: string, content: string}[]} | null>(null);
  const [saveMixerFromPartData, setSaveMixerFromPartData] = useState<{name?: string, content?: string, items?: {name: string, content: string}[]} | null>(null);
  const [toastMessage, setToastMessage] = useState<{msg: string, id: number} | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage({ msg, id: Date.now() });
  }, []);

  const [mixerCategories, setMixerCategories] = useState<{id: string, label: string}[]>([]);
  useEffect(() => {
        const loadCats = (isEvent = false) => {
      let finalCats = [
        { id: 'genderAndPeople', label: '性別と人数 (Gender & People)' },
        { id: 'race', label: '人種 (Race)' },
        { id: 'age', label: '年齢 (Age)' },
        { id: 'physique', label: '体型 (Physique)' },
        { id: 'pose', label: '体位・ポーズ (Pose)' },
        { id: 'characteristics', label: '特徴・個性 (Characteristics)' },
        { id: 'expression', label: '表情・気持ち (Expression)' },
        { id: 'clothing', label: '衣類・コスチューム (Clothing)' },
        { id: 'hair', label: 'ヘア・髪型 (Hair)' },
        { id: 'bodyHair', label: 'アンダーヘア・脇毛 (Body Hair)' },
        { id: 'accessories', label: 'アクセサリー (Accessories)' },
        { id: 'angle', label: 'アングル (Angle)' },
        { id: 'location', label: '場所・背景 (Location)' },
        { id: 'situation', label: 'シチュエーション・状況 (Situation)' },
        { id: 'freeText1', label: '自由・フリー設定 1 (Free Text 1)' },
        { id: 'freeText2', label: '自由・フリー設定 2 (Free Text 2)' },
        { id: 'partner', label: '男 (Partner)' },
        { id: 'weather', label: '天候 (Weather)' },
        { id: 'emptyLocation', label: '無人の場所 (Empty Location)' },
        { id: 'bodyWet', label: '濡れ表現 (Wet Body)' },
        { id: 'lighting', label: '光の表現 (Lighting)' },
        { id: 'lens', label: 'レンズ・フィルター (Lens/Filter)' },
        { id: 'background', label: '背景 (Background)' },
        { id: 'environment', label: '環境・照明 (Environment/Lighting)' },
        { id: 'artStyle', label: '画風・スタイル (Art Style)' },
        { id: 'camera', label: 'カメラ・アングル (Camera/Angle)' }
      ];
      
      const saved = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
        if (saved) {
          try { 
            const parsed = JSON.parse(saved); 
            if (Array.isArray(parsed)) {
              const existingIds = new Set(parsed.map((c: any) => c.id));
              const missingDefaults = finalCats.filter(c => !existingIds.has(c.id));
              finalCats = [...missingDefaults, ...parsed];
            }
          } catch(e) {}
        }
      
      setMixerCategories(finalCats);
    };
    loadCats();
    const handleCatsUpdate = () => loadCats(true);
    window.addEventListener('attributeMixerDataImported', handleCatsUpdate);
    window.addEventListener('mixer_presets_updated', handleCatsUpdate);
    window.addEventListener('mixer_categories_updated', handleCatsUpdate);
    return () => {
      window.removeEventListener('attributeMixerDataImported', handleCatsUpdate);
      window.removeEventListener('mixer_presets_updated', handleCatsUpdate);
      window.removeEventListener('mixer_categories_updated', handleCatsUpdate);
    }
  }, []);


  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      let color = '#0A0A0B';
      if (theme === 'light') color = '#f9fafb';
      else if (theme === 'black') color = '#000000';
      else if (theme === 'red') color = '#140505';
      else if (theme === 'navy') color = '#060913';
      else if (theme === 'mono') color = '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }, [theme]);

  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(() => {
    return localStorage.getItem('ui_selected_master_id');
  });
  const [selectedNegativeId, setSelectedNegativeId] = useState<string | null>(() => {
    return localStorage.getItem('ui_selected_negative_id');
  });
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<{id: string, name: string, pos: string, neg: string, isMemo?: boolean}[]>(() => {
    const saved = localStorage.getItem('ui_editor_tabs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let normalCount = 0;
          return parsed.map((t: any) => {
            if (t.isMemo) return { ...t, name: t.name || 'MEMO' };
            normalCount++;
            return { ...t, name: `TAB ${String(normalCount).padStart(2, '0')}` };
          });
        }
      } catch (e) {}
    }
    return [{
      id: 'tab-1',
      name: 'TAB 01',
      pos: localStorage.getItem('ui_editor_text') || '',
      neg: localStorage.getItem('ui_negative_editor_text') || ''
    }];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return localStorage.getItem('ui_active_tab_id') || 'tab-1';
  });

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const editorText = activeTab.pos;
  const negativeEditorText = activeTab.neg;

  useEffect(() => {
    localStorage.setItem('ui_editor_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('ui_active_tab_id', activeTabId);
  }, [activeTabId]);

  const setEditorText = useCallback((updater: string | ((prev: string) => string)) => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newVal = typeof updater === 'function' ? updater(t.pos) : updater;
        return { ...t, pos: newVal };
      }
      return t;
    }));
  }, [activeTabId]);

  const setNegativeEditorText = useCallback((updater: string | ((prev: string) => string)) => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newVal = typeof updater === 'function' ? updater(t.neg) : updater;
        return { ...t, neg: newVal };
      }
      return t;
    }));
  }, [activeTabId]);
  const [activeEditor, setActiveEditor] = useState<'positive' | 'negative' | 'find' | 'replace'>(() => {
    return (localStorage.getItem('ui_active_editor') as any) || 'positive';
  });
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findCursorPos, setFindCursorPos] = useState<number | null>(null);
  const [replaceCursorPos, setReplaceCursorPos] = useState<number | null>(null);
  const [findSelectionEnd, setFindSelectionEnd] = useState<number | null>(null);
  const [replaceSelectionEnd, setReplaceSelectionEnd] = useState<number | null>(null);

  useEffect(() => {
    if (selectedMasterId) localStorage.setItem('ui_selected_master_id', selectedMasterId);
    else localStorage.removeItem('ui_selected_master_id');
  }, [selectedMasterId]);

  useEffect(() => {
    if (selectedNegativeId) localStorage.setItem('ui_selected_negative_id', selectedNegativeId);
    else localStorage.removeItem('ui_selected_negative_id');
  }, [selectedNegativeId]);

  

  useEffect(() => {
    localStorage.setItem('ui_active_editor', activeEditor);
  }, [activeEditor]);
  const [positiveCursorPos, setPositiveCursorPos] = useState<number | null>(null);
  const [positiveSelectionEnd, setPositiveSelectionEnd] = useState<number | null>(null);
  const [negativeCursorPos, setNegativeCursorPos] = useState<number | null>(null);
  const [negativeSelectionEnd, setNegativeSelectionEnd] = useState<number | null>(null);

  // History State for Undo/Redo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<Record<string, {pos: string, neg: string}[]>>({});
  const indexRef = useRef<Record<string, number>>({});

  const getHistory = useCallback((tabId: string) => {
    if (!historyRef.current[tabId]) {
      const tab = tabs.find(t => t.id === tabId) || tabs[0];
      historyRef.current[tabId] = [{pos: tab?.pos || '', neg: tab?.neg || ''}];
      indexRef.current[tabId] = 0;
    }
    return {
      history: historyRef.current[tabId],
      index: indexRef.current[tabId]
    };
  }, [tabs]);

  const updateUndoState = useCallback(() => {
    const { index, history } = getHistory(activeTabId);
    setCanUndo(index > 0);
    setCanRedo(index < history.length - 1);
  }, [activeTabId, getHistory]);

  const saveHistoryState = useCallback((pos: string, neg: string) => {
    const { history, index } = getHistory(activeTabId);
    const current = history[index];
    
    if (current && current.pos === pos && current.neg === neg) {
      return;
    }
    
    const newHistory = history.slice(0, index + 1);
    newHistory.push({pos, neg});
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    indexRef.current[activeTabId] = newHistory.length - 1;
    historyRef.current[activeTabId] = newHistory;
    updateUndoState();
  }, [activeTabId, getHistory, updateUndoState]);

  const undo = useCallback(() => {
    const { index, history } = getHistory(activeTabId);
    if (index > 0) {
      const newIdx = index - 1;
      indexRef.current[activeTabId] = newIdx;
      const state = history[newIdx];
      
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) return { ...t, pos: state.pos, neg: state.neg };
        return t;
      }));
      updateUndoState();
    }
  }, [activeTabId, getHistory, updateUndoState]);

  const redo = useCallback(() => {
    const { index, history } = getHistory(activeTabId);
    if (index < history.length - 1) {
      const newIdx = index + 1;
      indexRef.current[activeTabId] = newIdx;
      const state = history[newIdx];
      
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) return { ...t, pos: state.pos, neg: state.neg };
        return t;
      }));
      updateUndoState();
    }
  }, [activeTabId, getHistory, updateUndoState]);
  
  // Tab Management
  const handleTabAdd = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    setTabs(prev => {
      const newTabs = [...prev, { id: newId, name: '', pos: '', neg: '' }];
      let normalCount = 0;
      return newTabs.map((t) => {
        if (t.isMemo) return t;
        normalCount++;
        return { ...t, name: `TAB ${String(normalCount).padStart(2, '0')}` };
      });
    });
    setActiveTabId(newId);
  }, []);

  const handleTabChange = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const handleTabClose = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length === 1) {
        const newId = `tab-${Date.now()}`;
        delete historyRef.current[prev[0].id];
        delete indexRef.current[prev[0].id];
        setActiveTabId(newId);
        return [{ id: newId, name: 'TAB 01', pos: '', neg: '' }];
      }
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      delete historyRef.current[id];
      delete indexRef.current[id];
      let normalCount = 0;
      return newTabs.map((t) => {
        if (t.isMemo) return t;
        normalCount++;
        return { ...t, name: `TAB ${String(normalCount).padStart(2, '0')}` };
      });
    });
  }, [activeTabId]);

  const handleTabsClear = useCallback(() => {
    setActivePartId(null);
    const newId = `tab-${Date.now()}`;
    setTabs([{ id: newId, name: 'TAB 01', pos: '', neg: '' }]);
    setActiveTabId(newId);
    historyRef.current = {};
    indexRef.current = {};
    updateUndoState();
  }, [updateUndoState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveHistoryState(editorText, negativeEditorText);
    }, 1000);
    return () => clearTimeout(timer);
  }, [editorText, negativeEditorText, saveHistoryState]);

  const selectedPartIds = useMemo(() => {
    const ids = new Set<string>();
    data.parts.forEach(p => {
      if (editorText.includes(p.content) || negativeEditorText.includes(p.content)) {
        ids.add(p.id);
      }
    });
    return ids;
  }, [data.parts, editorText, negativeEditorText]);

  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(() => {
    return (localStorage.getItem('sidebar_position') as 'left' | 'right') || 'left';
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return Math.max(340, Number(localStorage.getItem('sidebar_width')) || 420);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return localStorage.getItem('ui_is_sidebar_open') !== 'false';
  });
  const [sidebarTab, setSidebarTab] = useState<'parts' | 'master' | 'memo'>(() => {
    return (localStorage.getItem('ui_sidebar_tab') as 'parts' | 'master' | 'memo') || 'parts';
  });
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(() => {
    return localStorage.getItem('ui_is_data_management_open') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_position', sidebarPosition);
  }, [sidebarPosition]);

  useEffect(() => {
    localStorage.setItem('sidebar_width', String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('ui_is_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('ui_sidebar_tab', sidebarTab);
  }, [sidebarTab]);

  useEffect(() => {
    localStorage.setItem('ui_is_data_management_open', String(isDataManagementOpen));
  }, [isDataManagementOpen]);

  const [exportDirectoryName, setExportDirectoryName] = useState<string>('');
  const [iframeWarning, setIframeWarning] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const showSaveToast = useCallback((msg: string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setSaveSuccessMessage(msg);
    saveTimerRef.current = window.setTimeout(() => {
      setSaveSuccessMessage(null);
      saveTimerRef.current = null;
    }, 2000);
  }, []);
  useEffect(() => {
    getFileHandle('export_directory').then(async handle => {
      if (handle && handle.name) {
        setExportDirectoryName(handle.name);
      }
    });
  }, []);

  
  const loadLatestFileFromDir = async (dirHandle: any) => {
    try {
      let latestFile = null;
      let latestTime = 0;
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          const file = await entry.getFile();
          if (file.lastModified > latestTime) {
            latestTime = file.lastModified;
            latestFile = file;
          }
        }
      }
      if (latestFile) {
        const text = await latestFile.text();
        const parsed = JSON.parse(text);
        if (parsed.masters && parsed.parts) {
          setData(parsed);
          mergeMixerData(parsed, true);
          setSelectedMasterId(parsed.masters[0]?.id || null);
          setSaveSuccessMessage(`Resumed from ${latestFile.name}`);
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      } else {
        setSaveSuccessMessage('No JSON files found in directory');
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      }
    } catch (e) {
      console.error("Failed to load latest file", e);
    }
  };

  const handleResumeFromDir = async () => {
    if ('showDirectoryPicker' in window && window.self === window.top) {
      try {
        let dirHandle = await getFileHandle('export_directory');
        if (dirHandle) {
          const permission = await dirHandle.queryPermission({ mode: 'read' });
          if (permission !== 'granted') {
            const req = await dirHandle.requestPermission({ mode: 'read' });
            if (req !== 'granted') return;
          }
          await loadLatestFileFromDir(dirHandle);
        }
      } catch (err) {
        console.error('Resume API Error:', err);
      }
    }
  };

  const handleChangeExportDir = async () => {
    if ('showDirectoryPicker' in window && window.self === window.top) {
      try {
        const handle = await (window as any).showDirectoryPicker({
          id: 'prompt_mixer_export_dir',
          mode: 'readwrite'
        });
        if (handle) {
          await setFileHandle('export_directory', handle);
          setExportDirectoryName(handle.name);
          await loadLatestFileFromDir(handle);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Directory Picker API Error:', err);
        }
      }
    } else {
      setIframeWarning(true);
    }
  };

  const handleClearExportDir = async () => {
    await clearFileHandle('export_directory');
    setExportDirectoryName('');
  };


  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = sidebarPosition === 'left' 
        ? startWidth + delta 
        : startWidth - delta;
      setSidebarWidth(Math.max(340, Math.min(850, newWidth)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth, sidebarPosition]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const cleanString = (text: string) => {
    if (!autoOptimize || activeTab?.isMemo) return text;
    return text
      .split('\n')
      .map(line => {
        let cleanedLine = line
          .replace(/[\u3000]/g, ' ')
          .replace(/[ \t]+/g, ' ')
          .replace(/[ \t]+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/,[ \t]*,/g, ',')
          .replace(/,([^\s])/g, ', $1')
          .trim();
        if (cleanedLine.length > 0) {
          if (!/[。！？：…・、,」』】）]$/.test(cleanedLine)) {
            cleanedLine = cleanedLine.replace(/[\s,]*$/, ',');
          }
        }
        return cleanedLine;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^[\s,]+/g, '')
      .trim();
  };


  const handleCopyToParts = useCallback((newParts: VariationPart[], newCategories: { name: string, section: number }[]) => {
    let added = 0;
    let skipped = 0;
    
    // We can access 'data' directly to calculate skipped/added here before updating state
    const existingPartsSet = new Set(
      data.parts.map(p => `${p.section}-${p.category}-${p.name}-${p.content}`)
    );
    
    const uniqueNewParts = newParts.filter(p => {
      const key = `${p.section}-${p.category}-${p.name}-${p.content}`;
      if (existingPartsSet.has(key)) {
        skipped++;
        return false;
      }
      existingPartsSet.add(key);
      added++;
      return true;
    });

    setData(prev => {
      const existingCats = new Set((prev.customCategories || []).map(c => `${c.section}-${c.name}`));
      prev.parts.forEach(p => existingCats.add(`${p.section}-${p.category}`));
      
      const additionalCatsUnique: { name: string, section: number }[] = [];
      const tempSet = new Set(existingCats);
      for (const cat of newCategories) {
        if (!tempSet.has(`${cat.section}-${cat.name}`)) {
          tempSet.add(`${cat.section}-${cat.name}`);
          additionalCatsUnique.push({ name: cat.name, section: cat.section as 1 | 2 | 3 | 4 | 5 });
        }
      }

      if (uniqueNewParts.length === 0 && additionalCatsUnique.length === 0) return prev;

      return {
        ...prev,
        parts: [...uniqueNewParts, ...prev.parts],
        customCategories: [...(prev.customCategories || []), ...additionalCatsUnique]
      };
    });

    window.dispatchEvent(new CustomEvent('PARTS_COPIED', { detail: { added, skipped } }));
    showToast(lang === 'en' ? 'Copied to Parts' : 'パーツへコピーしました');
  }, [data.parts, data.customCategories, showToast, lang]);

  const handleMixAttributes = useCallback((posStr: string, negStr: string, targetToReplace?: string) => {
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
    };

    setEditorText(prev => {
      let result = prev || '';
      let replaced = false;
      
      if (targetToReplace) {
        const targetRegex = new RegExp(escapeRegExp(targetToReplace), 'gi');
        const originalResult = result;
        result = result.replace(targetRegex, posStr);
        if (result !== originalResult) {
          replaced = true;
        }
      } 
      
      if (!replaced && posStr) {
        const actualPos = positiveCursorPos === null ? result.length : positiveCursorPos;
        const endPos = positiveSelectionEnd === null ? actualPos : positiveSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);
        
        if (start !== end) {
          // If there is a selection, replace the selection
          const before = result.slice(0, start);
          const after = result.slice(end);
          const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
          const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
          const insertedStr = prefix + posStr + suffix;
          const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
          setPositiveCursorPos(finalPos);
          setPositiveSelectionEnd(finalPos);
          result = before + insertedStr + after;
        } else {
          // Otherwise, insert at cursor position
          const before = result.slice(0, start);
          const after = result.slice(start);
          const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
          const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
          const insertedStr = prefix + posStr + suffix;
          const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
          setPositiveCursorPos(finalPos);
          setPositiveSelectionEnd(finalPos);
          result = before + insertedStr + after;
        }
      }
      
      result = result.replace(/,\s*,/g, ',');
      result = result.replace(/^,\s*/, '');
      return result.trim();
    });

    setNegativeEditorText(prev => {
      let result = prev || '';
      let replaced = false;
      
      if (targetToReplace) {
        const targetRegex = new RegExp(escapeRegExp(targetToReplace), 'gi');
        if (result.match(targetRegex)) {
            result = result.replace(targetRegex, negStr);
            replaced = true;
        }
      }
      
      if (!replaced && negStr) {
        const actualPos = negativeCursorPos === null ? result.length : negativeCursorPos;
        const endPos = negativeSelectionEnd === null ? actualPos : negativeSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);

        if (start !== end) {
          const before = result.slice(0, start);
          const after = result.slice(end);
          const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
          const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
          const insertedStr = prefix + negStr + suffix;
          const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
          setNegativeCursorPos(finalPos);
          setNegativeSelectionEnd(finalPos);
          result = before + insertedStr + after;
        } else {
          const before = result.slice(0, start);
          const after = result.slice(start);
          const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
          const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
          const insertedStr = prefix + negStr + suffix;
          const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
          setNegativeCursorPos(finalPos);
          setNegativeSelectionEnd(finalPos);
          result = before + insertedStr + after;
        }
      }
      
      result = result.replace(/,\s*,/g, ',');
      result = result.replace(/^,\s*/, '');
      return result.trim();
    });
  }, [autoOptimize, positiveCursorPos, positiveSelectionEnd, negativeCursorPos, negativeSelectionEnd, setEditorText, setNegativeEditorText]);

  const handleInsertText = useCallback((text: string, forceNegative?: boolean) => {
    if (activeEditor === 'find') {
      setFindText(prev => {
        const safePrev = prev || '';
        const actualPos = findCursorPos === null ? safePrev.length : findCursorPos;
        const endPos = findSelectionEnd === null ? actualPos : findSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);
        const before = safePrev.slice(0, start);
        const after = safePrev.slice(end);
        const insertedStr = text;
        const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
        setFindCursorPos(finalPos);
        setFindSelectionEnd(finalPos);
        return before + insertedStr + after;
      });
      return;
    }

    if (activeEditor === 'replace') {
      setReplaceText(prev => {
        const safePrev = prev || '';
        const actualPos = replaceCursorPos === null ? safePrev.length : replaceCursorPos;
        const endPos = replaceSelectionEnd === null ? actualPos : replaceSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);
        const before = safePrev.slice(0, start);
        const after = safePrev.slice(end);
        const insertedStr = text;
        const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
        setReplaceCursorPos(finalPos);
        setReplaceSelectionEnd(finalPos);
        return before + insertedStr + after;
      });
      return;
    }

    const isNegative = forceNegative !== undefined ? forceNegative : activeEditor === 'negative';
    
    if (isNegative) {
      setNegativeEditorText(prev => {
        const safePrev = prev || '';
        const actualPos = negativeCursorPos === null ? safePrev.length : negativeCursorPos;
        const endPos = negativeSelectionEnd === null ? actualPos : negativeSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);
        const before = safePrev.slice(0, start);
        const after = safePrev.slice(end);
        const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
        const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
        const insertedStr = prefix + text + suffix;
        const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
        setNegativeCursorPos(finalPos);
        setNegativeSelectionEnd(finalPos);
        return cleaned;
      });
    } else {
      setEditorText(prev => {
        const safePrev = prev || '';
        const actualPos = positiveCursorPos === null ? safePrev.length : positiveCursorPos;
        const endPos = positiveSelectionEnd === null ? actualPos : positiveSelectionEnd;
        const start = Math.min(actualPos, endPos);
        const end = Math.max(actualPos, endPos);
        const before = safePrev.slice(0, start);
        const after = safePrev.slice(end);
        const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
        const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
        const insertedStr = prefix + text + suffix;
        const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
        setPositiveCursorPos(finalPos);
        setPositiveSelectionEnd(finalPos);
        return cleaned;
      });
    }
  }, [autoOptimize, positiveCursorPos, positiveSelectionEnd, negativeCursorPos, negativeSelectionEnd, findCursorPos, findSelectionEnd, replaceCursorPos, replaceSelectionEnd, activeEditor, setEditorText, setNegativeEditorText, setFindText, setReplaceText]);

  const handleTogglePart = (id: string) => {
    setActivePartId(id);
    const part = data.parts.find(p => p.id === id);
    if (!part) return;
    
    handleInsertText(part.content, part.isNegative);
  };

  
  const handleTogglePartNegative = (id: string) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) =>
        p.id === id ? { ...p, isNegative: !p.isNegative } : p
      ),
    }));
  };

  const handleTogglePin = (id: string) => {
    setData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) =>
        p.id === id ? { ...p, isPinned: !p.isPinned } : p
      ),
    }));
  };

  const handleUpdateMaster = (id: string, updates: Partial<MasterPrompt>) => {
    setData(prev => ({ ...prev, masters: prev.masters.map(m => m.id === id ? { ...m, ...updates } : m) }));
  };

  const handleDeleteMaster = (id: string) => {
    setData(prev => ({ ...prev, masters: prev.masters.filter(m => m.id !== id) }));
    if (selectedMasterId === id) setSelectedMasterId(null);
  };

  const handleDeleteBulkMaster = (ids: string[]) => {
    setData(prev => ({ ...prev, masters: prev.masters.filter(m => !ids.includes(m.id)) }));
    if (selectedMasterId && ids.includes(selectedMasterId)) setSelectedMasterId(null);
  };

    const handleDuplicateMaster = (id: string) => {
    setData(prev => {
      const original = prev.masters.find(m => m.id === id);
      if (!original) return prev;
      const copy = { ...original, id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: `${original.name} コピー` };
      return { ...prev, masters: [copy, ...prev.masters] };
    });
  };

  const handleDuplicateNegative = (id: string) => {
    setData(prev => {
      const original = (prev.negatives || []).find(m => m.id === id);
      if (!original) return prev;
      const copy = { ...original, id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: `${original.name} コピー` };
      return { ...prev, negatives: [copy, ...(prev.negatives || [])] };
    });
  };

  const handleDuplicatePart = (id: string) => {
    setData(prev => {
      const original = prev.parts.find(p => p.id === id);
      if (!original) return prev;
      const copy = { ...original, id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: `${original.name} コピー` };
      return { ...prev, parts: [copy, ...prev.parts] };
    });
  };

  const handleAddMaster = (name: string = 'NEW_MASTER', content: string = '', negativeContent?: string) => {
    const newMaster: MasterPrompt = { id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, content, negativeContent };
    setData(prev => ({ ...prev, masters: [newMaster, ...prev.masters] }));
    showSaveToast("セーブ完了！");
  };

  const handleUpdateNegative = (id: string, updates: Partial<MasterPrompt>) => {
    setData(prev => ({ ...prev, negatives: (prev.negatives || []).map(m => m.id === id ? { ...m, ...updates } : m) }));
  };

  const handleDeleteNegative = (id: string) => {
    setData(prev => ({ ...prev, negatives: (prev.negatives || []).filter(m => m.id !== id) }));
    if (selectedNegativeId === id) setSelectedNegativeId(null);
    setActivePartId(null);
  };

  const handleDeleteBulkNegative = (ids: string[]) => {
    setData(prev => ({ ...prev, negatives: (prev.negatives || []).filter(m => !ids.includes(m.id)) }));
    if (selectedNegativeId && ids.includes(selectedNegativeId)) setSelectedNegativeId(null);
  };

  const handleDeleteAllMaster = () => {
    setData(prev => ({ ...prev, masters: [] }));
    setSelectedMasterId(null);
  };

  const handleDeleteAllNegative = () => {
    setData(prev => ({ ...prev, negatives: [] }));
    setSelectedNegativeId(null);
  };

  const handleAddNegative = (name: string = 'NEW_NEGATIVE', content: string = '') => {
    const newNegative: MasterPrompt = { id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, content };
    setData(prev => ({ ...prev, negatives: [newNegative, ...(prev.negatives || [])] }));
    showSaveToast("セーブ完了！");
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Map<string, number>(); // category -> section
    data.parts.forEach(p => cats.set(p.category, p.section));
    if (data.customCategories) {
      data.customCategories.forEach(c => cats.set(c.name, c.section));
    }
    return Array.from(cats.entries());
  }, [data.parts, data.customCategories]);


  const handleCopyToMixer = (categoryId: string, title: string, content: string, items?: {name: string, content: string}[]) => {
    showToast(lang === 'en' ? 'Copied to Prompt Mixer' : 'プロンプトミキサーへコピーしました');
    const savedPresetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    
    let currentPresets: any = {};
    if (savedPresetsStr) {
      try {
        currentPresets = JSON.parse(savedPresetsStr);
      } catch(e) {}
    }
    
    if (!currentPresets[categoryId]) {
      currentPresets[categoryId] = [{ label: 'Select...', value: '' }];
    }
    
    let addedCount = 0;
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item.name && item.content) {
          // Check if it already exists
          const exists = currentPresets[categoryId].some((p: any) => p.label === item.name && p.value === item.content);
          if (!exists) {
            currentPresets[categoryId].push({ label: item.name, value: item.content });
            addedCount++;
          }
        }
      });
    } else if (title && content) {
      const exists = currentPresets[categoryId].some((p: any) => p.label === title && p.value === content);
      if (!exists) {
        currentPresets[categoryId].push({ label: title, value: content });
        addedCount++;
      }
    }
    
    localStorage.setItem('attribute_mixer_custom_presets_v7', JSON.stringify(currentPresets));
    window.dispatchEvent(new Event('mixer_presets_updated')); // Re-render AttributeMixer if it's listening
    setSaveMasterFromPartData(null); // Close modal
    
    if (addedCount > 0) {
      alert(lang === 'en' ? `${addedCount} items copied to Prompt Mixer` : `プロンプトミキサーに${addedCount}件コピーしました`);
    } else {
      alert(lang === 'en' ? `Items already exist in Prompt Mixer` : `すでにプロンプトミキサーに存在します`);
    }
  };

  const handleSaveAsMaster = (name: string, content: string, isNegative: boolean, negativeContent?: string, isUpdate?: boolean) => {
    showToast(lang === 'en' ? 'Copied to Master Prompts' : 'マスタープロンプトへコピーしました');
    if (isUpdate) {
      if (isNegative && selectedNegativeId) {
        handleUpdateNegative(selectedNegativeId, { name, content });
      } else if (!isNegative && selectedMasterId) {
        handleUpdateMaster(selectedMasterId, { name, content, negativeContent });
      } else {
        if (isNegative) handleAddNegative(name, content);
        else handleAddMaster(name, content, negativeContent);
      }
    } else {
      if (isNegative) {
        handleAddNegative(name, content);
      } else {
        handleAddMaster(name, content, negativeContent);
      }
    }
  };

  const handleReorderNegatives = (startIndex: number, endIndex: number) => {
    setData(prev => {
      const newNegatives = Array.from(prev.negatives || []);
      const [removed] = newNegatives.splice(startIndex, 1);
      newNegatives.splice(endIndex, 0, removed);
      return { ...prev, negatives: newNegatives };
    });
  };

  const moveItems = (list: any[], ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => {
    const selectedSet = new Set(ids);
    const selectedItems = list.filter(item => selectedSet.has(item.id));
    const unselectedItems = list.filter(item => !selectedSet.has(item.id));
    
    if (selectedItems.length === 0) return list;

    if (direction === 'top') {
      return [...selectedItems, ...unselectedItems];
    }
    if (direction === 'bottom') {
      return [...unselectedItems, ...selectedItems];
    }
    
    const newList = [...list];
    if (direction === 'up') {
      for (let i = 1; i < newList.length; i++) {
        if (selectedSet.has(newList[i].id) && !selectedSet.has(newList[i-1].id)) {
          const temp = newList[i-1];
          newList[i-1] = newList[i];
          newList[i] = temp;
        }
      }
    } else if (direction === 'down') {
      for (let i = newList.length - 2; i >= 0; i--) {
        if (selectedSet.has(newList[i].id) && !selectedSet.has(newList[i+1].id)) {
          const temp = newList[i+1];
          newList[i+1] = newList[i];
          newList[i] = temp;
        }
      }
    }
    return newList;
  };

  const handleMoveBulkMasters = (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => {
    setData(prev => ({
      ...prev,
      masters: moveItems(prev.masters, ids, direction)
    }));
  };

  const handleMoveBulkNegatives = (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => {
    setData(prev => ({
      ...prev,
      negatives: moveItems(prev.negatives || [], ids, direction)
    }));
  };

  const handleUpdatePart = (id: string, updates: Partial<VariationPart>) => {
    setData(prev => ({ ...prev, parts: prev.parts.map(p => p.id === id ? { ...p, ...updates } : p) }));
  };

  const handleDeletePart = (id: string) => {
    setData(prev => ({ ...prev, parts: prev.parts.filter(p => p.id !== id) }));
    if (activePartId === id) setActivePartId(null);
    if (selectedPartIds.has(id)) handleTogglePart(id);
  };

  const handleDeleteBulkParts = (ids: string[]) => {
    setData(prev => ({ ...prev, parts: prev.parts.filter(p => !ids.includes(p.id)) }));
    if (activePartId && ids.includes(activePartId)) setActivePartId(null);
  };

  const handleDeleteAllParts = () => {
    setData(prev => ({ ...prev, parts: [] }));
    setActivePartId(null);
  };

  const handleAddCategory = (section: number, name: string) => {
    setData(prev => ({
      ...prev,
      customCategories: [...(prev.customCategories || []), { name, section: section as 1 | 2 | 3 | 4 | 5 }]
    }));
  };

  const handleRenameCategory = (section: number, oldName: string, newName: string) => {
    setData(prev => {
      const newParts = prev.parts.map(p => 
        (p.section === section && p.category === oldName) ? { ...p, category: newName } : p
      );
      let newCustomCategories = prev.customCategories ? [...prev.customCategories] : [];
      const existingIdx = newCustomCategories.findIndex(c => c.section === section && c.name === oldName);
      if (existingIdx !== -1) {
        newCustomCategories[existingIdx] = { ...newCustomCategories[existingIdx], name: newName };
      } else {
        newCustomCategories.push({ name: newName, section: section as 1 | 2 | 3 | 4 | 5 });
      }
      return { ...prev, parts: newParts, customCategories: newCustomCategories };
    });
  };

  const handleDeleteCategory = (section: number, name: string) => {
    setData(prev => {
      const newParts = prev.parts.filter(p => !(p.section === section && p.category === name));
      const newCustomCategories = (prev.customCategories || []).filter(c => !(c.section === section && c.name === name));
      return { ...prev, parts: newParts, customCategories: newCustomCategories };
    });
  };

  const handleRenameSection = (section: number, newName: string) => {
    setData(prev => ({
      ...prev,
      customSectionNames: {
        ...(prev.customSectionNames || {}),
        [section]: newName
      }
    }));
  };

  const handleReorderCategory = (draggedSection: number, draggedCat: string, targetSection: number, targetCat?: string) => {
    if (draggedSection === targetSection && draggedCat === targetCat) return;

    setData(prev => {
      // Update section for all parts in the dragged category
      const newParts = prev.parts.map(p => 
        (p.section === draggedSection && p.category === draggedCat)
          ? { ...p, section: targetSection as 1 | 2 | 3 | 4 | 5 }
          : p
      );

      // Handle custom categories
      let allCustomCats = prev.customCategories ? [...prev.customCategories] : [];
      
      // Ensure dragged category exists in custom categories
      if (!allCustomCats.find(c => c.section === draggedSection && c.name === draggedCat)) {
        allCustomCats.push({ name: draggedCat, section: draggedSection as 1 | 2 | 3 | 4 | 5 });
      }

      // Update its section
      const catObj = allCustomCats.find(c => c.section === draggedSection && c.name === draggedCat);
      if (catObj) {
        catObj.section = targetSection as 1 | 2 | 3 | 4 | 5;
      }
      
      // Now handle ordering within the target section
      let targetSectionOrder = allCustomCats.filter(c => c.section === targetSection).map(c => c.name);
      
      // Add existing parts cats that might not be in customCategories
      const existingCats = Array.from(new Set(newParts.filter(p => p.section === targetSection).map(p => p.category)));
      for (const cat of existingCats) {
        if (!targetSectionOrder.includes(cat)) targetSectionOrder.push(cat);
      }

      const draggedIdx = targetSectionOrder.indexOf(draggedCat);
      if (draggedIdx !== -1) {
        targetSectionOrder.splice(draggedIdx, 1);
      }
      
      let targetIdx = targetSectionOrder.length;
      if (targetCat) {
         targetIdx = targetSectionOrder.indexOf(targetCat);
         if (targetIdx === -1) targetIdx = targetSectionOrder.length;
      }
      
      targetSectionOrder.splice(targetIdx, 0, draggedCat);
      
      const otherSections = allCustomCats.filter(c => c.section !== targetSection);
      const newCustomCategories = [
        ...otherSections,
        ...targetSectionOrder.map(name => ({ name, section: targetSection as 1 | 2 | 3 | 4 | 5 }))
      ];

      return { ...prev, parts: newParts, customCategories: newCustomCategories };
    });
  };



  const handleAddPart = (category: string, section: number, name: string = 'NEW_PART', content: string = '') => {
    const newPart: VariationPart = { id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, content, category, section: section as 1 | 2 | 3 | 4 | 5, isPinned: false };
    setData(prev => ({ ...prev, parts: [newPart, ...prev.parts] }));
    showSaveToast("セーブ完了！");
  };

  const handleReorderMasters = (startIndex: number, endIndex: number) => {
    setData(prev => {
      const newMasters = Array.from(prev.masters);
      const [removed] = newMasters.splice(startIndex, 1);
      newMasters.splice(endIndex, 0, removed);
      return { ...prev, masters: newMasters };
    });
  };

  const handleReorderParts = (draggedId: string, targetId: string) => {
    setData(prev => {
      const draggedIndex = prev.parts.findIndex(p => p.id === draggedId);
      const targetIndex = prev.parts.findIndex(p => p.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return prev;
      
      const newParts = Array.from(prev.parts);
      const [removed] = newParts.splice(draggedIndex, 1);
      newParts.splice(targetIndex, 0, removed);

      return { ...prev, parts: newParts };
    });
  };



  const handleExportOverall = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    // Sanitize data before export
    const cleanedData = {
      ...data,
      masters: data.masters.map(m => ({ ...m, content: cleanString(m.content) })),
      negatives: data.negatives?.map(n => ({ ...n, content: cleanString(n.content) })),
      parts: data.parts.map(p => ({ ...p, content: cleanString(p.content) }))
    };

    const presetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    const combosStr = localStorage.getItem('attribute_mixer_combinations_v1') || localStorage.getItem('attribute_mixer_combinations');
    const catsStr = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
    
    const exportData = {
      title: "Solid Square Prompt Mixer (Overall)",
      exportDate: formattedDate,
      ...cleanedData,
      attributeMixerPresets: presetsStr ? JSON.parse(presetsStr) : undefined,
      attributeMixerCombos: combosStr ? JSON.parse(combosStr) : undefined,
      attributeMixerCategories: catsStr ? JSON.parse(catsStr) : undefined,
      uiEditorTabs: localStorage.getItem('ui_editor_tabs') ? JSON.parse(localStorage.getItem('ui_editor_tabs')!) : undefined,
      variationSectionOrder: localStorage.getItem('variation_section_order') ? JSON.parse(localStorage.getItem('variation_section_order')!) : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const fallbackDownload = () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PM-全体バックアップ_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if ('showSaveFilePicker' in window && window.self === window.top) {
      try {
        let dirHandle = await getFileHandle('export_directory');
        let fileHandle = null;
        let hasDirPermission = false;
        
        if (dirHandle) {
          const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            hasDirPermission = true;
          } else {
            const request = await dirHandle.requestPermission({ mode: 'readwrite' });
            if (request === 'granted') {
              hasDirPermission = true;
            }
          }
        }
        
        if (hasDirPermission && dirHandle) {
           fileHandle = await dirHandle.getFileHandle(`PM-全体バックアップ_${dateStr}.json`, { create: true });
        } else {
           fileHandle = await (window as any).showSaveFilePicker({
             id: 'prompt_mixer_export',
             suggestedName: `PM-全体バックアップ_${dateStr}.json`,
             types: [{
               description: 'JSON Files',
               accept: { 'application/json': ['.json'] },
             }],
           });
        }
        
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage('全体エクスポート完了！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('File System API Error:', err);
          fallbackDownload();
          setSaveSuccessMessage('全体エクスポート完了！ (Downloaded)');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      }
    } else {
      fallbackDownload();
      setSaveSuccessMessage('全体エクスポート完了！ (Downloaded)');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleExportParts = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    
    const presetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    const combosStr = localStorage.getItem('attribute_mixer_combinations_v1') || localStorage.getItem('attribute_mixer_combinations');
    const catsStr = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
    
    const exportData = {
      title: "Solid Square Prompt Mixer (Parts Only)",
      exportDate: formattedDate,
      parts: data.parts.map(p => ({ ...p, content: cleanString(p.content) })),
      customCategories: data.customCategories,
      attributeMixerPresets: presetsStr ? JSON.parse(presetsStr) : undefined,
      attributeMixerCombos: combosStr ? JSON.parse(combosStr) : undefined,
      attributeMixerCategories: catsStr ? JSON.parse(catsStr) : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const fallbackDownload = () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PM-パーツ_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if ('showSaveFilePicker' in window && window.self === window.top) {
      try {
        let dirHandle = await getFileHandle('export_directory');
        let fileHandle = null;
        let hasDirPermission = false;
        
        if (dirHandle) {
          const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            hasDirPermission = true;
          } else {
            const request = await dirHandle.requestPermission({ mode: 'readwrite' });
            if (request === 'granted') {
              hasDirPermission = true;
            }
          }
        }
        
        if (hasDirPermission && dirHandle) {
           fileHandle = await dirHandle.getFileHandle(`PM-パーツ_${dateStr}.json`, { create: true });
        } else {
           fileHandle = await (window as any).showSaveFilePicker({
             id: 'prompt_mixer_export_parts',
             suggestedName: `PM-パーツ_${dateStr}.json`,
             types: [{
               description: 'JSON Files',
               accept: { 'application/json': ['.json'] },
             }],
           });
        }
        
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage('パーツエクスポート完了！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('File System API Error:', err);
          fallbackDownload();
          setSaveSuccessMessage('パーツエクスポート完了！ (Downloaded)');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      }
    } else {
      fallbackDownload();
      setSaveSuccessMessage('パーツエクスポート完了！ (Downloaded)');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleImportOverall = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.masters && parsed.parts) {
          setData(prev => {
            const hasExistingParts = prev.parts && prev.parts.length > 0;
            const hasExistingCategories = prev.customCategories && prev.customCategories.length > 0;
            const hasExistingSectionNames = prev.customSectionNames && Object.keys(prev.customSectionNames).length > 0;
            
            return {
              ...parsed,
              // パーツデータが既に存在する場合は上書きせず保護する
              parts: hasExistingParts ? prev.parts : parsed.parts,
              customCategories: hasExistingCategories ? prev.customCategories : (parsed.customCategories || []),
              customSectionNames: hasExistingSectionNames ? prev.customSectionNames : (parsed.customSectionNames || {}),
            };
          });
          
          // ミキサーのデータも、既存データがある場合は上書きせず保護する
          const existingCategories = localStorage.getItem('attribute_mixer_categories_v2');
          if ((!existingCategories || existingCategories === '[]') && parsed.attributeMixerCategories) {
            localStorage.setItem('attribute_mixer_categories_v2', typeof parsed.attributeMixerCategories === 'string' ? parsed.attributeMixerCategories : JSON.stringify(parsed.attributeMixerCategories));
          }
          
          const existingPresets = localStorage.getItem('attribute_mixer_custom_presets_v7');
          if ((!existingPresets || existingPresets === '[]') && parsed.attributeMixerPresets) {
            localStorage.setItem('attribute_mixer_custom_presets_v7', typeof parsed.attributeMixerPresets === 'string' ? parsed.attributeMixerPresets : JSON.stringify(parsed.attributeMixerPresets));
          }
          
          const existingCombos = localStorage.getItem('attribute_mixer_combinations_v1');
          if ((!existingCombos || existingCombos === '[]') && parsed.attributeMixerCombos) {
            localStorage.setItem('attribute_mixer_combinations_v1', typeof parsed.attributeMixerCombos === 'string' ? parsed.attributeMixerCombos : JSON.stringify(parsed.attributeMixerCombos));
          }
          
          window.dispatchEvent(new Event('attributeMixerDataImported'));
          setSelectedMasterId(parsed.masters[0]?.id || null);
          setSaveSuccessMessage(lang === 'en' ? 'Overall Import completed!' : '全体のインポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        } else {
          alert('Invalid JSON format for Overall Import.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportParts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.parts) {
          // PartsとAttributeMixerのみ上書き
          setData(prev => ({
            ...prev,
            parts: parsed.parts,
            customCategories: parsed.customCategories || []
          }));
          
          if (parsed.attributeMixerCategories) {
            localStorage.setItem('attribute_mixer_categories_v2', typeof parsed.attributeMixerCategories === 'string' ? parsed.attributeMixerCategories : JSON.stringify(parsed.attributeMixerCategories));
          }
          if (parsed.attributeMixerPresets) {
            localStorage.setItem('attribute_mixer_custom_presets_v7', typeof parsed.attributeMixerPresets === 'string' ? parsed.attributeMixerPresets : JSON.stringify(parsed.attributeMixerPresets));
          }
          if (parsed.attributeMixerCombos) {
            localStorage.setItem('attribute_mixer_combinations_v1', typeof parsed.attributeMixerCombos === 'string' ? parsed.attributeMixerCombos : JSON.stringify(parsed.attributeMixerCombos));
          }
          
          window.dispatchEvent(new Event('attributeMixerDataImported'));
          setSaveSuccessMessage(lang === 'en' ? 'Parts Import completed!' : 'パーツのインポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        } else {
          alert('Invalid JSON format for Parts Import.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };


  const handleSelectMasterId = (id: string | null, insert: boolean = true) => {
    if (id && insert) {
      const newMaster = data.masters.find(m => m.id === id);
      if (newMaster) {
        if (newMaster.negativeContent !== undefined) {
          setEditorText(prev => {
            const safePrev = prev || '';
            const actualPos = positiveCursorPos === null ? safePrev.length : positiveCursorPos;
            const endPos = positiveSelectionEnd === null ? actualPos : positiveSelectionEnd;
            const start = Math.min(actualPos, endPos);
            const end = Math.max(actualPos, endPos);
            const before = safePrev.slice(0, start);
            const after = safePrev.slice(end);
            const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
            const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
            const insertedStr = prefix + newMaster.content + suffix;
            const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
            setPositiveCursorPos(finalPos);
            setPositiveSelectionEnd(finalPos);
            return cleaned;
          });
          setNegativeEditorText(prev => {
            const safePrev = prev || '';
            const actualPos = negativeCursorPos === null ? safePrev.length : negativeCursorPos;
            const endPos = negativeSelectionEnd === null ? actualPos : negativeSelectionEnd;
            const start = Math.min(actualPos, endPos);
            const end = Math.max(actualPos, endPos);
            const before = safePrev.slice(0, start);
            const after = safePrev.slice(end);
            const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
            const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
            const insertedStr = prefix + newMaster.negativeContent! + suffix;
            const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
            setNegativeCursorPos(finalPos);
            setNegativeSelectionEnd(finalPos);
            return cleaned;
          });
        } else {
          setEditorText(prev => {
            const safePrev = prev || '';
            const actualPos = positiveCursorPos === null ? safePrev.length : positiveCursorPos;
            const endPos = positiveSelectionEnd === null ? actualPos : positiveSelectionEnd;
            const start = Math.min(actualPos, endPos);
            const end = Math.max(actualPos, endPos);
            const before = safePrev.slice(0, start);
            const after = safePrev.slice(end);
            const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
            const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
            const insertedStr = prefix + newMaster.content + suffix;
            const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
            setPositiveCursorPos(finalPos);
            setPositiveSelectionEnd(finalPos);
            return cleaned;
          });
        }
      }
    }
    setSelectedMasterId(id);
    setActivePartId(null);
  };

  const handleSelectNegativeId = (id: string | null, insert: boolean = true) => {
    if (id && insert) {
      const newNeg = data.negatives?.find(m => m.id === id);
      if (newNeg) {
        setNegativeEditorText(prev => {
          const safePrev = prev || '';
          const actualPos = negativeCursorPos === null ? safePrev.length : negativeCursorPos;
          const endPos = negativeSelectionEnd === null ? actualPos : negativeSelectionEnd;
          const start = Math.min(actualPos, endPos);
          const end = Math.max(actualPos, endPos);
          const before = safePrev.slice(0, start);
          const after = safePrev.slice(end);
          const prefix = autoOptimize && before.length > 0 && !before.match(/,\s*$/) && !before.endsWith('\n') ? ', ' : '';
          const suffix = autoOptimize && after.length > 0 && !after.match(/^\s*,/) && !after.startsWith('\n') ? ', ' : '';
          const insertedStr = prefix + newNeg.content + suffix;
          const cleaned = cleanString(before + insertedStr + after);
          const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
          const finalPos = calculateCursorPos(before, insertedStr, cleaned, isAtEnd);
          setNegativeCursorPos(finalPos);
          setNegativeSelectionEnd(finalPos);
          return cleaned;
        });
      }
    }
    setSelectedNegativeId(id);
    setActivePartId(null);
  };

  const handleSelectMemoId = (id: string | null, insert: boolean = true) => {
    setSelectedMemoId(id);
    if (insert && id) {
      const memo = data.memos?.find(m => m.id === id);
      if (memo) {
        if (editorText && editorText.trim().length > 0) {
          const newId = `tab-${Date.now()}`;
          setTabs(prev => {
            const newTabs = [...prev, { id: newId, name: `📝 ${memo.name}`, pos: memo.content, neg: '', isMemo: true }];
            let normalCount = 0;
            return newTabs.map((t) => {
              if (t.isMemo) return t;
              normalCount++;
              return { ...t, name: `TAB ${String(normalCount).padStart(2, '0')}` };
            });
          });
          setActiveTabId(newId);
        } else {
          setTabs(prev => prev.map(t => {
            if (t.id === activeTabId) return { ...t, name: `📝 ${memo.name}`, pos: memo.content, isMemo: true };
            return t;
          }));
        }
      }
    }
  };
  const handleAddMemo = (name: string) => {
    const newMemo = { id: `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, content: '' };
    setData(prev => ({ ...prev, memos: [newMemo, ...(prev.memos || [])] }));
  };
  
  const handleDuplicateMemo = (id: string) => {
    setData(prev => {
      const original = (prev.memos || []).find(m => m.id === id);
      if (!original) return prev;
      const copy = { ...original, id: `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: `${original.name} コピー` };
      return { ...prev, memos: [copy, ...(prev.memos || [])] };
    });
  };

  const handleUpdateMemo = (id: string, updates: Partial<MasterPrompt>) => {
    setData(prev => ({
      ...prev,
      memos: (prev.memos || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };
  const handleDeleteMemo = (id: string) => {
    setData(prev => ({ ...prev, memos: (prev.memos || []).filter(m => m.id !== id) }));
    if (selectedMemoId === id) setSelectedMemoId(null);
  };
  const handleDeleteBulkMemo = (ids: string[]) => {
    const idSet = new Set(ids);
    setData(prev => ({ ...prev, memos: (prev.memos || []).filter(m => !idSet.has(m.id)) }));
    if (selectedMemoId && idSet.has(selectedMemoId)) setSelectedMemoId(null);
  };
  const handleDeleteAllMemo = () => {
    setData(prev => ({ ...prev, memos: [] }));
    setSelectedMemoId(null);
  };
  const handleMoveBulkMemos = (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => {
    setData(prev => {
      const items = prev.memos || [];
      const idSet = new Set(ids);
      const selected = items.filter(m => idSet.has(m.id));
      const unselected = items.filter(m => !idSet.has(m.id));
      if (direction === 'top') {
        return { ...prev, memos: [...selected, ...unselected] };
      } else if (direction === 'bottom') {
        return { ...prev, memos: [...unselected, ...selected] };
      }
      return prev;
    });
  };
  const handleReorderMemos = (startIndex: number, endIndex: number) => {
    setData(prev => {
      const result = Array.from(prev.memos || []);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, memos: result };
    });
  };

  const appMinWidth = (isSidebarOpen ? sidebarWidth : 0) + 600;

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-bg-base transition-colors duration-300`} style={{ zoom: 1, minWidth: `${appMinWidth}px` }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border-main bg-bg-panel h-14 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-text-main rounded-full opacity-80"></div>
            <h1 className="font-mono font-bold text-lg tracking-widest text-text-main">{t('app_title', lang)}</h1>
          </div>
          <div className="h-4 w-px bg-border-main"></div>
          <span className="text-[10px] font-mono opacity-50 text-text-main">{t('local_system_ready', lang)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleFullscreen}
            className={`w-7 h-7 bg-bg-input border border-border-main rounded transition-colors flex items-center justify-center shrink-0 ${theme === 'mono' ? 'hover:bg-gray-500 hover:text-white text-text-main' : 'hover:bg-border-main text-text-main'}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setSidebarPosition(pos => pos === 'left' ? 'right' : 'left')}
            className={`h-7 px-2.5 bg-bg-input border border-border-main rounded transition-colors flex items-center gap-1.5 text-[10px] font-mono shrink-0 ${theme === 'mono' ? 'hover:bg-gray-500 hover:text-white text-text-main' : 'hover:bg-border-main text-text-main'}`}
            title={sidebarPosition === 'left' ? (lang === 'en' ? 'Move Sidebar to Right' : 'サイドバーを右側に配置') : (lang === 'en' ? 'Move Sidebar to Left' : 'サイドバーを左側に配置')}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="font-bold">
              {sidebarPosition === 'left' ? (lang === 'en' ? 'Sidebar: Left' : 'サイドバー: 左') : (lang === 'en' ? 'Sidebar: Right' : 'サイドバー: 右')}
            </span>
          </button>
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'black' : t === 'black' ? 'light' : t === 'light' ? 'mono' : t === 'mono' ? 'navy' : t === 'navy' ? 'dark' : 'light')}
            className={`h-7 w-[130px] bg-bg-input border border-border-main text-[10px] font-mono rounded transition-colors flex items-center justify-center shrink-0 ${theme === 'mono' ? 'hover:bg-gray-500 hover:text-white text-text-main' : 'hover:bg-border-main text-text-main'}`}
          >
            {t('theme', lang)}: {t(`theme_${theme}` as keyof typeof translations, lang)}
          </button>
          <button 
            onClick={() => setPaperMode(!paperMode)}
            className={`h-7 w-[120px] text-[10px] font-mono border rounded transition-colors flex items-center justify-center shrink-0 ${paperMode ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' : theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white border-border-main text-text-main' : 'bg-bg-input hover:bg-border-main border-border-main text-text-main'}`}
          >
            {t('paper_mode', lang)}: {paperMode ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => setLang(l => l === 'en' ? 'ja' : 'en')}
            className={`h-7 px-2.5 bg-bg-input text-[10px] font-mono border border-border-main rounded transition-colors flex items-center justify-center shrink-0 ${theme === 'mono' ? 'hover:bg-gray-500 hover:text-white text-text-main' : 'hover:bg-border-main text-text-main'}`}
          >
            {lang === 'en' ? 'JP' : 'EN'}
          </button>
        </div>
      </header>

      {/* Main Layout (2 Columns: Sidebar ⇄ Editor) */}
      <main className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {(() => {
          const sidebarContent = (
            <aside 
              style={{ width: sidebarWidth }} 
              className={`bg-bg-panel flex flex-col shrink-0 relative ${
                sidebarPosition === 'left' ? 'border-r border-border-main' : 'border-l border-border-main'
              }`}
            >
              {/* Resize handle */}
              <div 
                onMouseDown={startSidebarResize}
                className={`absolute top-0 w-1.5 h-full cursor-col-resize hover:bg-accent-main active:bg-accent-main transition-colors z-20 ${
                  sidebarPosition === 'left' ? 'right-0 -mr-[1px]' : 'left-0 -ml-[1px]'
                }`}
              />

              {/* Sidebar Header: Main Navigation Tabs */}
              <div className="p-2 bg-bg-panel border-b border-border-main shrink-0 overflow-x-auto">
                <div className="flex w-full bg-bg-base border border-border-main p-1 gap-1 text-[11px] font-mono uppercase tracking-wider rounded">
                  <button 
                    onClick={() => {
                      setSidebarTab('parts');
                      setActiveVariationTab('parts');
                    }}
                    className={`flex-1 py-1.5 px-2 border rounded font-bold transition-colors text-center flex items-center justify-center gap-1.5 ${
                      sidebarTab === 'parts' 
                        ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main shadow-sm') 
                        : 'border-transparent text-text-dim hover:text-text-main'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t('parts_settings', lang)}</span>
                  </button>
                  <button 
                    onClick={() => setSidebarTab('master')}
                    className={`flex-1 py-1.5 px-2 border rounded font-bold transition-colors text-center flex items-center justify-center gap-1.5 ${
                      sidebarTab === 'master' 
                        ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main shadow-sm') 
                        : 'border-transparent text-text-dim hover:text-text-main'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('prompt_settings', lang)}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSidebarTab('memo');
                    }}
                    className={`flex-1 py-1.5 px-2 border rounded font-bold transition-colors text-center flex items-center justify-center gap-1.5 ${
                      sidebarTab === 'memo' 
                        ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main shadow-sm') 
                        : 'border-transparent text-text-dim hover:text-text-main'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{t('prompt_memo', lang)}</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Body */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {sidebarTab === 'parts' && (
                  <VariationColumn
                    parts={data.parts}
                    customCategories={data.customCategories}
                    customSectionNames={data.customSectionNames}
                    onRenameSection={handleRenameSection}
                    onAddCategory={handleAddCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onReorderCategory={handleReorderCategory}
                    selectedIds={selectedPartIds}
                    onTogglePart={handleTogglePart}
                    onTogglePin={handleTogglePin}
                    onTogglePartNegative={handleTogglePartNegative}
                    onAdd={handleAddPart}
                    onUpdate={handleUpdatePart}
                    onDuplicate={handleDuplicatePart}
                    onDelete={handleDeletePart}
                    onDeleteBulk={handleDeleteBulkParts}
                    onDeleteAll={handleDeleteAllParts}
                    onReorder={handleReorderParts}
                    onCopyToMaster={(part) => setSaveMasterFromPartData({ name: part.name, content: part.content })}
                    onCopyToMixer={(part) => setSaveMixerFromPartData({ items: [{name: part.name, content: part.content}] })}
                    onCopyBulkToMaster={(items) => setSaveMasterFromPartData({ items: items.map(i => ({name: i.name, content: i.content})) })}
                    onCopyBulkToMixer={(items) => setSaveMixerFromPartData({ items: items.map(i => ({name: i.name, content: i.content})) })}
                    onMixAttributes={handleMixAttributes}
                    onInsertText={handleInsertText}
                    onCopyToParts={handleCopyToParts}
                    lang={lang}
                    theme={theme}
                    activeTab={activeVariationTab}
                    setActiveTab={setActiveVariationTab}
                  />
                )}

                {sidebarTab === 'master' && (
                  <MasterColumn
                    theme={theme}
                    masters={data.masters}
                    negatives={data.negatives}
                    selectedId={selectedMasterId}
                    selectedNegativeId={selectedNegativeId}
                    onSelect={handleSelectMasterId}
                    onSelectNegative={handleSelectNegativeId}
                    onAdd={handleAddMaster}
                    onAddNegative={handleAddNegative}
                    onUpdate={handleUpdateMaster}
                    onUpdateNegative={handleUpdateNegative}
                    onDuplicate={handleDuplicateMaster}
                    onDuplicateNegative={handleDuplicateNegative}
                    onDelete={handleDeleteMaster}
                    onDeleteNegative={handleDeleteNegative}
                    onDeleteBulk={handleDeleteBulkMaster}
                    onDeleteBulkNegative={handleDeleteBulkNegative}
                    onDeleteAll={handleDeleteAllMaster}
                    onDeleteAllNegative={handleDeleteAllNegative}
                    onMoveBulk={handleMoveBulkMasters}
                    onMoveBulkNegative={handleMoveBulkNegatives}
                    onReorder={handleReorderMasters}
                    onReorderNegative={handleReorderNegatives}
                    onCopyToPart={(master) => setSavePartFromMasterData({ name: master.name, content: master.content })}
                    onCopyBulkToPart={(masters) => setSavePartFromMasterData({ items: masters.map(m => ({ name: m.name, content: m.content })) })}
                    onCopyBulkToPartDirect={(masters, category, section) => {
                      masters.forEach(m => handleAddPart(category, section, m.name, m.content));
                    }}
                    uniqueCategories={uniqueCategories}
                    activeTab={activeMasterTab}
                    setActiveTab={setActiveMasterTab}
                    lang={lang}
                  />
                )}

                {sidebarTab === 'memo' && (
                  <MemoColumn
                    theme={theme}
                    masters={data.memos || []}
                    selectedId={selectedMemoId}
                    onSelect={handleSelectMemoId}
                    onAdd={handleAddMemo}
                    onUpdate={handleUpdateMemo}
                    onDuplicate={handleDuplicateMemo}
                    onDelete={handleDeleteMemo}
                    onDeleteBulk={handleDeleteBulkMemo}
                    onDeleteAll={handleDeleteAllMemo}
                    onMoveBulk={handleMoveBulkMemos}
                    onReorder={handleReorderMemos}
                    lang={lang}
                  />
                )}
              </div>

              {/* Sidebar Footer: Data Management & Export Directory (Drawer slides upward above fixed bottom bar) */}
              <div className="border-t border-border-main bg-bg-panel shrink-0 flex flex-col">
                {isDataManagementOpen && (
                  <div className="p-3 border-b border-border-main flex flex-col gap-2.5 bg-bg-panel max-h-[320px] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="bg-bg-input border border-border-main rounded p-2 flex flex-col">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-mono text-text-main font-bold tracking-widest">{t('drive_destination', lang)}</span>
                        <div className="flex space-x-1">
                          <button onClick={handleChangeExportDir} className="text-[10px] font-mono text-text-main font-bold hover:text-accent-main transition-colors">{t('change', lang)}</button>
                          {exportDirectoryName && (
                            <>
                              <button onClick={handleResumeFromDir} className="text-[10px] font-mono text-text-main font-bold hover:text-accent-main transition-colors">(RESUME)</button>
                              <button onClick={handleClearExportDir} className="text-[10px] font-mono text-text-main font-bold hover:text-accent-main transition-colors">(CLEAR)</button>
                            </>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={handleChangeExportDir}
                        className={`w-full text-center px-2 py-1.5 bg-bg-panel border border-border-main rounded text-[10px] font-mono truncate transition-colors ${theme === 'mono' ? 'hover:bg-gray-500 hover:text-white text-text-main' : 'hover:bg-border-main text-text-main'}`}
                      >
                        {exportDirectoryName || t('not_set', lang)}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-mono text-text-dim text-center">▼ {lang === 'en' ? 'Overall (Master, Memos, Parts)' : '全体 (マスター・メモ・パーツ全て)'} ▼</div>
                      <div className="flex gap-2">
                        <label className={`flex-1 flex items-center justify-center px-2 py-1.5 text-[10px] font-mono border rounded transition-colors cursor-pointer ${
                          theme === 'mono' 
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700' 
                            : theme === 'light'
                              ? 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-xs'
                              : 'bg-border-main hover:bg-border-hover text-text-main border-border-hover'
                        }`}>
                          {lang === 'en' ? 'Import (Overall)' : 'インポート (全体上書き)'}
                          <input type="file" accept=".json" className="hidden" onChange={handleImportOverall} />
                        </label>
                        <button 
                          onClick={handleExportOverall} 
                          className={`flex-1 flex items-center justify-center px-2 py-1.5 text-[10px] font-mono font-bold border rounded transition-all cursor-pointer ${
                            theme === 'mono' 
                              ? 'bg-neutral-600 hover:bg-neutral-500 text-white border-neutral-500' 
                              : theme === 'light'
                                ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600 shadow-xs'
                                : 'bg-accent-main border-accent-dim hover:opacity-80 text-white'
                          }`}
                        >
                          {lang === 'en' ? 'Export (Overall)' : 'エクスポート (全体)'}
                        </button>
                      </div>

                      <div className="text-[10px] font-mono text-text-dim text-center mt-1">▼ {lang === 'en' ? 'Parts & Mixer Only' : 'パーツ選択・ミキサーのみ'} ▼</div>
                      <div className="flex gap-2">
                        <label className={`flex-1 flex items-center justify-center px-2 py-1.5 text-[10px] font-mono border rounded transition-colors cursor-pointer ${
                          theme === 'mono' 
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700' 
                            : theme === 'light'
                              ? 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 shadow-xs'
                              : 'bg-border-main hover:bg-border-hover text-text-main border-border-hover'
                        }`}>
                          {lang === 'en' ? 'Import (Parts)' : 'インポート (パーツ)'}
                          <input type="file" accept=".json" className="hidden" onChange={handleImportParts} />
                        </label>
                        <button 
                          onClick={handleExportParts} 
                          className={`flex-1 flex items-center justify-center px-2 py-1.5 text-[10px] font-mono font-bold border rounded transition-all cursor-pointer ${
                            theme === 'mono' 
                              ? 'bg-neutral-600 hover:bg-neutral-500 text-white border-neutral-500' 
                              : theme === 'light'
                                ? 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500 shadow-xs'
                                : (theme === 'black' ? 'bg-accent-main border-accent-dim hover:opacity-80 text-white' : 'bg-teal-600 border-teal-500 hover:opacity-80 text-white')
                          }`}
                        >
                          {lang === 'en' ? 'Export (Parts)' : 'エクスポート (パーツ)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Always-fixed bottom bar so the toggle button never moves position */}
                <button 
                  onClick={() => setIsDataManagementOpen(!isDataManagementOpen)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] font-mono font-bold text-text-main hover:bg-border-main/50 transition-colors bg-bg-input/60 select-none cursor-pointer"
                  title={isDataManagementOpen ? (lang === 'en' ? 'Collapse Data Management' : 'データ管理を閉じる') : (lang === 'en' ? 'Expand Data Management' : 'データ管理を開く')}
                >
                  <span className="flex items-center gap-2 tracking-wide">
                    <HardDrive className="w-4 h-4 text-accent-main" />
                    <span>{lang === 'en' ? 'Data Management & Drive' : 'データ管理・ドライブ設定'}</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-dim">
                    <span>{isDataManagementOpen ? (lang === 'en' ? '[CLOSE]' : '[閉じる]') : (lang === 'en' ? '[OPEN]' : '[開く]')}</span>
                    {isDataManagementOpen ? <ChevronDown className="w-4 h-4 text-text-main" /> : <ChevronUp className="w-4 h-4 text-text-main" />}
                  </div>
                </button>
              </div>
            </aside>
          );

          const toggleButton = (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`self-center shrink-0 z-20 flex items-center justify-center w-5 h-24 bg-bg-panel hover:bg-bg-input text-text-main border border-border-main shadow-md transition-colors ${
                sidebarPosition === 'left' ? 'border-l-0 rounded-r-md' : 'border-r-0 rounded-l-md'
              }`}
              title={isSidebarOpen ? (lang === 'en' ? 'Collapse Sidebar' : 'サイドバーを閉じる') : (lang === 'en' ? 'Open Sidebar' : 'サイドバーを開く')}
            >
              {sidebarPosition === 'left' ? (
                isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          );

          const editorSection = (
            <section className="flex-1 flex flex-col bg-bg-base relative min-w-0" style={{ minWidth: '550px' }}>
              <PreviewColumn
                selectedMasterId={selectedMasterId}
                selectedMasterName={selectedMasterId ? data.masters.find(m => m.id === selectedMasterId)?.name : undefined}
                selectedNegativeId={selectedNegativeId}
                selectedNegativeName={selectedNegativeId ? data.negatives?.find(m => m.id === selectedNegativeId)?.name : undefined}
                selectedPartId={activePartId || undefined}
                selectedPartName={activePartId ? data.parts.find(p => p.id === activePartId)?.name : undefined}
                tabs={tabs}
                activeTabId={activeTabId}
                isMemoTab={activeTab.isMemo}
                onTabChange={handleTabChange}
                onTabAdd={handleTabAdd}
                onTabClose={handleTabClose}
                onTabsClear={handleTabsClear}
                editorText={editorText}
                setEditorText={setEditorText}
                negativeEditorText={negativeEditorText}
                setNegativeEditorText={setNegativeEditorText}
                activeEditor={activeEditor}
                setActiveEditor={setActiveEditor}
                findText={findText}
                setFindText={setFindText}
                replaceText={replaceText}
                setReplaceText={setReplaceText}
                findCursorPos={findCursorPos}
                setFindCursorPos={setFindCursorPos}
                findSelectionEnd={findSelectionEnd}
                setFindSelectionEnd={setFindSelectionEnd}
                replaceCursorPos={replaceCursorPos}
                setReplaceCursorPos={setReplaceCursorPos}
                replaceSelectionEnd={replaceSelectionEnd}
                setReplaceSelectionEnd={setReplaceSelectionEnd}
                positiveCursorPos={positiveCursorPos}
                negativeCursorPos={negativeCursorPos}
                positiveSelectionEnd={positiveSelectionEnd}
                negativeSelectionEnd={negativeSelectionEnd}
                setPositiveCursorPos={setPositiveCursorPos}
                setNegativeCursorPos={setNegativeCursorPos}
                setPositiveSelectionEnd={setPositiveSelectionEnd}
                setNegativeSelectionEnd={setNegativeSelectionEnd}
                onSaveAsMaster={handleSaveAsMaster}
                onSaveAsPart={(name, content, category, section, items, isUpdate) => {
                  if (items && items.length > 0) {
                    setData(prev => {
                      const newParts: VariationPart[] = items.map((item, i) => ({
                        id: `p_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                        name: item.name,
                        content: item.content,
                        category,
                        section: section as 1 | 2 | 3 | 4 | 5,
                        isPinned: false
                      }));
                      return { ...prev, parts: [...newParts, ...prev.parts] };
                    });
                  } else {
                    const selectedPartId = selectedPartIds.size === 1 ? Array.from<string>(selectedPartIds)[0] : null;
                    if (isUpdate && selectedPartId) {
                      handleUpdatePart(selectedPartId, { name, content, category, section: section as 1|2|3|4|5 });
                    } else {
                      handleAddPart(category, section, name, content);
                    }
                  }
                }}
                onSaveAsMemo={(name, content, isUpdate) => {
                  if (isUpdate && selectedMemoId) {
                    handleUpdateMemo(selectedMemoId, { name, content });
                  } else {
                    const newMemo = { id: `memo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, content };
                    setData(prev => ({ ...prev, memos: [newMemo, ...(prev.memos || [])] }));
                    setSelectedMemoId(newMemo.id);
                  }
                }}
                selectedMemoId={selectedMemoId}
                selectedMemoName={data.memos?.find(m => m.id === selectedMemoId)?.name || ''}
                uniqueCategories={uniqueCategories}
                activeMasterTab={activeMasterTab}
                lang={lang}
                paperMode={paperMode}
                theme={theme}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                autoOptimize={autoOptimize}
                onToggleAutoOptimize={() => setAutoOptimize(prev => !prev)}
              />
            </section>
          );

          return (
            <>
              {sidebarPosition === 'left' ? (
                <>
                  {isSidebarOpen && sidebarContent}
                  {toggleButton}
                  {editorSection}
                </>
              ) : (
                <>
                  {editorSection}
                  {toggleButton}
                  {isSidebarOpen && sidebarContent}
                </>
              )}
            </>
          );
        })()}

        {/* Modals */}
        <SavePartModal
          isOpen={savePartFromMasterData !== null}
          content={savePartFromMasterData?.content || ''}
          defaultName={savePartFromMasterData?.name || ''}
          items={savePartFromMasterData?.items}
          categories={uniqueCategories}
          onConfirm={(name, category, section, items) => {
            if (items && items.length > 0) {
              items.forEach(item => {
                handleAddPart(category, section, item.name, item.content);
              });
            } else {
              handleAddPart(category, section, name, savePartFromMasterData?.content || '');
            }
            setSavePartFromMasterData(null);
          }}
          onCancel={() => setSavePartFromMasterData(null)}
          lang={lang}
        />

        <SaveMasterModal
          isOpen={saveMasterFromPartData !== null}
          content={saveMasterFromPartData?.content || ''}
          defaultTitle={saveMasterFromPartData?.name || ''}
          items={saveMasterFromPartData?.items}
          isNegative={false}
          onConfirm={(title, content, isNegative, items, negativeContent) => {
            if (items && items.length > 0) {
              items.forEach(item => {
                handleSaveAsMaster(item.name, item.content, isNegative);
              });
            } else {
              handleSaveAsMaster(title, content, isNegative, negativeContent);
            }
            setSaveMasterFromPartData(null);
          }}
          onCancel={() => setSaveMasterFromPartData(null)}
          lang={lang}
        />

        <SaveMixerModal
          isOpen={saveMixerFromPartData !== null}
          items={saveMixerFromPartData?.items}
          onConfirm={(categoryId, items) => {
            handleCopyToMixer(categoryId, '', '', items);
            setSaveMixerFromPartData(null);
          }}
          onCancel={() => setSaveMixerFromPartData(null)}
          lang={lang}
          mixerCategories={mixerCategories}
        />
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-border-main bg-bg-panel flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-[9px] font-mono text-green-500">● {t('local_system_ready', lang)}</span>
          <span className="text-[9px] font-mono text-text-dim">{t('latency', lang)}: 0.04ms</span>
        </div>
        <div className="flex space-x-4">
          <span className="text-[9px] font-mono text-text-dim uppercase">{t('cpu', lang)}: 12%</span>
          <span className="text-[9px] font-mono text-text-dim uppercase">{t('mem', lang)}: 1.4GB</span>
          <span className="text-[9px] font-mono text-text-main">{new Date().toISOString().slice(0, 19).replace('T', ' ')}</span>
        </div>
      </footer>
      {saveSuccessMessage && (
        <div className="fixed bottom-10 right-10 bg-accent-main text-white px-4 py-2 rounded shadow-lg text-sm font-bold font-mono z-50 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}
      
      {iframeWarning && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border-main p-6 rounded-lg max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-text-main mb-4 uppercase">機能制限のお知らせ</h3>
            <p className="text-xs text-text-main leading-relaxed mb-6">
              AI Studioのプレビュー画面（iframe）の中では、セキュリティの制限によりフォルダを選択するダイアログを表示することができません。
              <br/><br/>
              右上の「新しいタブで開く」アイコン（矢印のマーク）をクリックして、<strong>新しいタブでアプリを開き直してから</strong>、再度設定をお試しください。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIframeWarning(false)}
                className="px-4 py-2 bg-accent-main text-text-main text-xs rounded hover:opacity-80 transition-opacity"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
      
        
        
        <Toast 
          message={toastMessage?.msg || ''} 
          isVisible={toastMessage !== null} 
          onClose={() => setToastMessage(null)} 
        />

    </div>
  );
}