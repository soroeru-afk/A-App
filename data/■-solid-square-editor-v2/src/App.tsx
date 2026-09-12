import React, { useState, useEffect, useRef, useCallback } from 'react';

const THEMES = {
  navy: {
    bg: "#0a0f18",
    panel: "#0f1623",
    surface: "#172132",
    surface2: "#121a28",
    text: "#c4d1e6",
    muted: "#7887a3",
    accent: "#6c93d6",
    controlAccent: "#6c93d6",
    border: "#253147",
    borderStrong: "#354561",
    editorBg: "#0c121e",
    editorBorder: "#253147"
  },
  light: {
    bg: "#eceff3",
    panel: "#f7f8fb",
    surface: "#ffffff",
    surface2: "#f0f2f6",
    text: "#212733",
    muted: "#6a7485",
    accent: "#6d83aa",
    controlAccent: "#6d83aa",
    border: "#c7ced9",
    borderStrong: "#a3afc0",
    editorBg: "#ffffff",
    editorBorder: "#c7ced9"
  },
  black: {
    bg: "#0B0C0D",
    panel: "#14161A",
    surface: "#1A1D23",
    surface2: "#14161A",
    text: "#E2E6EC",
    muted: "#7A8494",
    accent: "#6D84A3",
    controlAccent: "#6D84A3",
    border: "#22262E",
    borderStrong: "#303642",
    editorBg: "#0B0C0D",
    editorBorder: "#22262E"
  },
  gray: {
    bg: "#d9dde3",
    panel: "#e7ebf1",
    surface: "#f2f4f8",
    surface2: "#e1e6ee",
    text: "#2a313e",
    muted: "#6e788a",
    accent: "#7f8fa8",
    controlAccent: "#7f8fa8",
    border: "#b6bfcd",
    borderStrong: "#99a5b8",
    editorBg: "#eef1f6",
    editorBorder: "#b6bfcd"
  },
  red: {
    bg: "#110606",
    panel: "#180909",
    surface: "#240d0d",
    surface2: "#1e0b0b",
    text: "#ffffff",
    muted: "#a65c5c",
    accent: "#c85a5a",
    controlAccent: "#c85a5a",
    border: "#5c1a1a",
    borderStrong: "#822525",
    editorBg: "#180909",
    editorBorder: "#5c1a1a"
  }
};

const PAPER_INK_LEVELS: { [key: string]: { label: string; name: string; color: string } } = {
  "1": { label: "40%", name: "SOFT", color: "#949494" },
  "2": { label: "55%", name: "MID", color: "#6e6e6e" },
  "3": { label: "70%", name: "CHARCOAL", color: "#4a4a4a" },
  "4": { label: "85%", name: "DEEP", color: "#282828" },
  "5": { label: "100%", name: "BLACK", color: "#050505" }
};

const STORAGE_KEY = "solid-square-editor-state-v3";

type Tab = {
  id: string;
  label: string;
  text: string;
  filename: string | null;
  originalText: string;
};

type SavedTab = {
  id: string;
  label: string;
  text: string;
  savedAt: number;
};

