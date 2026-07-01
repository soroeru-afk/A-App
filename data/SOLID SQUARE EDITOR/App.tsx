import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const THEMES = {
  dark: {
    bg: "#121722",
    panel: "#191f2c",
    surface: "#212a38",
    surface2: "#1b2432",
    text: "#e8edf7",
    muted: "#8f98aa",
    accent: "#8ea3c7",
    controlAccent: "#8ea3c7",
    border: "#303b4c",
    borderStrong: "#435167"
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
    borderStrong: "#a3afc0"
  },
  black: {
    bg: "#121212",
    panel: "#1b1b1b",
    surface: "#232323",
    surface2: "#1f1f1f",
    text: "#ececec",
    muted: "#9b9b9b",
    accent: "#8a8f99",
    controlAccent: "#8a8f99",
    border: "#303030",
    borderStrong: "#434343"
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
    borderStrong: "#99a5b8"
  },
  red: {
    bg: "#151212",
    panel: "#1f1818",
    surface: "#2b2222",
    surface2: "#241d1d",
    text: "#f0e9e9",
    muted: "#b9a8a8",
    accent: "#c5aa88",
    controlAccent: "#c5aa88",
    border: "#443232",
    borderStrong: "#5a3f3f"
  }
};

const STORAGE_KEY = "solid-square-editor-state-v3";

type Tab = {
  id: string;
  label: string;
  text: string;
  filename: string | null;
  originalText: string;
};

let activeHandles = new Map<string, any>(); // Non-serializable handles
let findCursor = 0;

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("SYSTEM READY (V18)");
  
  const [fontSize, setFontSize] = useState("16");
  const [fontWeight, setFontWeight] = useState("400");
  const [lineHeight, setLineHeight] = useState("1.6");
  const [fontFamily, setFontFamily] = useState("Meiryo, sans-serif");
  
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>("dark");
  const [paperModeEnabled, setPaperModeEnabled] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMinimumMode, setIsMinimumMode] = useState(() => {
    const saved = localStorage.getItem('solidEditor_isMinimumMode');
    return saved === 'true';
  });
  const [isVertical, setIsVertical] = useState(false);
  const [editorText, setEditorText] = useState("");
  
  const [findInput, setFindInput] = useState("");
  const [replaceInput, setReplaceInput] = useState("");
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("left");
  const [currentLine, setCurrentLine] = useState<number>(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ displayName: string, email: string } | null>(null);
  const [showBillingPopup, setShowBillingPopup] = useState(false);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void, onCancel: () => void } | null>(null);

  useEffect(() => {
    localStorage.setItem('solidEditor_isMinimumMode', String(isMinimumMode));
  }, [isMinimumMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const initialData = {
              email: user.email,
              displayName: user.displayName || 'Creator',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, initialData);
            setUserProfile({ displayName: initialData.displayName, email: initialData.email || "" });
          } else {
            const data = userSnap.data();
            setUserProfile({ displayName: data.displayName || "", email: data.email || "" });
          }
        } catch (e) {
          console.error("Error setting up user profile", e);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const handleOpenProfile = () => {
    setEditDisplayName(userProfile?.displayName || "");
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: editDisplayName,
        updatedAt: serverTimestamp()
      });
      setUserProfile(prev => prev ? { ...prev, displayName: editDisplayName } : null);
      setShowProfileModal(false);
    } catch (e) {
      console.error("Failed to update profile", e);
      alert("プロフィールの更新に失敗しました");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Auth error", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
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
        setActiveTheme(loaded.theme || "dark");
        setPaperModeEnabled(Boolean(loaded.paperMode));
        setIsVertical(Boolean(loaded.isVertical));
        
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
      fontSize,
      fontWeight,
      lineHeight,
      fontFamily,
      theme: activeTheme,
      paperMode: paperModeEnabled,
      isVertical
    }));
  }, [tabs, activeTabId, fontSize, fontWeight, lineHeight, fontFamily, activeTheme, paperModeEnabled, isVertical, editorText, isLoaded]);

  // Apply Theme and Paper Mode
  useEffect(() => {
    const root = document.documentElement;
    const t = THEMES[activeTheme] || THEMES.dark;
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
      root.style.setProperty("--editor-bg", "#f4f4f4");
      root.style.setProperty("--editor-text", "#141414");
      root.style.setProperty("--editor-border", "#cecece");
      root.style.setProperty("--editor-shadow-top", "rgba(255, 255, 255, 0.75)");
      root.style.setProperty("--editor-shadow-bottom", "rgba(0, 0, 0, 0.08)");
    } else {
      root.style.setProperty("--editor-bg", "#171717");
      root.style.setProperty("--editor-text", "#f0f0f0");
      root.style.setProperty("--editor-border", "#363636");
      root.style.setProperty("--editor-shadow-top", "rgba(255, 255, 255, 0.02)");
      root.style.setProperty("--editor-shadow-bottom", "rgba(0, 0, 0, 0.45)");
    }
  }, [activeTheme, paperModeEnabled]);

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
    
    if (start !== end) {
      const selected = editorText.slice(start, end);
      const transformed = transformFn(selected);
      const newText = editorText.slice(0, start) + transformed + editorText.slice(end);
      setEditorText(newText);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, start + transformed.length);
        }
      });
    } else {
      setEditorText(transformFn(editorText));
    }
    setStatusText("TEXT TRANSFORMED");
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontWeight(e.target.value);
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
      const newText = editorText.slice(0, start) + replaceInput + editorText.slice(end);
      setEditorText(newText);
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
    setEditorText(editorText.replace(reg, replaceInput));
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
      
      setEditorText(editorText.slice(0, start) + content + editorText.slice(end));
      
      requestAnimationFrame(() => {
         if (textareaRef.current) {
            textareaRef.current.setSelectionRange(start + content.length, start + content.length);
         }
      });
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

  const updateCurrentLine = () => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart;
      const lines = editorText.slice(0, position).split("\n");
      setCurrentLine(lines.length);
    }
  };

  return (
    <main className="app">
      <section className="panel toolbar">
        <div className="title-strip">
          <div className="title-main">SOLID SQUARE EDITOR</div>
          <div className="title-right">
            <div className="auth-ui">
              {currentUser ? (
                <>
                  <div className="auth-user-name" title="PROFILE & SETTINGS" onClick={handleOpenProfile} style={{ cursor: 'pointer' }}>
                    {userProfile?.displayName || currentUser.displayName || 'USER'}
                  </div>
                  <div 
                    className="sign-up-wrap"
                    onMouseEnter={() => setShowBillingPopup(true)}
                    onMouseLeave={() => setShowBillingPopup(false)}
                  >
                    <button className="auth-btn sign-up" onClick={() => {}}>DONATE</button>
                    <div className={`auth-popup ${showBillingPopup ? 'show' : ''}`}>今後ここにStripe決済等のリンクを配置予定です。</div>
                  </div>
                  <button className="auth-btn" onClick={handleSignOut}>SIGN OUT</button>
                </>
              ) : (
                <>
                  <div 
                    className="sign-up-wrap"
                    onMouseEnter={() => setShowBillingPopup(true)}
                    onMouseLeave={() => setShowBillingPopup(false)}
                  >
                    <button className="auth-btn sign-up" onClick={handleSignIn}>SIGN UP</button>
                    <div className={`auth-popup ${showBillingPopup ? 'show' : ''}`}>Googleアカウントで登録・ログインします</div>
                  </div>
                  <button className="auth-btn sign-in" onClick={handleSignIn}>SIGN IN</button>
                </>
              )}
            </div>
            <div className="title-sub">Studio Control Surface</div>
          </div>
        </div>

        {/* MINI HUD STRIP */}
        <div className="mini-strip" style={{ display: isMinimumMode ? 'flex' : 'none' }}>
        <span className="mini-label">SIZE</span>
        <span className="mini-value">{fontSize}PX</span>
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
        <button className="mini-btn-box" title="STRIP HTML" onClick={() => applyTransform(runStripHtml)}>STRIP</button>
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
        <button className="mini-btn-box" title="QUOTE" onClick={() => applyTransform(runQuoteText)}>QT</button>
        <button className="mini-btn-box" title="CHAT" onClick={() => applyTransform(runCleanupChat)}>CHT</button>
        <div className="mini-sep" style={{ marginLeft: 'auto' }}></div>
        <button className="mini-btn-box mini-exit" style={{ marginLeft: 0, paddingLeft: 32, paddingRight: 32 }} onClick={() => setIsMinimumMode(false)}>EXIT FOCUS</button>
        <div className="mini-sep"></div>
        <input type="text" className="mini-input" placeholder="FIND" value={findInput} onChange={e => setFindInput(e.target.value)} />
        <input type="text" className="mini-input" placeholder="REP" value={replaceInput} onChange={e => setReplaceInput(e.target.value)} />
        <button className="mini-btn-box" onClick={findNext}>NEXT</button>
        <button className="mini-btn-box" onClick={replaceCurrent}>SET</button>
        </div>

        <div className="control span-2">
          <div className="label-row">
            <label>01 SIZE</label>
            <span className="value">{fontSize}px</span>
          </div>
          <input className="solid-slider" type="range" min="8" max="200" step="1" value={fontSize} onChange={handleSizeChange} />
        </div>

        <div className="control span-2">
          <div className="label-row">
            <label>02 WEIGHT</label>
            <span className="value">{fontWeight}</span>
          </div>
          <input className="solid-slider" type="range" min="100" max="900" step="100" value={fontWeight} onChange={handleWeightChange} />
        </div>

        <div className="control span-2">
          <div className="label-row">
            <label>03 LEADING</label>
            <span className="value">{Number(lineHeight).toFixed(1)}</span>
          </div>
          <input className="solid-slider" type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={e => setLineHeight(e.target.value)} />
        </div>

        <div className="control span-3">
          <div className="label-row">
            <label>04 FONT FAMILY</label>
          </div>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
            <option value="Meiryo, sans-serif">MEIRYO</option>
            <option value="'MS Gothic', monospace">MS GOTHIC</option>
            <option value="system-ui, sans-serif">SYSTEM UI</option>
            <option value="'Yu Gothic UI', sans-serif">YU GOTHIC UI</option>
            <option value="'Consolas', monospace">CONSOLAS</option>
          </select>
        </div>

        <div className="control span-3">
          <div className="label-row">
            <label>05 FOCUS</label>
          </div>
          <button className="action-btn" onClick={() => setIsMinimumMode(true)} style={{ width: '100%', height: 24, minHeight: 0, fontSize: 11, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.5)' }}>READING FOCUS</button>
        </div>

        <div className="control span-6">
          <div className="label-row">
            <label>08 TRANSFORM ENGINE</label>
          </div>
          <div className="transform-buttons" style={{gridTemplateColumns: "repeat(5, 1fr)"}}>
            <button className="mini-btn" type="button" style={{textTransform: "none"}} title="大文字/小文字切替" onClick={() => applyTransform(runToggleCase)}>A/a</button>
            <button className="mini-btn" type="button" title="全角/半角切替" onClick={() => applyTransform(runToggleZenHan)}>半/全</button>
            <button className="mini-btn" type="button" title="ひらがな/カタカナ切替" onClick={() => applyTransform(runToggleHiraKata)}>あ/ア</button>
            <button className="mini-btn" type="button" title="HTMLタグを除去" onClick={() => applyTransform(runStripHtml)}>STRIP</button>
            <button className="mini-btn" type="button" title="縦組/横組切替" onClick={() => { setIsVertical(v=>!v); setStatusText(!isVertical ? "WRITING MODE: VERTICAL" : "WRITING MODE: HORIZONTAL"); }} style={isVertical ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>横/縦</button>
            
            <button className="mini-btn" type="button" title="左寄せ" onClick={() => { setTextAlignment('left'); setStatusText('ALIGN: LEFT'); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
            </button>
            <button className="mini-btn" type="button" title="中央寄せ" onClick={() => { setTextAlignment('center'); setStatusText('ALIGN: CENTER'); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
            </button>
            <button className="mini-btn" type="button" title="右寄せ" onClick={() => { setTextAlignment('right'); setStatusText('ALIGN: RIGHT'); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
            </button>
            <button className="mini-btn" type="button" title="HTMLペーストモード切替" onClick={() => { setIsHtmlMode(v=>!v); setStatusText(!isHtmlMode ? "HTML PASTE MODE: ON" : "HTML PASTE MODE: OFF"); }} style={isHtmlMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>HTML</button>
            <button className="mini-btn" type="button" title="Markdownプレビュー切替" onClick={() => { setIsPreviewMode(v=>!v); setStatusText(!isPreviewMode ? "PREVIEW MODE: ON" : "PREVIEW MODE: OFF"); }} style={isPreviewMode ? { background: 'var(--accent)', color: '#000', borderColor: 'var(--accent)' } : { color: 'var(--accent)', borderColor: 'var(--accent)' }}>MD</button>
          </div>
        </div>

        <div className="control span-3">
          <div className="label-row">
            <label>09 LINE TOOLS</label>
          </div>
          <div className="transform-buttons" style={{gridTemplateColumns: "repeat(2, 1fr)"}}>
            <button className="mini-btn" title="空行集約とトリミング" onClick={() => applyTransform(runCleanText)}>CLEAN</button>
            <button className="mini-btn" title="全角スペースを半角に" onClick={() => applyTransform(runUnifySpaces)}>UNIFY</button>
            <button className="mini-btn" title="各行に引用符を付与" onClick={() => applyTransform(runQuoteText)}>QUOTE</button>
            <button className="mini-btn" title="チャットログの整形" onClick={() => applyTransform(runCleanupChat)}>CHAT</button>
          </div>
        </div>

        <div className="control span-3">
          <div className="label-row">
            <label>05 THEME BANK</label>
          </div>
          <div className="theme-buttons">
            <button className="theme-btn" aria-pressed={activeTheme === "dark"} onClick={() => {setActiveTheme("dark"); setStatusText("THEME CHANGED: DARK");}}>Dark</button>
            <button className="theme-btn" aria-pressed={activeTheme === "light"} onClick={() => {setActiveTheme("light"); setStatusText("THEME CHANGED: LIGHT");}}>Light</button>
            <button className="theme-btn" aria-pressed={activeTheme === "black"} onClick={() => {setActiveTheme("black"); setStatusText("THEME CHANGED: BLACK");}}>Black</button>
            <button className="theme-btn" aria-pressed={activeTheme === "gray"} onClick={() => {setActiveTheme("gray"); setStatusText("THEME CHANGED: GRAY");}}>Gray</button>
            <button className="theme-btn" aria-pressed={activeTheme === "red"} onClick={() => {setActiveTheme("red"); setStatusText("THEME CHANGED: RED");}}>Red</button>
            <button className="paper-btn" aria-pressed={paperModeEnabled} onClick={() => {setPaperModeEnabled(v=>!v); setStatusText(!paperModeEnabled ? "PAPER MODE: ON" : "PAPER MODE: OFF");}}>Paper Mode</button>
          </div>
        </div>

        <div className="utility-row">
          <div className="compact-control">
            <div className="label-row">
              <label>06 FIND / REPLACE</label>
            </div>
            <div className="search-row">
              <input className="tool-input" type="text" placeholder="FIND KEYWORD" value={findInput} onChange={e => setFindInput(e.target.value)} />
              <input className="tool-input" type="text" placeholder="REPLACE VALUE" value={replaceInput} onChange={e => setReplaceInput(e.target.value)} />
              <button className="mini-btn" type="button" onClick={findNext}>NEXT</button>
              <button className="mini-btn" type="button" onClick={replaceCurrent}>REPLACE</button>
              <button className="mini-btn" type="button" onClick={replaceAll}>REPLACE ALL</button>
            </div>
            <div className="search-clear-row">
              <button className="mini-btn all-clear-btn" type="button" onClick={clearAllFind}>ALL CLEAR</button>
            </div>
          </div>

          <div className="compact-control">
            <div className="label-row">
              <label>07 INFORMATION PANEL</label>
              <div className="char-count">CHARS: {editorText.length.toLocaleString()} | LINE: {currentLine}</div>
            </div>
            <div className="status" style={{ border: 'none', background: 'none', padding: 0, lineHeight: 1.4 }}>{statusText}</div>
          </div>
        </div>
      </section>

      <section className="panel editor-wrap">
        <div className="tab-strip">
          {tabs.map(tab => (
            <div key={tab.id} className="tab-item" aria-selected={tab.id === activeTabId}>
              <span onClick={() => switchTab(tab.id)}>{tab.label}</span>
              <span className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>×</span>
            </div>
          ))}
          <button className="tab-add" onClick={addTab} title="NEW TAB">+</button>
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

      <section className="footer">
        <button className="action-btn" onClick={handleCopy}>COPY</button>
        <button className="action-btn" onClick={() => { setEditorText(''); setStatusText("TEXT CLEARED"); }}>CLEAR</button>
        <button className="action-btn" onClick={openFile}>OPEN</button>
        <button className="action-btn" onClick={overwriteFile}>OVERWRITE</button>
        <button className="action-btn" onClick={saveAsTextFile}>SAVE AS</button>
      </section>

      {/* PROFILE MODAL (DUMMY/SIMPLE) */}
      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            <h2 className="profile-modal-title">PROFILE & SETTINGS</h2>
            
            <div className="profile-form-group">
              <label>DISPLAY NAME</label>
              <input 
                type="text" 
                value={editDisplayName} 
                onChange={e => setEditDisplayName(e.target.value)} 
                placeholder="User Name"
                maxLength={128}
              />
            </div>

            <div className="profile-form-group">
              <label>EMAIL</label>
              <input 
                type="text" 
                value={userProfile?.email || ""} 
                disabled 
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="profile-action-row">
              <button className="action-btn" style={{ width: '100%', marginBottom: 16 }} onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </div>

            <hr className="profile-divider" />

            <h2 className="profile-modal-title">DONATION / BILLING</h2>
            <div className="profile-billing-section">
              <p>Stripe payment and donation link settings will be integrated here.</p>
              <button className="action-btn" style={{ marginTop: 8 }} onClick={() => alert("現在準備中です")}>PAYMENT LINKS</button>
            </div>
            
          </div>
        </div>
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