function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: {label: string, value: string}[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="custom-select-container" style={{ position: 'relative', width: '100%', height: '24px' }}>
      <div 
        className="custom-select-trigger" 
        onClick={() => setOpen(!open)}
        style={{
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text)',
          padding: '0 4px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontFamily: 'var(--title-font)',
          fontSize: '11px',
          letterSpacing: '0.04em'
        }}
      >
        <span>{selectedOption?.label}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </div>
      {open && (
        <div 
          className="custom-select-dropdown" 
          style={{
            position: 'absolute',
            top: 'calc(100% - 1px)',
            left: 0,
            right: 0,
            background: 'var(--panel)',
            border: '1px solid var(--border-strong)',
            zIndex: 10,
            maxHeight: '150px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          {options.map(o => (
            <div 
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`custom-select-option ${o.value === value ? 'selected' : ''}`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

let activeHandles = new Map<string, any>(); // Non-serializable handles
let findCursor = 0;

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [statusText, setStatusText] = useState("SYSTEM READY (V18)");
  const [sidebarActiveView, setSidebarActiveView] = useState<"controls" | "saved">("controls");
  const [editingSavedTabId, setEditingSavedTabId] = useState<string | null>(null);
  const [editingSavedLabel, setEditingSavedLabel] = useState<string>("");
  const savedTabsFileInputRef = useRef<HTMLInputElement>(null);
  
  const [fontSize, setFontSize] = useState("16");
  const [fontWeight, setFontWeight] = useState("400");
  const [lineHeight, setLineHeight] = useState("1.6");
  const [fontFamily, setFontFamily] = useState("Meiryo, sans-serif");
  
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>("navy");
  const [paperModeEnabled, setPaperModeEnabled] = useState(false);
  const [paperInkLevel, setPaperInkLevel] = useState("5");
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMinimumMode, setIsMinimumMode] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<"left" | "right">("right");
  const [sidebarWidth, setSidebarWidth] = useState<number>(360);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editorText, setEditorText] = useState("");
  
  const [findInput, setFindInput] = useState("");
  const [replaceInput, setReplaceInput] = useState("");
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("left");
  const [currentLine, setCurrentLine] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void, onCancel: () => void } | null>(null);

  // Drag & Drop for tabs
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

  const toggleSidebarPosition = () => {
    setSidebarPosition(prev => {
      const next = prev === "right" ? "left" : "right";
      setStatusText(`SIDEBAR: ${next.toUpperCase()}`);
      return next;
    });
  };

  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let delta = 0;
      if (sidebarPosition === "right") {
        delta = startX - moveEvent.clientX;
      } else {
        delta = moveEvent.clientX - startX;
      }
      const newWidth = Math.max(360, Math.min(800, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Initialize State
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        setFontSize(loaded.fontSize || "16");
        setFontWeight(loaded.fontWeight || "400");
        setLineHeight(loaded.lineHeight || "1.6");
        setFontFamily(loaded.fontFamily || "Meiryo, sans-serif");
        setActiveTheme(loaded.theme || "navy");
        setPaperModeEnabled(Boolean(loaded.paperMode));
        setPaperInkLevel(loaded.paperInkLevel || "5");
        setIsVertical(Boolean(loaded.isVertical));
        if (loaded.sidebarPosition === "left" || loaded.sidebarPosition === "right") {
          setSidebarPosition(loaded.sidebarPosition);
        }
        if (typeof loaded.sidebarWidth === "number" && loaded.sidebarWidth >= 360) {
          setSidebarWidth(loaded.sidebarWidth);
        }
        if (typeof loaded.isSidebarOpen === "boolean") {
          setIsSidebarOpen(loaded.isSidebarOpen);
        }
        
        let loadedTabs: Tab[] = [];
        if (loaded.tabs && Array.isArray(loaded.tabs)) {
          loadedTabs = loaded.tabs.map((t: any) => ({
            ...t,
            originalText: typeof t.originalText !== "undefined" ? t.originalText : (t.filename ? "" : (t.text || ""))
          }));
          setTabs(loadedTabs);
          const initialId = loaded.activeTabId || (loadedTabs.length > 0 ? loadedTabs[0].id : null);
          setActiveTabId(initialId);
          const initTab = loadedTabs.find((t: Tab) => t.id === initialId);
          if (initTab) setEditorText(initTab.text);
        }
        if (loaded.savedTabs && Array.isArray(loaded.savedTabs)) {
          setSavedTabs(loaded.savedTabs);
        }
      }
    } catch (_) {}

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tabs: updatedTabs,
      activeTabId,
      savedTabs,
      fontSize,
      fontWeight,
      lineHeight,
      fontFamily,
      theme: activeTheme,
      paperMode: paperModeEnabled,
      paperInkLevel,
      isVertical,
      sidebarPosition,
      sidebarWidth,
      isSidebarOpen
    }));
  }, [tabs, activeTabId, savedTabs, fontSize, fontWeight, lineHeight, fontFamily, activeTheme, paperModeEnabled, paperInkLevel, isVertical, sidebarPosition, sidebarWidth, isSidebarOpen, editorText, isLoaded]);

  // Apply Theme and Paper Mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", activeTheme);
    root.setAttribute("data-paper-mode", paperModeEnabled ? "true" : "false");
    
    const t = THEMES[activeTheme] || THEMES.navy;
    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--panel", t.panel);
    root.style.setProperty("--surface", t.surface);
    root.style.setProperty("--surface-2", t.surface2);
    root.style.setProperty("--text", t.text);
    root.style.setProperty("--muted", t.muted);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--control-accent", t.controlAccent);
    root.style.setProperty("--border", t.border);
    root.style.setProperty("--border-strong", t.borderStrong);
    
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.bg);

    if (paperModeEnabled) {
      const ink = PAPER_INK_LEVELS[paperInkLevel] || PAPER_INK_LEVELS["5"];
      root.style.setProperty("--editor-bg", "#f4f4f4");
      root.style.setProperty("--editor-text", ink.color);
      root.style.setProperty("--editor-border", "#cecece");
      root.style.setProperty("--editor-shadow-top", "rgba(255, 255, 255, 0.75)");
      root.style.setProperty("--editor-shadow-bottom", "rgba(0, 0, 0, 0.08)");
      root.style.setProperty("--slider-thumb-bg", "var(--control-accent)");
    } else if (activeTheme === "red") {
      root.style.setProperty("--editor-bg", t.editorBg || t.panel);
      root.style.setProperty("--editor-text", t.text);
      root.style.setProperty("--editor-border", t.editorBorder || t.border);
      root.style.setProperty("--editor-shadow-top", "rgba(255, 255, 255, 0.02)");
      root.style.setProperty("--editor-shadow-bottom", "rgba(0, 0, 0, 0.45)");
      root.style.setProperty("--slider-thumb-bg", "#ffffff");
    } else {
      root.style.setProperty("--editor-bg", t.editorBg || "#171717");
      root.style.setProperty("--editor-text", t.text || "#f0f0f0");
      root.style.setProperty("--editor-border", t.editorBorder || t.border || "#363636");
      root.style.setProperty("--editor-shadow-top", "rgba(255, 255, 255, 0.02)");
      root.style.setProperty("--editor-shadow-bottom", "rgba(0, 0, 0, 0.35)");
      root.style.setProperty("--slider-thumb-bg", "var(--control-accent)");
    }
  }, [activeTheme, paperModeEnabled, paperInkLevel]);

  // Handle preview rendering
  useEffect(() => {
    if (isPreviewMode && previewRef.current) {
      previewRef.current.innerHTML = editorText;
    }
  }, [isPreviewMode, editorText]);

  // Setup body classes
  useEffect(() => {
    if (isMinimumMode) {
      document.body.classList.add('minimum-mode');
    } else {
      document.body.classList.remove('minimum-mode');
    }
    return () => {
      document.body.classList.remove('minimum-mode');
    };
  }, [isMinimumMode]);

  const generateTabId = () => "tab_" + Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  const switchTab = (id: string) => {
    if (id === activeTabId) return;
    
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    setTabs(updatedTabs);
    
    setActiveTabId(id);
    const newTab = updatedTabs.find(t => t.id === id);
    if (newTab) {
      setEditorText(newTab.text);
      if (previewRef.current) {
        previewRef.current.innerHTML = newTab.text;
      }
      if (newTab.filename) {
        setStatusText(`CURRENT FILE: ${newTab.filename}`);
      } else {
        setStatusText(`TAB SWITCHED: ${newTab.label}`);
      }
    } else {
      setEditorText("");
      if (previewRef.current) {
        previewRef.current.innerHTML = "";
      }
    }
    if (textareaRef.current) {
       textareaRef.current.focus();
    }
  };

  const addTab = () => {
    if (tabs.length >= 16) {
      setStatusText("MAX TAB LIMIT REACHED (16)");
      return;
    }
    const newId = generateTabId();
    let maxNum = 0;
    tabs.forEach(t => {
      const match = t.label.match(/TAB (\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const newIndex = maxNum + 1;
    const newTab: Tab = { id: newId, label: `TAB ${String(newIndex).padStart(2, "0")}`, text: "", filename: null, originalText: "" };
    
    let updatedTabs = tabs;
    if (activeTabId) {
      updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    }
    
    setTabs([...updatedTabs, newTab]);
    setActiveTabId(newId);
    setEditorText("");
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
    }
    setStatusText(`NEW TAB CREATED: ${newTab.label}`);
  };

  const executeCloseTab = (id: string, currentTabs: Tab[]) => {
    const index = currentTabs.findIndex(t => t.id === id);
    if (index === -1) return;
    
    if (id === activeTabId) {
      if (currentTabs.length === 1) {
        setActiveTabId(null);
        setEditorText("");
      } else {
        const nextActive = currentTabs[index > 0 ? index - 1 : index + 1];
        setActiveTabId(nextActive.id);
        setEditorText(nextActive.text);
      }
    }
    currentTabs.splice(index, 1);
    setTabs(currentTabs);
  };

  const closeTab = (id: string) => {
    let currentTabs: Tab[] = [...tabs];
    if (id === activeTabId) {
      currentTabs = currentTabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    }
    
    const tabToClose = currentTabs.find(t => t.id === id);
    if (!tabToClose) return;
    
    const isDirty = (tabToClose.text || "") !== (tabToClose.originalText || "");
    if (isDirty) {
      const warning = "（保存していない変更内容は破棄されます）";
      setConfirmDialog({
        message: `「${tabToClose.label}」に変更があります。閉じますか？\n${warning}`,
        onConfirm: () => {
          setConfirmDialog(null);
          executeCloseTab(id, currentTabs);
        },
        onCancel: () => setConfirmDialog(null)
      });
      return;
    }

    executeCloseTab(id, currentTabs);
  };

  const closeAllTabs = () => {
    if (tabs.length === 0) return;

    let currentTabs: Tab[] = [...tabs];
    if (activeTabId) {
      currentTabs = currentTabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    }

    const dirtyTabs = currentTabs.filter(t => (t.text || "") !== (t.originalText || ""));

    const executeCloseAll = () => {
      setTabs([]);
      setActiveTabId(null);
      activeHandles.clear();
      setEditorText("");
      setStatusText("ALL TABS CLOSED");
    };

    if (dirtyTabs.length > 0) {
      let msg = "保存されていないタブがあります。すべて閉じてよろしいですか？\n\n【未保存のタブ】\n";
      dirtyTabs.forEach(t => {
         if (t.filename) {
           msg += `・${t.label} (${t.filename})\n`;
         } else {
           msg += `・${t.label} (新規テキスト)\n`;
         }
      });
      msg += "\n※これらを閉じると、変更内容はすべて失われます。";
      
      setConfirmDialog({
        message: msg,
        onConfirm: () => {
          setConfirmDialog(null);
          executeCloseAll();
        },
        onCancel: () => setConfirmDialog(null)
      });
      return;
    } else {
      setConfirmDialog({
        message: "すべてのタブを閉じますか？",
        onConfirm: () => {
          setConfirmDialog(null);
          executeCloseAll();
        },
        onCancel: () => setConfirmDialog(null)
      });
      return;
    }
  };

  // Saved Tabs Bank (使い回し用タブの保存・復元)
  const saveActiveTabToBank = () => {
    const curTab = tabs.find(t => t.id === activeTabId);
    const content = curTab ? editorText : editorText;
    const baseLabel = curTab ? curTab.label : "TAB";
    
    // 内容の冒頭（改行を除去して最初の1行から最大24文字）を取得して、わかりやすい初期タイトルを作成
    const firstLine = content.trim().split(/[\r\n]+/)[0] || "";
    const snippet = firstLine.replace(/[#*`\-_=~[\]]/g, "").trim().slice(0, 24);
    const autoLabel = snippet ? `${baseLabel} - ${snippet}` : baseLabel;
    
    const newEntry: SavedTab = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: autoLabel,
      text: content,
      savedAt: Date.now()
    };
    
    setSavedTabs(prev => [newEntry, ...prev]);
    setStatusText(`TAB SAVED: ${autoLabel}`);
    setSidebarActiveView("saved"); // 保存タブエリアに自動で切り替えてすぐに確認できるようにする
  };

  const openSavedTab = (saved: SavedTab) => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      label: saved.label,
      text: saved.text,
      filename: null,
      originalText: saved.text
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setEditorText(saved.text);
    setStatusText(`RESTORED TAB: ${saved.label}`);
  };

  const startRenameSavedTab = (saved: SavedTab) => {
    setEditingSavedTabId(saved.id);
    setEditingSavedLabel(saved.label);
  };

  const saveRenameSavedTab = (savedId: string) => {
    const trimmed = editingSavedLabel.trim() || "UNNAMED";
    setSavedTabs(prev => prev.map(s => s.id === savedId ? { ...s, label: trimmed } : s));
    setEditingSavedTabId(null);
    setStatusText(`RENAMED TO: ${trimmed}`);
  };

  const cancelRenameSavedTab = () => {
    setEditingSavedTabId(null);
  };

  // 2段階削除（確認ダイアログ表示）
  const requestRemoveSavedTab = (saved: SavedTab) => {
    setConfirmDialog({
      message: `保存タブ「${saved.label}」を削除しますか？\n（この操作は取り消せません）`,
      onConfirm: () => {
        setConfirmDialog(null);
        setSavedTabs(prev => prev.filter(s => s.id !== saved.id));
        setStatusText(`REMOVED: ${saved.label}`);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const clearAllSavedTabs = () => {
    if (savedTabs.length === 0) return;
    setConfirmDialog({
      message: `保存タブエリアの全 ${savedTabs.length} 件をすべてクリアしますか？\n（この操作は取り消せません）`,
      onConfirm: () => {
        setConfirmDialog(null);
        setSavedTabs([]);
        setStatusText("ALL SAVED TABS CLEARED");
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  // 全保存タブのエクスポート（JSONファイルとしてダウンロード）
  const exportAllSavedTabs = () => {
    if (savedTabs.length === 0) {
      setStatusText("NO SAVED TABS TO EXPORT");
      return;
    }
    const dataStr = JSON.stringify(savedTabs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `solid_square_saved_tabs_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusText(`EXPORTED ${savedTabs.length} SAVED TABS`);
  };

  // 保存タブのインポート（JSONファイル読込、重複回避して結合）
  const handleImportSavedTabsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          setStatusText("ERROR: INVALID JSON FORMAT (ARRAY REQUIRED)");
          return;
        }

        const validItems: SavedTab[] = [];
        for (const item of parsed) {
          if (typeof item.text === "string") {
            validItems.push({
              id: item.id || `saved_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              label: item.label || "IMPORTED TAB",
              text: item.text,
              savedAt: typeof item.savedAt === "number" ? item.savedAt : Date.now()
            });
          }
        }

        if (validItems.length === 0) {
          setStatusText("NO VALID TABS FOUND IN FILE");
          return;
        }

        // 既存の保存タブとマージ（既存の重複IDは新規採番）
        setSavedTabs(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const adjusted = validItems.map(v => {
            if (existingIds.has(v.id)) {
              return { ...v, id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` };
            }
            return v;
          });
          return [...adjusted, ...prev];
        });

        setStatusText(`IMPORTED ${validItems.length} SAVED TABS`);
      } catch (err) {
        setStatusText("ERROR READING IMPORT FILE");
      } finally {
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Tab Drag & Drop Reordering
  const handleTabDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTabId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-solid-tab", id);
  };

  const handleTabDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetId) {
      if (dragOverTabId !== null) setDragOverTabId(null);
      if (dropPosition !== null) setDropPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const position = e.clientX < midpoint ? "before" : "after";
    if (dragOverTabId !== targetId || dropPosition !== position) {
      setDragOverTabId(targetId);
      setDropPosition(position);
    }
    e.dataTransfer.dropEffect = "move";
  };

  const handleTabDragLeave = (e: React.DragEvent, targetId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverTabId === targetId) {
      setDragOverTabId(null);
      setDropPosition(null);
    }
  };

  const handleTabDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetId) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      setDropPosition(null);
      return;
    }

    // Keep active editorText up to date in memory
    const currentTabs = tabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    const fromIndex = currentTabs.findIndex(t => t.id === draggedTabId);
    const toIndex = currentTabs.findIndex(t => t.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const newTabs = [...currentTabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      
      let insertIndex = newTabs.findIndex(t => t.id === targetId);
      if (dropPosition === "after") {
        insertIndex += 1;
      }
      newTabs.splice(insertIndex, 0, movedTab);
      setTabs(newTabs);
      setStatusText(`TAB REORDERED: ${movedTab.label}`);
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropPosition(null);
  };

  const handleTabDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropPosition(null);
  };

  // Files
  const normalizeFilenameSeed = (text: string) => {
    const cleaned = text
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .trim();
    return (cleaned || "untitled").slice(0, 30);
  };

  const buildSuggestedFilename = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const head = normalizeFilenameSeed(editorText);
    return `${y}${m}${d}_${h}${min}_「${head}」.txt`;
  };

  const downloadFallback = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    setTabs(currentTabs => currentTabs.map(t => t.id === activeTabId ? { ...t, filename: filename, originalText: text } : t));
    setStatusText(`FILE SAVED: ${filename}`);
  };

  const saveAsTextFile = async () => {
    const filename = buildSuggestedFilename();
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          id: 'solid-square-editor-files',
          suggestedName: filename,
          types: [{ description: "Text Files", accept: { "text/plain": [".txt"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(editorText);
        await writable.close();
        const file = await handle.getFile();
        
        setTabs(currentTabs => currentTabs.map(t => t.id === activeTabId ? { ...t, filename: file.name, originalText: editorText } : t));
        activeHandles.set(activeTabId!, handle);
        setStatusText(`FILE SAVED: ${file.name}`);
        return;
      } catch (error: any) {
        if (error && error.name === "AbortError") {
          setStatusText("SAVE CANCELED");
          return;
        }
        // Fallthrough to fallback on other errors (like Security API errors in iframes)
      }
    }

    downloadFallback(filename, editorText);
  };

  const handleOpenFileSuccess = (text: string, filename: string, handle: any) => {
    let newActiveId = activeTabId;
    let currentTabs: Tab[] = [...tabs];

    if (activeTabId) {
      currentTabs = currentTabs.map(t => t.id === activeTabId ? { ...t, text: editorText } : t);
    }

    if (activeTabId === null || editorText.trim() !== "") {
      newActiveId = generateTabId();
      let maxNum = 0;
      currentTabs.forEach(t => {
        const match = t.label.match(/TAB (\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const newTab = { id: newActiveId, label: `TAB ${String(maxNum + 1).padStart(2, "0")}`, text, filename, originalText: text };
      currentTabs.push(newTab);
    } else {
      currentTabs = currentTabs.map(t => t.id === activeTabId ? { ...t, text, filename, originalText: text } : t);
    }
    
    if (handle) activeHandles.set(newActiveId!, handle);
    
    setTabs(currentTabs);
    setActiveTabId(newActiveId);
    setEditorText(text);
    setStatusText(`FILE OPENED: ${filename}`);
  };

  const openFileFallback = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain";
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const text = await file.text();
        handleOpenFileSuccess(text, file.name, null);
      }
    };
    input.click();
  };

  const openFile = async () => {
    if ("showOpenFilePicker" in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          id: 'solid-square-editor-files',
          types: [{ description: "Text Files", accept: { "text/plain": [".txt", ".md", ".csv", ".json", ".html", ".css", ".js"] } }]
        });
        const file = await fileHandle.getFile();
        const text = await file.text();
        handleOpenFileSuccess(text, file.name, fileHandle);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
      }
    }
    openFileFallback();
  };

  const overwriteFile = async () => {
    if (!activeTabId) return;
    const handle = activeHandles.get(activeTabId);
    if (!handle) {
      saveAsTextFile();
      return;
    }
    try {
      const writable = await handle.createWritable();
      await writable.write(editorText);
      await writable.close();
      setTabs(currentTabs => currentTabs.map(t => t.id === activeTabId ? { ...t, originalText: editorText } : t));
      setStatusText(`FILE OVERWRITTEN: ${handle.name}`);
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        setStatusText("PERMISSION DENIED. FALLBACK TO SAVE AS.");
        saveAsTextFile();
      } else {
        setStatusText("OVERWRITE FAILED. FALLBACK TO SAVE AS.");
        saveAsTextFile();
      }
    }
  };

  // Text Selection and Transformation utilities
  const applyTransform = (transformFn: (str: string) => string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    textareaRef.current.focus();

    if (start !== end) {
      const selected = editorText.slice(start, end);
      const transformed = transformFn(selected);
      textareaRef.current.setSelectionRange(start, end);
      document.execCommand('insertText', false, transformed);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, start + transformed.length);
        }
      });
    } else {
      const transformed = transformFn(editorText);
      textareaRef.current.setSelectionRange(0, editorText.length);
      document.execCommand('insertText', false, transformed);
      textareaRef.current.setSelectionRange(start, start);
      
      // If the cursor is now out of view or at the end of a big block, we might want to ensure it's visible.
      // But keeping it where it was (start) is the most natural behavior.
    }
    setStatusText("TEXT TRANSFORMED");
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontWeight(e.target.value);
  };

  const handleInkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaperInkLevel(val);
    const info = PAPER_INK_LEVELS[val] || PAPER_INK_LEVELS["5"];
    if (!paperModeEnabled) {
      setPaperModeEnabled(true);
      setStatusText(`PAPER MODE ON - INK DENSITY: ${info.label} (${info.name})`);
    } else {
      setStatusText(`PAPER INK DENSITY: ${info.label} (${info.name})`);
    }
  };

  // Find & Replace
  const escapeRegExp = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const findNext = () => {
    if (!findInput) {
      setStatusText("FIND KEYWORD IS EMPTY");
      return;
    }
    const index = editorText.indexOf(findInput, findCursor);
    const foundIndex = index !== -1 ? index : editorText.indexOf(findInput, 0);
    if (foundIndex === -1) {
      setStatusText("NO MATCH");
      return;
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(foundIndex, foundIndex + findInput.length);
    }
    findCursor = foundIndex + findInput.length;
    setStatusText(`FOUND AT: ${foundIndex}`);
  };

  const replaceCurrent = () => {
    if (!findInput) return;
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editorText.slice(start, end);
    
    if (selected === findInput) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, end);
      document.execCommand('insertText', false, replaceInput);
      findCursor = start + replaceInput.length;
      setStatusText("ONE MATCH REPLACED");
      return;
    }
    findNext();
  };

  const replaceAll = () => {
    if (!findInput) return;
    const reg = new RegExp(escapeRegExp(findInput), "g");
    const matches = editorText.match(reg);
    if (!matches) return;
    const newText = editorText.replace(reg, replaceInput);
    if (textareaRef.current) {
        textareaRef.current.focus();
        const start = textareaRef.current.selectionStart;
        textareaRef.current.setSelectionRange(0, editorText.length);
        document.execCommand('insertText', false, newText);
        textareaRef.current.setSelectionRange(start, start);
    } else {
        setEditorText(newText);
    }
    setStatusText(`REPLACED: ${matches.length}`);
  };

  // Transform Engines
  const runStripHtml = (text: string) => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.left = "-9999px";
    div.style.whiteSpace = "pre-wrap";
    div.style.width = "1000px";
    document.body.appendChild(div);

    // Escape iframes to prevent them from breaking the text extraction
    div.innerHTML = text.replace(/<iframe/gi, "&lt;iframe");

    // Standard block display without manual newline insertion
    div.querySelectorAll("p, div, li, tr, h1, h2, h3, h4").forEach((el) => {
      (el as HTMLElement).style.display = "block";
    });
    div.querySelectorAll("br").forEach(br => br.after("\n"));
    const clean = div.innerText.replace(/\n{3,}/g, "\n\n").trim();
    document.body.removeChild(div);
    return clean;
  };

  const runCleanPastedHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const toRemove = doc.querySelectorAll("script, style, meta, link, title, head");
    toRemove.forEach(el => el.remove());
    
    doc.body.querySelectorAll("*").forEach(el => {
      const attrNames = Array.from(el.attributes).map(a => a.name);
      attrNames.forEach(name => el.removeAttribute(name));
    });
    return doc.body.innerHTML;
  };

  const runToggleCase = (text: string) => {
    const upper = text.toUpperCase();
    const lower = text.toLowerCase();
    return (text === upper) ? lower : upper;
  };

  const runToggleZenHan = (text: string) => {
    const toHalf = text.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/　/g, ' ');
    if (text !== toHalf) return toHalf;
    return text.replace(/[!-~]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xFEE0)).replace(/ /g, '　');
  };

  const runToggleHiraKata = (text: string) => {
    const toKata = text.replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
    if (text !== toKata) return toKata;
    return text.replace(/[\u30A1-\u30F6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));
  };

  const runCleanText = (text: string) => text.split(/\r?\n/).map(line => line.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const runUnifySpaces = (text: string) => text.replace(/　/g, " ");

  const runQuoteText = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return text;
    const nonEmptyLines = lines.filter(l => l.trim() !== "");
    const allQuoted = nonEmptyLines.length > 0 && nonEmptyLines.every(l => l.startsWith("> "));
    if (allQuoted) {
      return lines.map(l => l.startsWith("> ") ? l.slice(2) : l).join("\n");
    } else {
      return lines.map(l => l.startsWith("> ") ? l : `> ${l}`).join("\n");
    }
  };

  const handleUndo = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // HACK: To prevent jumping to bottom on full-text undo, capture state
      const beforeUndoLength = textareaRef.current.value.length;
      
      document.execCommand("undo");
      
      const afterUndoLength = textareaRef.current.value.length;
      
      // If the selection is the entire text (which happens when undoing a bulk replace)
      if (textareaRef.current.selectionStart === 0 && textareaRef.current.selectionEnd === afterUndoLength) {
        textareaRef.current.setSelectionRange(0, 0);
        textareaRef.current.scrollTop = 0;
      } 
      // If the cursor is at the very end, and the length changed by a lot (bulk operation), move to top
      else if (textareaRef.current.selectionStart === afterUndoLength && Math.abs(afterUndoLength - beforeUndoLength) > 10) {
        textareaRef.current.setSelectionRange(0, 0);
        textareaRef.current.scrollTop = 0;
      }

      setStatusText("UNDO");
    }
  };

  const handleRedo = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      const beforeRedoLength = textareaRef.current.value.length;
      document.execCommand("redo");
      const afterRedoLength = textareaRef.current.value.length;
      
      if (textareaRef.current.selectionStart === 0 && textareaRef.current.selectionEnd === afterRedoLength) {
        textareaRef.current.setSelectionRange(0, 0);
        textareaRef.current.scrollTop = 0;
      } else if (textareaRef.current.selectionStart === afterRedoLength && Math.abs(afterRedoLength - beforeRedoLength) > 10) {
        textareaRef.current.setSelectionRange(0, 0);
        textareaRef.current.scrollTop = 0;
      }
      
      setStatusText("REDO");
    }
  };

  const runCleanupChat = (text: string) => {
    let processText = text;
    if (processText.includes("<") && processText.includes(">")) {
      processText = runStripHtml(processText);
    }

    // Remove any stray markers
    processText = processText.replace(/\u200B/g, "");

    const lines = processText.split(/\r?\n/).map(l => l.trim());
    const result: string[] = [];
    
    // Detection patterns
    const timeRegex = /^(\d{1,2}:\d{2}|\[\d{1,2}:\d{2}\])/;
    const listRegex = /^(\d+[\.\)）]|[\・\-\*])/; 
    const headingRegex = /^(#+|(\d+[\.\)）]))\s+/;
    const labelRegex = /^([^:：\s]{1,15})[:：]/;
    const speakerRegex = /^(User|ChatGPT|Assistant|Gemini|You|Me|MGR|Manager|カオル|AI|Antigravity)[:：]/i;
    const citationRegex = /^(\+\d+|\[\d+\])$/; // Matches +1, [1], etc.
    
    // Heading keywords (expanded)
    const keywordHeadingRegex = /^.{1,30}(概要|まとめ|について|方法|原因|対策|手順|ポイント|メモ|注意|ヒント|ステップ|理由|背景|目的|結論|でした|ました|です|さい)$/;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line === "") {
        if (result.length > 0 && result[result.length-1] !== "") {
          result.push("");
        }
        continue;
      }

      // Handle Citations: Join to the previous non-empty line if it's a short reference
      if (citationRegex.test(line) && result.length > 0) {
        let lastIdx = result.length - 1;
        while (lastIdx >= 0 && result[lastIdx] === "") lastIdx--;
        if (lastIdx >= 0) {
          result[lastIdx] = result[lastIdx] + " " + line;
          continue;
        }
      }

      // Smarter heading detection: short lines, or keyword lines
      const isHeading = headingRegex.test(line) || keywordHeadingRegex.test(line) || (line.length < 25 && (!line.includes("。") || line.length < 15));
      
      const isList = listRegex.test(line);
      const isTime = timeRegex.test(line);
      const isSpeaker = speakerRegex.test(line);
      const isLabel = labelRegex.test(line) && !isTime && !isSpeaker && !isList && !isHeading;

      // Add spacing before significant blocks
      if (result.length > 0 && result[result.length-1] !== "") {
        if (isList || isTime || isSpeaker || isHeading || isLabel) {
          result.push("");
        }
      }

      if (isTime) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          result.push(line);
        } else {
          const time = line;
          const name = lines[i+1] || "Unknown";
          const body = lines[i+2] || "";
          result.push(`[${time.replace(/[\[\]]/g, "")}] ${name}: ${body}`);
          i += 2;
        }
      } else {
        result.push(line);
        
        // spacing below
        if (isHeading || isLabel) {
          const nextLine = (lines[i+1] || "").trim();
          if (nextLine !== "" && !headingRegex.test(nextLine) && !listRegex.test(nextLine) && !labelRegex.test(nextLine) && !keywordHeadingRegex.test(nextLine) && !citationRegex.test(nextLine)) {
            result.push("");
          }
        }
      }
    }

    // Final pass: ensure spacing and "merihari"
    const finalLines = result.join("\n").split("\n");
    const processed: string[] = [];
    for (let i = 0; i < finalLines.length; i++) {
      const l = finalLines[i];
      const trimmed = l.trim();
      if (trimmed === "") {
        if (processed.length > 0 && processed[processed.length-1] !== "") processed.push("");
        continue;
      }
      
      const isStrongHeading = headingRegex.test(trimmed) || keywordHeadingRegex.test(trimmed);
      
      if (i > 0 && (isStrongHeading || listRegex.test(trimmed) || labelRegex.test(trimmed)) && processed[processed.length - 1] !== "") {
        processed.push("");
      }
      
      processed.push(l);

      if (isStrongHeading || (labelRegex.test(trimmed) && trimmed.length < 40)) {
        const next = (finalLines[i+1] || "").trim();
        if (next !== "" && !headingRegex.test(next) && !listRegex.test(next) && !labelRegex.test(next) && !keywordHeadingRegex.test(next)) {
          processed.push("");
        }
      }
    }

    return processed.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      let content = "";
      if (isHtmlMode) {
        content = runCleanPastedHtml(html);
        setStatusText("PASTED AS HTML SOURCE");
      } else {
        content = runStripHtml(html);
        setStatusText("PASTED AS CLEAN TEXT");
      }
      
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, end);
        document.execCommand('insertText', false, content);
      } else {
        setEditorText(editorText.slice(0, start) + content + editorText.slice(end));
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorText);
      setStatusText("TEXT COPIED");
    } catch (_) {
      setStatusText("COPY FAILED");
    }
  };

  const clearAllFind = () => {
    setFindInput("");
    setReplaceInput("");
    findCursor = 0;
    setStatusText("FIND/REPLACE CLEARED");
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {
          setStatusText("FULLSCREEN NOT SUPPORTED IN CURRENT CONTEXT");
        });
        setStatusText("FULLSCREEN: ON");
      } else {
        document.exitFullscreen?.().catch(() => {});
        setStatusText("FULLSCREEN: OFF");
      }
    } catch (_) {
      setStatusText("FULLSCREEN TOGGLE FAILED");
    }
  };

  const updateCurrentLine = () => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart;
      const lines = editorText.slice(0, position).split("\n");
      setCurrentLine(lines.length);
    }
  };

  return (
    <main className={`app sidebar-${sidebarPosition} ${isMinimumMode ? 'minimum-mode' : ''}`}>
      {/* ─── メイン編集エリア（タイトル、タブ、エディタ、フッター） ─── */}
      <section className="main-area">
        {/* メインヘッダー */}
        <header className="main-header">
          <div className="main-title-group">
            <span className="main-title-badge" title="Solid Square">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <rect x="2" y="2" width="4.5" height="4.5" />
                <rect x="9.5" y="2" width="4.5" height="4.5" />
                <rect x="2" y="9.5" width="4.5" height="4.5" />
                <rect x="9.5" y="9.5" width="4.5" height="4.5" />
              </svg>
            </span>
            <span className="main-title-text">SOLID SQUARE EDITOR</span>
            <span className="main-title-sub">Studio Surface</span>
          </div>

          <div className="main-header-actions">
            <div className="header-meta">
              CHARS: <strong>{editorText.length.toLocaleString()}</strong> | LINE: <strong>{currentLine}</strong>
            </div>
            {/* フォーカスモード時のみヘッダーのステータスを表示（通常時はサイドバー最上部のSTATUSパネルに表示されるためダブりを防止） */}
            {isMinimumMode && (
              <div className="header-status" title={statusText}>{statusText}</div>
            )}

            <button 
              className={`header-btn ${isMinimumMode ? 'active' : ''}`}
              title={isMinimumMode ? "通常表示に戻る" : "リーディングフォーカス（全画面集中モード）"} 
              onClick={() => {
                setIsMinimumMode(v => {
                  const next = !v;
                  setStatusText(next ? "FOCUS MODE: ON" : "FOCUS MODE: OFF");
                  return next;
                });
              }}
            >
              {isMinimumMode ? 'EXIT FOCUS' : 'FOCUS MODE'}
            </button>
          </div>
        </header>

        {/* MINI HUD STRIP（リーディングフォーカス時のみ表示） */}
        <div className="mini-strip" style={{ display: isMinimumMode ? 'flex' : 'none' }}>
          <span className="mini-label">SIZE</span>
          <span className="mini-value">{fontSize}PX</span>
          {paperModeEnabled && (
            <>
              <div className="mini-sep"></div>
              <span className="mini-label">INK</span>
              <button 
                className="mini-btn-box" 
                title="ペーパーモードの文字の濃さを切替 (40%〜100%)" 
                onClick={() => {
                  const nextLevel = (Number(paperInkLevel) % 5 + 1).toString();
                  setPaperInkLevel(nextLevel);
                  const info = PAPER_INK_LEVELS[nextLevel] || PAPER_INK_LEVELS["5"];
                  setStatusText(`PAPER INK: ${info.label} (${info.name})`);
                }}
              >
                {PAPER_INK_LEVELS[paperInkLevel]?.label || "100%"}
              </button>
            </>
          )}
          <div className="mini-sep"></div>
          <button className="mini-btn-box" title="LEFT" onClick={() => { setTextAlignment('left'); setStatusText('ALIGN: LEFT'); }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
          </button>
          <button className="mini-btn-box" title="CENTER" onClick={() => { setTextAlignment('center'); setStatusText('ALIGN: CENTER'); }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
          </button>
          <button className="mini-btn-box" title="RIGHT" onClick={() => { setTextAlignment('right'); setStatusText('ALIGN: RIGHT'); }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
          </button>
          <div className="mini-sep"></div>
          
          <button className="mini-btn-box" title="UPPER / LOWER" style={{textTransform: 'none'}} onClick={() => applyTransform(runToggleCase)}>A/a</button>
          <button className="mini-btn-box" title="ZEN / HAN" onClick={() => applyTransform(runToggleZenHan)}>半/全</button>
          <button className="mini-btn-box" title="HIRA / KATA" onClick={() => applyTransform(runToggleHiraKata)}>あ/ア</button>
          <div className="mini-sep"></div>
          <button className="mini-btn-box" title="HTML PASTE MODE" onClick={() => { setIsHtmlMode(v=>!v); setStatusText(!isHtmlMode ? "HTML PASTE MODE: ON" : "HTML PASTE MODE: OFF"); }} style={isHtmlMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>HTML</button>
          <button className="mini-btn-box" title="PREVIEW" onClick={() => { setIsPreviewMode(v=>!v); setStatusText(!isPreviewMode ? "PREVIEW MODE: ON" : "PREVIEW MODE: OFF"); }} style={isPreviewMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>MD</button>
          <button className="mini-btn-box" title="VERTICAL / HORIZONTAL" onClick={() => { setIsVertical(v=>!v); setStatusText(!isVertical ? "WRITING MODE: VERTICAL" : "WRITING MODE: HORIZONTAL"); }} style={isVertical ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>横/縦</button>
          <div className="mini-sep"></div>
          <button className="mini-btn-box" title="CLEAN" onClick={() => applyTransform(runCleanText)}>CLN</button>
          <button className="mini-btn-box" title="UNIFY" onClick={() => applyTransform(runUnifySpaces)}>UNI</button>
          <button className="mini-btn-box" title="UNDO" onClick={handleUndo}>UNDO</button>
          <button className="mini-btn-box" title="REDO" onClick={handleRedo}>REDO</button>
          <button className="mini-btn-box" title="CHAT" onClick={() => applyTransform(runCleanupChat)}>CHT</button>
          <div className="mini-sep" style={{ marginLeft: 'auto' }}></div>
          <input type="text" className="mini-input" placeholder="FIND" value={findInput} onChange={e => setFindInput(e.target.value)} onDrop={e => { e.preventDefault(); setFindInput(e.dataTransfer.getData("text/plain")); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} />
          <input type="text" className="mini-input" placeholder="REP" value={replaceInput} onChange={e => setReplaceInput(e.target.value)} onDrop={e => { e.preventDefault(); setReplaceInput(e.dataTransfer.getData("text/plain")); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} />
          <button className="mini-btn-box" title="次を検索" onClick={findNext}>NEXT</button>
          <button className="mini-btn-box" title="現在位置を置換" onClick={replaceCurrent}>REPLACE</button>
          <button className="mini-btn-box" title="すべての該当箇所を一括置換" onClick={replaceAll}>REP ALL</button>
          <button className="mini-btn-box all-clear-btn" title="検索・置換窓の入力をすべてクリア" onClick={clearAllFind}>ALL CLEAR</button>
        </div>

        {/* エディタ本体（タブ＋広大エディタ） */}
        <section className="panel editor-wrap">
          <div className="tab-strip">
            {tabs.map(tab => {
              const isDragging = tab.id === draggedTabId;
              const isOver = tab.id === dragOverTabId;
              const dropClass = isOver && dropPosition ? `drop-${dropPosition}` : "";
              return (
                <div 
                  key={tab.id} 
                  className={`tab-item ${isDragging ? "is-dragging" : ""} ${dropClass}`} 
                  aria-selected={tab.id === activeTabId}
                  draggable={true}
                  onDragStart={(e) => handleTabDragStart(e, tab.id)}
                  onDragOver={(e) => handleTabDragOver(e, tab.id)}
                  onDragLeave={(e) => handleTabDragLeave(e, tab.id)}
                  onDrop={(e) => handleTabDrop(e, tab.id)}
                  onDragEnd={handleTabDragEnd}
                  title={`${tab.label} (ドラッグで並び替え可能)`}
                >
                  <span onClick={() => switchTab(tab.id)}>{tab.label}</span>
                  <span className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>×</span>
                </div>
              );
            })}
            <button className="tab-add" onClick={addTab} title="NEW TAB">+</button>
            {activeTabId && (
              <button 
                className="tab-add" 
                onClick={saveActiveTabToBank} 
                title="現在のタブを保存タブエリアに保持（使い回し用に保存）" 
                style={{ width: 'auto', padding: '0 8px', fontSize: 9, marginLeft: 4, color: 'var(--text)', borderColor: 'var(--border-strong)' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--control-accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              >
                ★ SAVE TAB
              </button>
            )}
            {tabs.length > 1 && (
               <button className="tab-add" onClick={closeAllTabs} title="CLOSE ALL TABS" style={{width: 'auto', padding: '0 8px', fontSize: 9, marginLeft: 8, color: 'var(--muted)', borderColor: 'var(--border-strong)'}} 
                       onMouseOver={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = '#ff6b6b'; }}
                       onMouseOut={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}>
                 CLEAR ALL
               </button>
            )}
          </div>
          <div className={`editor-container ${isPreviewMode ? "preview-mode" : ""} ${isVertical ? "vertical-mode" : ""}`}>
            <textarea 
               ref={textareaRef}
               value={editorText}
               onChange={e => {
                 setEditorText(e.target.value);
                 setTimeout(updateCurrentLine, 0);
               }}
               onPaste={handlePaste}
               onClick={updateCurrentLine}
               onKeyUp={updateCurrentLine}
               onKeyDown={e => {
                 if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                   e.preventDefault();
                   if (e.shiftKey) {
                     handleRedo();
                   } else {
                     handleUndo();
                   }
                 } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                   e.preventDefault();
                   handleRedo();
                 }
               }}
               disabled={!activeTabId}
               placeholder={activeTabId ? "ここにテキストを入力してください" : "+ ボタンでタブを追加してください"}
               style={{
                 fontSize: `${fontSize}px`,
                 fontWeight: fontWeight,
                 lineHeight: lineHeight,
                 fontFamily: fontFamily,
                 textAlign: textAlignment
               }}
            />
            <div className="preview-pane">
              <button className="close-preview" title="CLOSE PREVIEW" onClick={() => { setIsPreviewMode(false); setStatusText("PREVIEW CLOSED"); }}>×</button>
              <div ref={previewRef} id="previewContent" style={{
                 fontSize: `${fontSize}px`,
                 fontWeight: fontWeight,
                 lineHeight: lineHeight,
                 fontFamily: fontFamily,
                 textAlign: textAlignment
              }}></div>
            </div>
          </div>
        </section>

        {/* フッターアクションバー */}
        <section className="footer">
          <button className="action-btn" onClick={handleCopy}>COPY</button>
          <button className="action-btn" onClick={() => { setEditorText(''); setStatusText("TEXT CLEARED"); }}>CLEAR</button>
          <button className="action-btn" onClick={openFile}>OPEN</button>
          <button className="action-btn" onClick={overwriteFile}>OVERWRITE</button>
          <button className="action-btn" onClick={saveAsTextFile}>SAVE AS</button>
        </section>
      </section>

      {/* ─── サイドバーリサイザー（境界線ドラッグバー） ─── */}
      {isSidebarOpen && !isMinimumMode && (
        <div 
          className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={handleMouseDownResizer}
          title="ドラッグしてサイドバーの幅を調整（最小360px）"
        />
      )}

      {/* ─── サイドバー操作系パネル ─── */}
      {isSidebarOpen && !isMinimumMode && (
        <aside className="sidebar-panel" style={{ width: sidebarWidth }}>
          <div className="sidebar-header">
            <span className="sidebar-title">CONTROL PANEL</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button 
                className="mini-btn-box" 
                onClick={toggleSidebarPosition} 
                title="操作パネルの位置を左右反対側に移動"
              >
                {sidebarPosition === 'right' ? 'LEFT ⇄' : '⇄ RIGHT'}
              </button>
              <button 
                className={`mini-btn-box ${isFullscreen ? 'active' : ''}`}
                onClick={toggleFullscreen} 
                title={isFullscreen ? "全画面表示を解除 (Esc)" : "ブラウザ全画面表示を切替"}
                style={{ padding: '0 6px' }}
              >
                {isFullscreen ? (
                  /* フルスクリーン中：内側を向いた4つの角括弧（縮小/全画面解除） */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
                  </svg>
                ) : (
                  /* 通常時：外側を向いた4つの角括弧（全画面表示） */
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="sidebar-scroll">
            {/* 01 STATUS */}
            <div className="compact-control">
              <div className="label-row">
                <label>01 STATUS</label>
                <div className="char-count">CHARS: {editorText.length}</div>
              </div>
              <div 
                className="status sidebar-status-box" 
                title={statusText}
              >
                {statusText}
              </div>
            </div>

            {/* ─── SIDEBAR VIEW TABS SWITCHER ─── */}
            <div className="sidebar-view-tabs">
              <button 
                type="button"
                className={`sidebar-view-tab-btn ${sidebarActiveView === 'controls' ? 'active' : ''}`}
                onClick={() => setSidebarActiveView('controls')}
                title="基本操作パネル（テーマ、フォント、行間、整形ツール等）"
              >
                CONTROLS
              </button>
              <button 
                type="button"
                className={`sidebar-view-tab-btn ${sidebarActiveView === 'saved' ? 'active' : ''}`}
                onClick={() => setSidebarActiveView('saved')}
                title="保存タブ・使い回しタブ一覧"
              >
                SAVED TABS
                <span className="sidebar-view-tab-badge">{savedTabs.length}</span>
              </button>
            </div>

            {/* VIEW A: CONTROLS (基本操作パネル) */}
            {sidebarActiveView === 'controls' && (
              <>
                {/* 02 THEME BANK */}
                <div className="control">
                  <div className="label-row">
                    <label>02 THEME BANK</label>
                  </div>
                  <div className="theme-buttons">
                    <button className="theme-btn" aria-pressed={activeTheme === "navy"} onClick={() => {setActiveTheme("navy"); setStatusText("THEME CHANGED: NAVY");}}>Navy</button>
                    <button className="theme-btn" aria-pressed={activeTheme === "light"} onClick={() => {setActiveTheme("light"); setStatusText("THEME CHANGED: LIGHT");}}>Light</button>
                    <button className="theme-btn" aria-pressed={activeTheme === "black"} onClick={() => {setActiveTheme("black"); setStatusText("THEME CHANGED: BLACK");}}>Black</button>
                    <button className="theme-btn" aria-pressed={activeTheme === "gray"} onClick={() => {setActiveTheme("gray"); setStatusText("THEME CHANGED: GRAY");}}>Gray</button>
                    <button className="theme-btn" aria-pressed={activeTheme === "red"} onClick={() => {setActiveTheme("red"); setStatusText("THEME CHANGED: RED");}}>Red</button>
                    <button className="paper-btn" aria-pressed={paperModeEnabled} onClick={() => {setPaperModeEnabled(v=>!v); setStatusText(!paperModeEnabled ? "PAPER MODE: ON" : "PAPER MODE: OFF");}}>Paper</button>
                  </div>
                </div>

            {/* 03 SIZE & WEIGHT */}
            <div className="sidebar-grid-2">
              <div className="control">
                <div className="label-row">
                  <label>03 SIZE</label>
                  <span className="value">{fontSize}px</span>
                </div>
                <input className="solid-slider" type="range" min="8" max="100" step="1" value={fontSize} onChange={handleSizeChange} />
              </div>

              <div className="control">
                <div className="label-row">
                  <label>04 WEIGHT</label>
                  <span className="value">{fontWeight}</span>
                </div>
                <input className="solid-slider" type="range" min="100" max="900" step="100" value={fontWeight} onChange={handleWeightChange} />
              </div>
            </div>

            {/* 05 LEADING & PAPER INK */}
            <div className="sidebar-grid-2">
              <div className="control">
                <div className="label-row">
                  <label>05 LEADING</label>
                  <span className="value">{Number(lineHeight).toFixed(1)}</span>
                </div>
                <input className="solid-slider" type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(e.target.value)} />
              </div>

              <div className="control" style={!paperModeEnabled ? { opacity: 0.45 } : {}}>
                <div className="label-row">
                  <label>06 PAPER INK</label>
                  <span className="value">{paperModeEnabled ? (PAPER_INK_LEVELS[paperInkLevel]?.label || "100%") : "OFF"}</span>
                </div>
                <input 
                  className="solid-slider" 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={paperInkLevel} 
                  onChange={handleInkChange}
                  title={paperModeEnabled ? `PAPER INK: ${PAPER_INK_LEVELS[paperInkLevel]?.label} (${PAPER_INK_LEVELS[paperInkLevel]?.name})` : "PAPER MODE有効時に文字の濃淡を調整できます"} 
                />
              </div>
            </div>

            {/* 07 FONT FAMILY */}
            <div className="control">
              <div className="label-row">
                <label>07 FONT FAMILY</label>
              </div>
              <CustomSelect
                value={fontFamily}
                onChange={setFontFamily}
                options={[
                  { value: "Meiryo, sans-serif", label: "MEIRYO" },
                  { value: "'MS Gothic', monospace", label: "MS GOTHIC" },
                  { value: "system-ui, sans-serif", label: "SYSTEM UI" },
                  { value: "'Yu Gothic UI', sans-serif", label: "YU GOTHIC UI" },
                  { value: "'Consolas', monospace", label: "CONSOLAS" }
                ]}
              />
            </div>

            {/* 08 TRANSFORM ENGINE */}
            <div className="control">
              <div className="label-row">
                <label>08 TRANSFORM ENGINE</label>
              </div>
              <div className="transform-buttons" style={{gridTemplateColumns: "repeat(5, 1fr)"}}>
                <button className="mini-btn" type="button" style={{textTransform: "none"}} title="大文字/小文字切替" onClick={() => applyTransform(runToggleCase)}>A/a</button>
                <button className="mini-btn" type="button" title="全角/半角切替" onClick={() => applyTransform(runToggleZenHan)}>半/全</button>
                <button className="mini-btn" type="button" title="ひらがな/カタカナ切替" onClick={() => applyTransform(runToggleHiraKata)}>あ/ア</button>
                <button className="mini-btn" type="button" title="空行集約とトリミング" onClick={() => applyTransform(runCleanText)}>CLN</button>
                <button className="mini-btn" type="button" title="縦組/横組切替" onClick={() => { setIsVertical(v=>!v); setStatusText(!isVertical ? "WRITING MODE: VERTICAL" : "WRITING MODE: HORIZONTAL"); }} style={isVertical ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>横/縦</button>
                
                <button className="mini-btn" type="button" title="左寄せ" onClick={() => { setTextAlignment('left'); setStatusText('ALIGN: LEFT'); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                </button>
                <button className="mini-btn" type="button" title="中央寄せ" onClick={() => { setTextAlignment('center'); setStatusText('ALIGN: CENTER'); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
                </button>
                <button className="mini-btn" type="button" title="右寄せ" onClick={() => { setTextAlignment('right'); setStatusText('ALIGN: RIGHT'); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
                </button>
                <button className="mini-btn" type="button" title="HTMLペーストモード切替" onClick={() => { setIsHtmlMode(v=>!v); setStatusText(!isHtmlMode ? "HTML PASTE MODE: ON" : "HTML PASTE MODE: OFF"); }} style={isHtmlMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>HTML</button>
                <button className="mini-btn" type="button" title="Markdownプレビュー切替" onClick={() => { setIsPreviewMode(v=>!v); setStatusText(!isPreviewMode ? "PREVIEW MODE: ON" : "PREVIEW MODE: OFF"); }} style={isPreviewMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>MD</button>
              </div>
            </div>

            {/* 09 LINE TOOLS */}
            <div className="control">
              <div className="label-row">
                <label>09 LINE TOOLS</label>
              </div>
              <div className="transform-buttons" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
                <button className="mini-btn" title="全角スペースを半角に" onClick={() => applyTransform(runUnifySpaces)}>UNIFY</button>
                <button className="mini-btn" title="チャットログの整形" onClick={() => applyTransform(runCleanupChat)}>CHAT</button>
                <button className="mini-btn" title="元に戻す" onClick={handleUndo}>UNDO</button>
                <button className="mini-btn" title="やり直し" onClick={handleRedo}>REDO</button>
              </div>
            </div>

            {/* 10 FIND / REPLACE */}
            <div className="compact-control">
              <div className="label-row">
                <label>10 FIND / REPLACE</label>
              </div>
              <div className="sidebar-search-box">
                <div className="sidebar-search-row">
                  <span className="sidebar-search-label">FIND</span>
                  <input className="tool-input" style={{ flex: 1 }} type="text" placeholder="検索文字列を入力" value={findInput} onChange={e => setFindInput(e.target.value)} onDrop={e => { e.preventDefault(); setFindInput(e.dataTransfer.getData("text/plain")); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} />
                </div>
                <div className="sidebar-search-row">
                  <span className="sidebar-search-label">REP</span>
                  <input className="tool-input" style={{ flex: 1 }} type="text" placeholder="置換文字列を入力" value={replaceInput} onChange={e => setReplaceInput(e.target.value)} onDrop={e => { e.preventDefault(); setReplaceInput(e.dataTransfer.getData("text/plain")); }} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }} />
                </div>
                <div className="sidebar-search-actions">
                  <button className="mini-btn" type="button" title="次を検索" onClick={findNext}>NEXT</button>
                  <button className="mini-btn" type="button" title="現在位置を置換" onClick={replaceCurrent}>REPLACE</button>
                  <button className="mini-btn" type="button" title="すべての該当箇所を一括置換" onClick={replaceAll}>REP ALL</button>
                  <button className="mini-btn all-clear-btn" type="button" title="検索・置換窓の入力をすべてクリア" onClick={clearAllFind}>ALL CLEAR</button>
                </div>
              </div>
            </div>
            </>
          )}

          {/* VIEW B: SAVED TABS (保存タブ・使い回し専用ビュー) */}
          {sidebarActiveView === 'saved' && (
            <div className="saved-tabs-view-container">
              <div className="saved-tabs-topbar">
                <button 
                  className="mini-btn" 
                  type="button" 
                  style={{ flex: 1, height: '26px', fontWeight: 700 }}
                  onClick={saveActiveTabToBank}
                  title="現在編集中のタブを保存タブエリアに追加（冒頭テキストが初期名になります）"
                >
                  + SAVE CURRENT TAB
                </button>
                {savedTabs.length > 0 && (
                  <button 
                    className="mini-btn delete-btn"
                    type="button"
                    style={{ height: '26px', padding: '0 8px', color: 'var(--muted)' }}
                    onClick={clearAllSavedTabs}
                    title="保存タブを全クリア（確認ダイアログあり）"
                    onMouseOver={e => (e.currentTarget.style.color = '#ff6b6b')}
                    onMouseOut={e => (e.currentTarget.style.color = 'var(--muted)')}
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>

              {/* エクスポート・インポート操作列 */}
              <div className="saved-tabs-io-bar">
                <button
                  type="button"
                  className="mini-btn"
                  style={{ flex: 1, height: '24px', fontSize: 10 }}
                  onClick={exportAllSavedTabs}
                  title="保存タブをすべてJSONファイルとしてバックアップ保存（ダウンロード）"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  EXPORT ALL ({savedTabs.length})
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  style={{ flex: 1, height: '24px', fontSize: 10 }}
                  onClick={() => savedTabsFileInputRef.current?.click()}
                  title="バックアップしたJSONファイルから保存タブを読み込み復元（インポート）"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  IMPORT TABS
                </button>
                <input
                  ref={savedTabsFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: "none" }}
                  onChange={handleImportSavedTabsFile}
                />
              </div>

              {savedTabs.length === 0 ? (
                <div className="saved-tabs-empty">
                  保持されているタブはありません。<br/>
                  「+ SAVE CURRENT TAB」やタブバーの「★ SAVE TAB」から、<br/>
                  定型フォーマットやAI指示書を安全に保持・使い回しできます。
                </div>
              ) : (
                <div className="saved-tabs-full-list">
                  {savedTabs.map((s) => (
                    <div key={s.id} className="saved-tab-card">
                      <div className="saved-tab-header-row">
                        {editingSavedTabId === s.id ? (
                          <div className="saved-tab-title-group">
                            <input 
                              type="text" 
                              className="saved-tab-title-input" 
                              value={editingSavedLabel}
                              autoFocus
                              placeholder="タブの保存名を入力"
                              onChange={e => setEditingSavedLabel(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveRenameSavedTab(s.id);
                                if (e.key === 'Escape') cancelRenameSavedTab();
                              }}
                            />
                            <button 
                              className="mini-btn" 
                              style={{ height: '22px', padding: '0 6px', fontSize: 9 }}
                              onClick={() => saveRenameSavedTab(s.id)}
                            >
                              SAVE
                            </button>
                            <button 
                              className="mini-btn" 
                              style={{ height: '22px', padding: '0 4px', fontSize: 9 }}
                              onClick={cancelRenameSavedTab}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="saved-tab-title-group">
                            <span 
                              className="saved-tab-title" 
                              onClick={() => startRenameSavedTab(s)}
                              title="クリックしてタイトル名を編集"
                            >
                              {s.label}
                            </span>
                            <button 
                              type="button"
                              className="saved-tab-title-edit-btn" 
                              onClick={() => startRenameSavedTab(s)}
                              title="名前を編集（「このツールのこと」や「指示書」など）"
                            >
                              ✎
                            </button>
                          </div>
                        )}
                        <span className="saved-tab-meta">
                          {s.text.length} 文字
                        </span>
                      </div>

                      {/* 冒頭プレビュー */}
                      <div 
                        className="saved-tab-preview-text" 
                        title={s.text.slice(0, 160)}
                        onClick={() => openSavedTab(s)}
                        style={{ cursor: 'pointer' }}
                      >
                        {s.text.trim() || "(空のタブ)"}
                      </div>

                      <div className="saved-tab-actions">
                        <span style={{ fontSize: 9, color: 'var(--muted)', marginRight: 'auto', fontFamily: 'var(--title-font)' }}>
                          {new Date(s.savedAt).toLocaleDateString()}
                        </span>
                        <button 
                          className="saved-tab-btn" 
                          type="button" 
                          onClick={() => openSavedTab(s)}
                          title="エディタに新規タブとして開く"
                        >
                          OPEN
                        </button>
                        <button 
                          className="saved-tab-btn delete-btn" 
                          type="button" 
                          onClick={() => requestRemoveSavedTab(s)}
                          title="このタブを削除（確認ダイアログあり）"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    )}

      {/* CONFIRM DIALOG */}
      {confirmDialog && (
        <div className="profile-modal-overlay">
          <div className="profile-modal" style={{ maxWidth: 450 }}>
            <h2 className="profile-modal-title">CONFIRMATION</h2>
            <div className="profile-billing-section">
              <p style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "var(--text)" }}>{confirmDialog.message}</p>
            </div>
            <div className="profile-action-row" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="action-btn" style={{ flex: 1 }} onClick={confirmDialog.onCancel}>CANCEL</button>
              <button className="action-btn" style={{ flex: 1, background: "var(--accent)", color: "#000", borderColor: "var(--accent)" }} onClick={confirmDialog.onConfirm}>OK</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
