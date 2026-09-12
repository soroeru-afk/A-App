import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ChevronDown, Save, PlusSquare, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, ArrowDown, ArrowUp, Copy, Plus, X, List, ArrowRightLeft, Search } from 'lucide-react';
import { Language, t } from '../i18n';
import { SavePartModal } from './SavePartModal';
import { SaveMasterModal } from './SaveMasterModal';
import { SaveMemoModal } from './SaveMemoModal';
import { extractMetadataFromImage } from '../utils/imageMetadata';
import { calculateCursorPos } from '../utils/cursorUtils';


interface PreviewColumnProps {
  tabs?: { id: string, name: string, pos: string, neg: string, isMemo?: boolean }[];
  activeTabId?: string;
  isMemoTab?: boolean;
  onTabChange?: (id: string) => void;
  onTabAdd?: () => void;
  onTabClose?: (id: string) => void;
  onTabsClear?: () => void;
  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
  negativeEditorText: string;
  setNegativeEditorText: React.Dispatch<React.SetStateAction<string>>;
  positiveCursorPos: number | null;
  negativeCursorPos: number | null;
  positiveSelectionEnd?: number | null;
  negativeSelectionEnd?: number | null;
  setPositiveCursorPos: (pos: number) => void;
  setNegativeCursorPos: (pos: number) => void;
  setPositiveSelectionEnd?: (pos: number) => void;
  setNegativeSelectionEnd?: (pos: number) => void;
  activeEditor: 'positive' | 'negative' | 'find' | 'replace';
  findText: string;
  setFindText: React.Dispatch<React.SetStateAction<string>>;
  replaceText: string;
  setReplaceText: React.Dispatch<React.SetStateAction<string>>;
  findCursorPos: number | null;
  replaceCursorPos: number | null;
  findSelectionEnd: number | null;
  replaceSelectionEnd: number | null;
  setFindCursorPos: (pos: number) => void;
  setReplaceCursorPos: (pos: number) => void;
  setFindSelectionEnd: (pos: number) => void;
  setReplaceSelectionEnd: (pos: number) => void;
  setActiveEditor: (editor: 'positive' | 'negative' | 'find' | 'replace') => void;
  onSaveAsMaster?: (title: string, content: string, isNegative: boolean, negativeContent?: string, isUpdate?: boolean) => void;
  onSaveAsPart?: (name: string, content: string, category: string, section: number, items?: {name: string, content: string}[], isUpdate?: boolean) => void;
  onSaveAsMemo?: (name: string, content: string, isUpdate: boolean) => void;
  selectedMemoId?: string | null;
  selectedMemoName?: string;
  selectedMasterId?: string | null;
  selectedMasterName?: string;
  selectedNegativeId?: string | null;
  selectedNegativeName?: string;
  selectedPartId?: string | null;
  selectedPartName?: string;
  uniqueCategories?: [string, number][];
  activeMasterTab?: 'master' | 'negative';
  lang: Language;
  paperMode?: boolean;
  theme?: string;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  autoOptimize?: boolean;
  onToggleAutoOptimize?: () => void;
}

export const PreviewColumn: React.FC<PreviewColumnProps> = ({
  tabs = [],
  activeTabId = '',
  isMemoTab = false,
  onTabChange,
  onTabAdd,
  onTabClose,
  onTabsClear, 
  editorText, setEditorText,
  negativeEditorText, setNegativeEditorText,
  activeEditor, setActiveEditor, findText, setFindText, replaceText, setReplaceText, findCursorPos, setFindCursorPos, replaceCursorPos, setReplaceCursorPos, findSelectionEnd, setFindSelectionEnd, replaceSelectionEnd, setReplaceSelectionEnd, positiveCursorPos, negativeCursorPos, positiveSelectionEnd, negativeSelectionEnd, setPositiveCursorPos, setNegativeCursorPos, setPositiveSelectionEnd, setNegativeSelectionEnd,
  onSaveAsMaster,
  onSaveAsPart,
  onSaveAsMemo,
  selectedMemoId,
  selectedMemoName,
  selectedMasterId,
  selectedMasterName,
  selectedNegativeId,
  selectedNegativeName,
  selectedPartId,
  selectedPartName,
  uniqueCategories = [],
  activeMasterTab = 'master',
  lang,
  paperMode = false,
  theme = 'dark',
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  autoOptimize = true,
  onToggleAutoOptimize
}) => {
  
  const [copied, setCopied] = useState(false);
  
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [searchSelectionActive, setSearchSelectionActive] = useState(false);
  const [appliedFindText, setAppliedFindText] = useState('');

  const positiveHighlightRef = useRef<HTMLDivElement>(null);
  const negativeHighlightRef = useRef<HTMLDivElement>(null);
  
  const positiveTextRef = useRef<HTMLTextAreaElement>(null);
  const negativeTextRef = useRef<HTMLTextAreaElement>(null);
  const findTextRef = useRef<HTMLInputElement>(null);
  const replaceTextRef = useRef<HTMLInputElement>(null);
  const lastUserTextRef = useRef(editorText);
  const lastUserNegativeTextRef = useRef(negativeEditorText);
  const lastFindTextRef = useRef(findText);
  const lastReplaceTextRef = useRef(replaceText);
  
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScroll = (direction: 'left' | 'right') => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    const scroll = () => {
      if (tabsScrollRef.current) {
        tabsScrollRef.current.scrollBy({ left: direction === 'left' ? -10 : 10, behavior: 'auto' });
      }
    };
    scroll();
    scrollIntervalRef.current = setInterval(scroll, 20);
  };

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopScroll();
  }, []);

  
  
  const [isSavePartModalOpen, setIsSavePartModalOpen] = useState(false);
  const [savePartContent, setSavePartContent] = useState('');
  const [savePartDefaultName, setSavePartDefaultName] = useState('');
  const [savePartItems, setSavePartItems] = useState<{name: string, content: string}[] | undefined>(undefined);

    const [isSaveMasterModalOpen, setIsSaveMasterModalOpen] = useState(false);
  const [confirmClearTabs, setConfirmClearTabs] = useState(false);
  const [confirmCloseTabId, setConfirmCloseTabId] = useState<string | null>(null);
  const [isSaveMemoModalOpen, setIsSaveMemoModalOpen] = useState(false);
  const [saveMemoContent, setSaveMemoContent] = useState('');
  const [saveMemoDefaultTitle, setSaveMemoDefaultTitle] = useState('');
  const [saveMasterContent, setSaveMasterContent] = useState('');
  const [saveMasterNegativeContent, setSaveMasterNegativeContent] = useState<string | undefined>(undefined);
  const [saveMasterDefaultTitle, setSaveMasterDefaultTitle] = useState('');
  const [saveMasterIsNegative, setSaveMasterIsNegative] = useState(false);
  const [saveMasterItems, setSaveMasterItems] = useState<{name: string, content: string}[] | undefined>(undefined);

  const parsePromptBlocks = (text: string): { name: string; content: string }[] => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    // 1. Extract blocks starting with ▼ if ▼ exists anywhere in the text
    if (trimmed.includes('▼')) {
      const blocks = trimmed.split(/(?=^▼|\n▼)/).filter(b => b.trim());
      const items: { name: string; content: string }[] = [];
      blocks.forEach(block => {
        const match = block.trim().match(/^▼\s*([^\n]+)\n+([\s\S]*)$/);
        if (match) {
          items.push({ name: match[1].trim(), content: match[2].trim() });
        } else {
          const matchSingle = block.trim().match(/^▼\s*([^\n]+)$/);
          if (matchSingle) {
            items.push({ name: matchSingle[1].trim(), content: '' });
          } else {
            const lines = block.trim().split('\n');
            const name = lines[0].replace(/^▼\s*/, '').trim();
            const content = lines.slice(1).join('\n').trim();
            items.push({ name, content });
          }
        }
      });
      if (items.length > 0) return items;
    }

    // 2. Separate by empty lines (\n\s*\n+)
    const emptyLineBlocks = trimmed.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
    if (emptyLineBlocks.length > 1) {
      const items: { name: string; content: string }[] = [];
      emptyLineBlocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          const name = lines[0];
          const content = lines.slice(1).join('\n');
          items.push({ name, content });
        } else if (lines.length === 1) {
          const line = lines[0];
          const colonIdx = line.search(/[:：]/);
          if (colonIdx > 0 && colonIdx < line.length - 1) {
            items.push({
              name: line.slice(0, colonIdx).trim(),
              content: line.slice(colonIdx + 1).trim()
            });
          } else {
            const title = line.length > 20 ? line.slice(0, 20) + '...' : line;
            items.push({ name: title, content: line });
          }
        }
      });
      if (items.length > 0) return items;
    }

    // 3. Single block with multiple lines where every line has "name: content"
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      const colonLines = lines.filter(l => /[:：]/.test(l));
      if (colonLines.length === lines.length) {
        const items: { name: string; content: string }[] = [];
        lines.forEach(line => {
          const colonIdx = line.search(/[:：]/);
          items.push({
            name: line.slice(0, colonIdx).trim(),
            content: line.slice(colonIdx + 1).trim()
          });
        });
        if (items.length > 0) return items;
      }
    }

    return [];
  };

  const handleSavePartClick = (isNegativeTextarea: boolean) => {
    const text = isNegativeTextarea ? negativeEditorText : editorText;
    if (!text.trim()) return;
    
    const items = parsePromptBlocks(text);
    if (items.length > 0) {
      setSavePartItems(items);
      setSavePartContent('');
      setSavePartDefaultName('');
      setIsSavePartModalOpen(true);
    } else {
      const firstLine = text.trim().split('\n')[0];
      const name = selectedPartId && selectedPartName ? selectedPartName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine);
      setSavePartItems(undefined);
      setSavePartContent(text.trim());
      setSavePartDefaultName(name);
      setIsSavePartModalOpen(true);
    }
  };

  const handleCopy = async (target: 'main' | 'negative' | 'all') => {
    try {
      const cleanEditor = cleanString(editorText);
      const cleanNegative = cleanString(negativeEditorText);
      
      // Update editor state with cleaned version as well
      setEditorText(cleanEditor);
      if (negativeEditorText) setNegativeEditorText(cleanNegative);

      let textToCopy = '';
      if (target === 'main') {
        if (!cleanEditor) return;
        textToCopy = cleanEditor;
      } else if (target === 'negative') {
        if (!cleanNegative) return;
        textToCopy = cleanNegative;
      } else {
        if (!cleanEditor && !cleanNegative) return;
        textToCopy = cleanEditor;
        if (cleanNegative) {
          textToCopy += (textToCopy ? `\n\nNegative Prompt:\n` : `Negative Prompt:\n`) + cleanNegative;
        }
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleFindNext = () => {
    if (!findText) return;
    setAppliedFindText(findText);

    const searchFromPos = (text: string, pos: number, ref: React.RefObject<HTMLTextAreaElement>, setActive: () => void, setCursor: (p: number) => void, setSelectionEnd: (p: number) => void) => {
      const lowerText = text.toLowerCase();
      const lowerFind = findText.toLowerCase();
      let index = lowerText.indexOf(lowerFind, pos);
      if (index === -1) {
        // Wrap around
        index = lowerText.indexOf(lowerFind, 0);
      }
      if (index !== -1) {
        setActive();
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(index, index + findText.length);
          // Browsers usually scroll to selection automatically, but just in case:
          const textBefore = text.substring(0, index);
          const newLines = (textBefore.match(/\n/g) || []).length;
          // Approximate scrolling
          const lineHeight = parseInt(getComputedStyle(ref.current).lineHeight) || 20;
          ref.current.scrollTop = newLines * lineHeight;
        }
        setCursor(index);
        setSelectionEnd(index + findText.length);
        setSearchSelectionActive(true);
        return true;
      }
      return false;
    };

    const isNegativeFocused = activeEditor === 'negative';
    
    if (isNegativeFocused) {
       const foundInNeg = searchFromPos(
         negativeEditorText,
         negativeSelectionEnd !== null && negativeSelectionEnd !== undefined ? negativeSelectionEnd : (negativeCursorPos || 0),
         negativeTextRef,
         () => setActiveEditor('negative'),
         setNegativeCursorPos,
         setNegativeSelectionEnd!
       );
       if (!foundInNeg) {
         searchFromPos(editorText, 0, positiveTextRef, () => setActiveEditor('positive'), setPositiveCursorPos, setPositiveSelectionEnd!);
       }
    } else {
       const foundInPos = searchFromPos(
         editorText,
         positiveSelectionEnd !== null && positiveSelectionEnd !== undefined ? positiveSelectionEnd : (positiveCursorPos || 0),
         positiveTextRef,
         () => setActiveEditor('positive'),
         setPositiveCursorPos,
         setPositiveSelectionEnd!
       );
       if (!foundInPos) {
         searchFromPos(negativeEditorText, 0, negativeTextRef, () => setActiveEditor('negative'), setNegativeCursorPos, setNegativeSelectionEnd!);
       }
    }
  };


  const handleFindPrev = () => {
    if (!findText) return;
    setAppliedFindText(findText);

    const searchFromPos = (text: string, pos: number, ref: React.RefObject<HTMLTextAreaElement>, setActive: () => void, setCursor: (p: number) => void, setSelectionEnd: (p: number) => void) => {
      const lowerText = text.toLowerCase();
      const lowerFind = findText.toLowerCase();
      
      let searchPos = Math.max(0, pos - findText.length - 1);
      let index = lowerText.lastIndexOf(lowerFind, searchPos);
      if (index === -1) {
        // Wrap around
        index = lowerText.lastIndexOf(lowerFind);
      }
      
      if (index !== -1) {
        setActive();
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(index, index + findText.length);
          // Browsers usually scroll to selection automatically, but just in case:
          const textBefore = text.substring(0, index);
          const newLines = (textBefore.match(/\n/g) || []).length;
          const lineHeight = parseInt(getComputedStyle(ref.current).lineHeight) || 20;
          ref.current.scrollTop = newLines * lineHeight;
        }
        setCursor(index);
        setSelectionEnd(index + findText.length);
        setSearchSelectionActive(true);
        return true;
      }
      return false;
    };

    const isNegativeFocused = activeEditor === 'negative';
    
    if (isNegativeFocused) {
       const foundInNeg = searchFromPos(
         negativeEditorText,
         negativeSelectionEnd !== null && negativeSelectionEnd !== undefined ? negativeSelectionEnd : (negativeCursorPos || 0),
         negativeTextRef,
         () => setActiveEditor('negative'),
         setNegativeCursorPos,
         setNegativeSelectionEnd!
       );
       if (!foundInNeg) {
         searchFromPos(editorText, editorText.length, positiveTextRef, () => setActiveEditor('positive'), setPositiveCursorPos, setPositiveSelectionEnd!);
       }
    } else {
       const foundInPos = searchFromPos(
         editorText,
         positiveSelectionEnd !== null && positiveSelectionEnd !== undefined ? positiveSelectionEnd : (positiveCursorPos || 0),
         positiveTextRef,
         () => setActiveEditor('positive'),
         setPositiveCursorPos,
         setPositiveSelectionEnd!
       );
       if (!foundInPos) {
         searchFromPos(negativeEditorText, negativeEditorText.length, negativeTextRef, () => setActiveEditor('negative'), setNegativeCursorPos, setNegativeSelectionEnd!);
       }
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const regex = new RegExp(escapeRegExp(findText), 'i');
    setEditorText(prev => prev.replace(regex, replaceText));
    setNegativeEditorText(prev => prev.replace(regex, replaceText));
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(escapeRegExp(findText), 'gi');
    setEditorText(prev => prev.replace(regex, replaceText));
    setNegativeEditorText(prev => prev.replace(regex, replaceText));
  };
  const cleanString = (text: string, force: boolean = false) => {
    if (!autoOptimize && !force) return text;
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

  const handleCleanText = () => {
    setEditorText(prev => cleanString(prev, true));
    setNegativeEditorText(prev => cleanString(prev, true));
  };

  const applyTransformToSelectionOrAll = (transformFn: (text: string) => string, skipClean: boolean = false) => {
    const isPositive = activeEditor !== 'negative';
    const textarea = isPositive ? positiveTextRef.current : negativeTextRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      let end = textarea.selectionEnd;
      
      if (start !== end) {
        const text = isPositive ? editorText : negativeEditorText;
        
        // Expand selection to include trailing spaces/tabs to fix browser selection limitations
        while (end < text.length && /[ \t\u3000]/.test(text[end])) {
          end++;
        }
        
        const selectedText = text.substring(start, end);
        const transformedText = transformFn(selectedText);
        
        const newText = text.substring(0, start) + transformedText + text.substring(end);
        
        if (isPositive) {
          setEditorText(skipClean ? newText : cleanString(newText));
        } else {
          setNegativeEditorText(skipClean ? newText : cleanString(newText));
        }
        
        setTimeout(() => {
          if (textarea) {
            textarea.setSelectionRange(start, start + transformedText.length);
            textarea.focus();
          }
        }, 0);
        return;
      }
    }
    
    if (isPositive) {
      setEditorText(prev => skipClean ? transformFn(prev) : cleanString(transformFn(prev)));
    } else {
      setNegativeEditorText(prev => skipClean ? transformFn(prev) : cleanString(transformFn(prev)));
    }
  };

  
  const applyTransformToSelectionOrWord = (transformFn: (text: string) => string) => {
    const isPositive = activeEditor !== 'negative';
    const textarea = isPositive ? positiveTextRef.current : negativeTextRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = isPositive ? editorText : negativeEditorText;
      
      let selStart = start;
      let selEnd = end;
      
      // Tokenize text by commas, respecting parentheses
      const tokens: { text: string; start: number; end: number }[] = [];
      let currentStart = 0;
      let inParen = 0;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '(') inParen++;
        else if (text[i] === ')') inParen--;
        
        if (text[i] === ',' && inParen <= 0) {
          tokens.push({ text: text.substring(currentStart, i), start: currentStart, end: i });
          currentStart = i + 1;
        }
      }
      tokens.push({ text: text.substring(currentStart), start: currentStart, end: text.length });
      
      const activeToken = tokens.find(t => t.start <= start && t.end >= start) || tokens[tokens.length - 1];
      let tStart = activeToken.start;
      let tEnd = activeToken.end;

      if (start === end) {
        selStart = tStart;
        selEnd = tEnd;
      } else {
        const startToken = tokens.find(t => t.start <= start && t.end >= start) || tokens[0];
        const endToken = tokens.find(t => t.start <= (end > 0 ? end - 1 : 0) && t.end >= (end > 0 ? end - 1 : 0)) || tokens[tokens.length - 1];
        selStart = startToken.start;
        selEnd = endToken.end;
      }
      
      while(selStart < selEnd && text[selStart].match(/\s/)) selStart++;
      while(selEnd > selStart && text[selEnd-1].match(/\s/)) selEnd--;
      if (selStart >= selEnd) return;
      
      const selectedText = text.substring(selStart, selEnd);
      const transformedText = transformFn(selectedText);
      
      const newText = text.substring(0, selStart) + transformedText + text.substring(selEnd);
      
      if (isPositive) {
        setEditorText(cleanString(newText));
      } else {
        setNegativeEditorText(cleanString(newText));
      }
      
      setTimeout(() => {
        if (textarea) {
          textarea.setSelectionRange(selStart, selStart + transformedText.length);
          textarea.focus();
        }
      }, 0);
    }
  };



  const handleEmphasizeAdd = () => {
    applyTransformToSelectionOrWord((text) => {
      return text.split(',').map(part => {
        let trimmed = part.trim();
        if (!trimmed) return part;
        let weight = 1.0;
        let m = trimmed.match(/:([0-9.]+)[)\]]*$/);
        if (m) {
          weight = parseFloat(m[1]);
        } else if (/^[\(\[]/.test(trimmed)) {
          weight = 1.1;
        }
        
        let clean = trimmed.replace(/[\(\)\[\]]/g, '').replace(/:\s*[0-9.]+/g, '');
        if (!clean) return part;
        
        let newWeight = weight + 0.1;
        newWeight = Math.round(newWeight * 100) / 100;
        return part.replace(trimmed, `(${clean}:${newWeight})`);
      }).join(',');
    });
  };

  const handleEmphasizeRemove = () => {
    applyTransformToSelectionOrWord((text) => {
      return text.split(',').map(part => {
        let trimmed = part.trim();
        if (!trimmed) return part;
        let weight = 1.0;
        let m = trimmed.match(/:([0-9.]+)[)\]]*$/);
        if (m) {
          weight = parseFloat(m[1]);
        } else if (/^[\(\[]/.test(trimmed)) {
          weight = 1.1;
        }
        
        let clean = trimmed.replace(/[\(\)\[\]]/g, '').replace(/:\s*[0-9.]+/g, '');
        if (!clean) return part;
        
        let newWeight = weight - 0.1;
        newWeight = Math.max(0.1, Math.round(newWeight * 100) / 100);
        return part.replace(trimmed, `(${clean}:${newWeight})`);
      }).join(',');
    });
  };

  const handleEmphasizeClear = () => {
    applyTransformToSelectionOrWord((text) => {
      return text.split(',').map(part => {
        let trimmed = part.trim();
        if (!trimmed) return part;
        let clean = trimmed.replace(/[\(\)\[\]]/g, '').replace(/:\s*[0-9.]+/g, '');
        if (!clean) return part;
        return part.replace(trimmed, clean);
      }).join(',');
    });
  };

  const handleEmphasizeChange = (delta: number) => {
    applyTransformToSelectionOrWord((text) => {
      let match = text.match(/^\((.+?):([0-9.]+)\)$/);
      if (match) {
        let newWeight = parseFloat(match[2]) + delta;
        newWeight = Math.max(0.1, Math.round(newWeight * 100) / 100);
        return `(${match[1]}:${newWeight})`;
      }
      match = text.match(/^\((.+?)\)$/);
      if (match) {
        let newWeight = 1.1 + delta;
        newWeight = Math.max(0.1, Math.round(newWeight * 100) / 100);
        return `(${match[1]}:${newWeight})`;
      }
      let newWeight = 1.0 + delta;
      newWeight = Math.max(0.1, Math.round(newWeight * 100) / 100);
      return `(${text}:${newWeight})`;
    });
  };

  const handleFormatVertical = () => {
    const toggle = (text: string) => {
      if (!text || !text.trim()) return text;
      const toVertical = !text.includes('\n');
      
      // Clean up common typos: commas inside weights or at the end of parentheses
      let cleanedText = text.replace(/,\s*(:\d+(\.\d+)?\))/g, '$1'); // (..., :1.5) -> (...:1.5)
      cleanedText = cleanedText.replace(/,\s*\)/g, ')'); // (..., ) -> (...)
      cleanedText = cleanedText.replace(/,\s*\]/g, ']'); // [..., ] -> [...]
      
      // Fix missing commas around parentheses/brackets
      cleanedText = cleanedText.replace(/(\)|\])\s*([^,\])\s])/g, '$1, $2'); // after ) or ]
      cleanedText = cleanedText.replace(/([^,\[(\s])\s*(\(|\[)/g, '$1, $2'); // before ( or [

      const items = cleanedText.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
      
      if (!toVertical) {
        return items.join(', ') + (cleanedText.trim().endsWith(',') ? ',' : '');
      } else {
        return items.join(',\n') + (cleanedText.trim().endsWith(',') ? ',' : '');
      }
    };

    applyTransformToSelectionOrAll(toggle, true);
  };

  const handleFormatComma = () => {
    const toggle = (text: string) => {
      const periodCount = (text.match(/\./g) || []).length;
      const commaCount = (text.match(/,/g) || []).length;
      if (periodCount > 0 && commaCount === 0) {
        return text.replace(/\./g, ',');
      } else if (commaCount > 0 && periodCount === 0) {
        return text.replace(/,/g, '.');
      } else if (periodCount > 0 && commaCount > 0) {
        return text.replace(/[.,]/g, match => match === '.' ? ',' : '.');
      }
      return text;
    };
    applyTransformToSelectionOrAll(toggle, true);
  };

  const handleFormatHyphen = () => {
    const toggle = (text: string) => {
      const periodCount = (text.match(/\./g) || []).length;
      const hyphenCount = (text.match(/-/g) || []).length;
      if (periodCount > 0 && hyphenCount === 0) {
        return text.replace(/\./g, '-');
      } else if (hyphenCount > 0 && periodCount === 0) {
        return text.replace(/-/g, '.');
      } else if (periodCount > 0 && hyphenCount > 0) {
        return text.replace(/[.-]/g, match => match === '.' ? '-' : '.');
      }
      return text;
    };
    applyTransformToSelectionOrAll(toggle, true);
  };

  const runStripHtml = (text: string) => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.left = "-9999px";
    div.style.whiteSpace = "pre-wrap";
    div.style.width = "1000px";
    document.body.appendChild(div);

    div.innerHTML = text.replace(/<iframe/gi, "&lt;iframe");

    div.querySelectorAll("p, div, li, tr, h1, h2, h3, h4").forEach((el) => {
      (el as HTMLElement).style.display = "block";
    });
    div.querySelectorAll("br").forEach(br => br.after("\n"));
    const clean = div.innerText.replace(/\n{3,}/g, "\n\n").trim();
    document.body.removeChild(div);
    return clean;
  };


  
  const handleStripPunctuation = () => {
    const toggle = (text: string) => {
      const commaOrPeriodCount = (text.match(/[.,、。]/g) || []).length;
      if (commaOrPeriodCount > 0) {
        return text.split('\n').map(line => 
          line.replace(/[.,、。]+[ \t\u3000]*/g, ' ').replace(/[ \t\u3000]{2,}/g, ' ').replace(/^[ \t\u3000]+/, '')
        ).join('\n');
      } else {
        return text.split('\n').map(line => 
          line.trim().length > 0 ? line.replace(/[ \t\u3000]+/g, ', ').replace(/, $/, ',') : ''
        ).join('\n');
      }
    };
    applyTransformToSelectionOrAll(toggle, true);
  };

  const handleCleanupChat = () => {
    const toggle = (text: string) => {
      let processText = text;
      if (processText.includes("<") && processText.includes(">")) {
        processText = runStripHtml(processText);
      }

      processText = processText.replace(/\u200B/g, "");

      const lines = processText.split(/\r?\n/).map(l => l.trim());
      const result: string[] = [];
      
      const timeRegex = /^(\d{1,2}:\d{2}|\[\d{1,2}:\d{2}\])/;
      const listRegex = /^(\d+[\.\)）]|[\・\-\*])/; 
      const headingRegex = /^(#+|(\d+[\.\)）]))\s+/;
      const labelRegex = /^([^:：\s]{1,15})[:：]/;
      const speakerRegex = /^(User|ChatGPT|Assistant|Gemini|You|Me|MGR|Manager|カオル|AI|Antigravity)[:：]/i;
      const citationRegex = /^(\+\d+|\[\d+\])$/; 
      
      const keywordHeadingRegex = /^.{1,30}(概要|まとめ|について|方法|原因|対策|手順|ポイント|メモ|注意|ヒント|ステップ|理由|背景|目的|結論|でした|ました|です|さい)$/;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line === "") {
          if (result.length > 0 && result[result.length-1] !== "") {
            result.push("");
          }
          continue;
        }

        if (citationRegex.test(line) && result.length > 0) {
          let lastIdx = result.length - 1;
          while (lastIdx >= 0 && result[lastIdx] === "") lastIdx--;
          if (lastIdx >= 0) {
            result[lastIdx] = result[lastIdx] + " " + line;
            continue;
          }
        }

        const isHeading = headingRegex.test(line) || keywordHeadingRegex.test(line) || (line.length < 25 && (!line.includes("。") || line.length < 15));
        
        const isList = listRegex.test(line);
        const isTime = timeRegex.test(line);
        const isSpeaker = speakerRegex.test(line);
        const isLabel = labelRegex.test(line) && !isTime && !isSpeaker && !isList && !isHeading;

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
          
          if (isHeading || isLabel) {
            const nextLine = (lines[i+1] || "").trim();
            if (nextLine !== "" && !headingRegex.test(nextLine) && !listRegex.test(nextLine) && !labelRegex.test(nextLine) && !keywordHeadingRegex.test(nextLine) && !citationRegex.test(nextLine)) {
              result.push("");
            }
          }
        }
      }

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
    applyTransformToSelectionOrAll(toggle, true);
  };



  const handleSaveSetClick = () => {
    if (!onSaveAsMaster) return;
    const posText = editorText.trim();
    const negText = negativeEditorText.trim();
    if (!posText && !negText) return;
    
    const firstLine = posText ? posText.split('\n')[0] : negText.split('\n')[0];
    const title = selectedMasterId && selectedMasterName ? selectedMasterName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine);
    
    setSaveMasterItems(undefined);
    setSaveMasterContent(posText);
    setSaveMasterNegativeContent(negText);
    setSaveMasterDefaultTitle(title);
    setSaveMasterIsNegative(false);
    setIsSaveMasterModalOpen(true);
  };

  const handleSaveMasterClick = (isNegativeTextarea: boolean, saveAsNegative?: boolean) => {
    setSaveMasterNegativeContent(undefined); // Reset for single save
    if (!onSaveAsMaster) return;
    const text = isNegativeTextarea ? negativeEditorText : editorText;
    const targetIsNegative = saveAsNegative !== undefined ? saveAsNegative : isNegativeTextarea;
    if (!text.trim()) return;

    const items = parsePromptBlocks(text);
    if (items.length > 0) {
      setSaveMasterItems(items);
      setSaveMasterContent('');
      setSaveMasterDefaultTitle('');
      setSaveMasterIsNegative(targetIsNegative);
      setIsSaveMasterModalOpen(true);
    } else {
      const firstLine = text.trim().split('\n')[0];
      const title = targetIsNegative 
        ? (selectedNegativeId && selectedNegativeName ? selectedNegativeName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine))
        : (selectedMasterId && selectedMasterName ? selectedMasterName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine));
      setSaveMasterItems(undefined);
      setSaveMasterContent(text.trim());
      setSaveMasterDefaultTitle(title);
      setSaveMasterIsNegative(targetIsNegative);
      setIsSaveMasterModalOpen(true);
    }
  };

  const handleMergeDupes = () => {
    const processMerge = (text: string) => {
      if (!text || !text.trim()) return text;
      const isVertical = text.includes('\n');
      const parts = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length === 0) return text;
      
      const counts = new Map<string, number>();
      
      parts.forEach(part => {
        let cleanPart = part;
        let weight = 1;
        const match = part.match(/^\((.+?)[: ]x?([0-9.]+)\)$/);
        if (match) {
          cleanPart = match[1].trim();
          weight = parseFloat(match[2]);
        } else if (part.startsWith('(') && part.endsWith(')')) {
          const inner = part.slice(1, -1).trim();
          if (inner && !inner.includes('(') && !inner.includes(')')) {
            cleanPart = inner;
            weight = 1.1;
          }
        }
        counts.set(cleanPart, (counts.get(cleanPart) || 0) + weight);
      });
      
      let maxWeight = 0;
      for (const count of counts.values()) {
        if (count > maxWeight) maxWeight = count;
      }
      
      const scaleFactor = maxWeight > 1.4 ? maxWeight / 1.4 : 1;
      
      const result = [];
      for (const [part, count] of counts.entries()) {
        let newWeight = count / scaleFactor;
        
        // Lower limit guard
        if (newWeight < 0.1 && count > 0) {
          newWeight = 0.1;
        }
        
        const finalCount = Math.round(newWeight * 100) / 100;
        
        if (finalCount === 1) {
          result.push(part);
        } else {
          result.push(`(${part}:${finalCount})`);
        }
      }
      const separator = isVertical ? ',\n' : ', ';
      return result.join(separator);
    };

    applyTransformToSelectionOrAll(processMerge, false);
  };

  const handleClearAllWeights = () => {
    const processClear = (text: string) => {
      return text.split(',').map(part => {
        const trimmed = part.trim();
        const clean = trimmed.replace(/[\(\)\[\]]/g, '').replace(/:\s*[0-9.]+/g, '');
        return clean;
      }).filter(Boolean).join(', ');
    };

    if (activeMasterTab === 'master') {
      setEditorText(prev => processClear(prev));
    } else if (activeMasterTab === 'negative') {
      setNegativeEditorText(prev => processClear(prev));
    }
  };


  const handleAdjustWeights = (delta: number) => {
    const isPositive = activeMasterTab === 'master';
    const textarea = isPositive ? positiveTextRef.current : negativeTextRef.current;
    if (!textarea) return;

    const text = isPositive ? editorText : negativeEditorText;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const isSelected = start !== end;

    const processText = (targetText: string) => {
      return targetText.replace(/\(([^)]+?)[: ]([0-9.]+)\)/g, (fullMatch, content, weightStr) => {
        const weight = parseFloat(weightStr);
        if (isNaN(weight)) return fullMatch;
        const newWeight = Math.max(0.1, weight + delta);
        const finalWeightStr = parseFloat(newWeight.toFixed(2)).toString();
        return `(${content}:${finalWeightStr})`;
      });
    };

    if (isSelected) {
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end);
      
      const newSelected = processText(selected);
      const newText = before + newSelected + after;
      
      if (isPositive) {
        setEditorText(newText);
      } else {
        setNegativeEditorText(newText);
      }
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(start, start + newSelected.length);
        }
      }, 0);
    } else {
      if (isPositive) {
        setEditorText(processText(text));
      } else {
        setNegativeEditorText(processText(text));
      }
    }
  };

  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, isNegative: boolean) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;

    if (e.key === 'Enter' && hasSelection) {
      e.preventDefault();
      textarea.setSelectionRange(end, end);
      return;
    }
    
    // Alt + Up/Down OR (Selection exists and Up/Down without Shift)
    const isMoveUp = e.key === 'ArrowUp' && (e.altKey || (!e.shiftKey && hasSelection));
    const isMoveDown = e.key === 'ArrowDown' && (e.altKey || (!e.shiftKey && hasSelection));

    if (isMoveUp || isMoveDown) {
      e.preventDefault();
      const text = isNegative ? negativeEditorText : editorText;

      let lineStart = text.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = text.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = text.length;

      const selectedLines = text.substring(lineStart, lineEnd);
      
      if (isMoveUp && lineStart > 0) {
        const prevLineStart = text.lastIndexOf('\n', lineStart - 2) + 1;
        const prevLine = text.substring(prevLineStart, lineStart - 1);
        const newText = text.substring(0, prevLineStart) + selectedLines + '\n' + prevLine + text.substring(lineEnd);
        const newSelectionStart = prevLineStart;
        const newSelectionEnd = prevLineStart + selectedLines.length;

        if (isNegative) {
          setNegativeEditorText(newText);
        } else {
          setEditorText(newText);
        }
        
        setTimeout(() => {
          textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }, 0);
      } else if (isMoveDown && lineEnd < text.length) {
        let nextLineEnd = text.indexOf('\n', lineEnd + 1);
        if (nextLineEnd === -1) nextLineEnd = text.length;
        const nextLine = text.substring(lineEnd + 1, nextLineEnd);
        const newText = text.substring(0, lineStart) + nextLine + '\n' + selectedLines + text.substring(nextLineEnd);
        const newSelectionStart = lineStart + nextLine.length + 1;
        const newSelectionEnd = newSelectionStart + selectedLines.length;
        
        if (isNegative) {
          setNegativeEditorText(newText);
        } else {
          setEditorText(newText);
        }

        setTimeout(() => {
          textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }, 0);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, isNegative: boolean) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      let content = runStripHtml(html);
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      
      const currentText = isNegative ? negativeEditorText : editorText;
      const rawNewText = currentText.slice(0, start) + content + currentText.slice(end);
      const newText = rawNewText;
      
      const after = currentText.slice(end);
      const isAtEnd = after.replace(/[\s,]/g, '').length === 0;
      const before = currentText.slice(0, start);
      const finalPos = calculateCursorPos(before, content, newText, isAtEnd);
      
      if (isNegative) {
        setNegativeEditorText(newText);
        setNegativeCursorPos(finalPos);
      } else {
        setEditorText(newText);
        setPositiveCursorPos(finalPos);
      }
      
      requestAnimationFrame(() => {
         textarea.setSelectionRange(finalPos, finalPos);
      });
    }
  };

  const handleOptimizeSyntax = () => {
    const process = (text: string) => {
      if (/\({2,}/.test(text)) {
        return text.replace(/(\(+)([^():]+?)(\)+)/g, (match, p1, p2, p3) => {
          const depth = Math.min(p1.length, p3.length);
          if (depth > 1) {
            const extraLeft = p1.slice(depth);
            const extraRight = p3.slice(0, p3.length - depth);
            const val = 1.0 + (depth * 0.1); 
            return `${extraLeft}(${p2}:${val.toFixed(1)})${extraRight}`;
          }
          return match;
        });
      } else {
        return text.replace(/\(([^():]+?):([0-9.]+)\)/g, (match, p1, p2) => {
          const val = parseFloat(p2);
          if (val > 1.0) {
            const depth = Math.round((val - 1.0) * 10);
            if (depth > 1 && depth <= 10) {
              return '('.repeat(depth) + p1 + ')'.repeat(depth);
            }
          }
          return match;
        });
      }
    };
    
    applyTransformToSelectionOrAll(process);
  };

  const handleUppercase = () => {
    applyTransformToSelectionOrAll(text => text.toUpperCase());
  };

  const handleLowercase = () => {
    applyTransformToSelectionOrAll(text => text.toLowerCase());
  };

  const [editorFontSize, setEditorFontSize] = useState(() => {
    const saved = localStorage.getItem('editorFontSize');
    return saved ? parseInt(saved, 10) : 14;
  });

  const [editorLineHeight, setEditorLineHeight] = useState(() => {
    const saved = localStorage.getItem('editorLineHeight');
    return saved ? parseFloat(saved) : 1.625;
  });
  

  useEffect(() => {
    localStorage.setItem('editorFontSize', editorFontSize.toString());
  }, [editorFontSize]);

  useEffect(() => {
    localStorage.setItem('editorLineHeight', editorLineHeight.toString());
  }, [editorLineHeight]);

  const [editorFontWeight, setEditorFontWeight] = useState(() => {
    return localStorage.getItem('editorFontWeight') || '400';
  });

  useEffect(() => {
    localStorage.setItem('editorFontWeight', editorFontWeight);
  }, [editorFontWeight]);


  
  
  const [negativeHeight, setNegativeHeight] = useState(120);
  const [isNegativeOpen, setIsNegativeOpen] = useState(true);
  const [isPositiveOpen, setIsPositiveOpen] = useState(true);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [isResizing, setIsResizing] = useState(false);


  useLayoutEffect(() => {
    if (editorText !== lastUserTextRef.current) {
      if (positiveTextRef.current && positiveCursorPos !== null) {
        positiveTextRef.current.setSelectionRange(positiveCursorPos, positiveCursorPos);
        if (activeEditor === 'positive') {
          positiveTextRef.current.focus();
        }
      }
      lastUserTextRef.current = editorText;
    }
  }, [editorText, positiveCursorPos, activeEditor]);

  useLayoutEffect(() => {
    if (negativeEditorText !== lastUserNegativeTextRef.current) {
      if (negativeTextRef.current && negativeCursorPos !== null) {
        negativeTextRef.current.setSelectionRange(negativeCursorPos, negativeCursorPos);
        if (activeEditor === 'negative') {
          negativeTextRef.current.focus();
        }
      }
      lastUserNegativeTextRef.current = negativeEditorText;
    }
  }, [negativeEditorText, negativeCursorPos, activeEditor]);

  useLayoutEffect(() => {
    if (findText !== lastFindTextRef.current) {
      if (findTextRef.current && findCursorPos !== null) {
        findTextRef.current.setSelectionRange(findCursorPos, findCursorPos);
        if (activeEditor === 'find') {
          findTextRef.current.focus();
        }
      }
      lastFindTextRef.current = findText;
    }
  }, [findText, findCursorPos, activeEditor]);

  useLayoutEffect(() => {
    if (replaceText !== lastReplaceTextRef.current) {
      if (replaceTextRef.current && replaceCursorPos !== null) {
        replaceTextRef.current.setSelectionRange(replaceCursorPos, replaceCursorPos);
        if (activeEditor === 'replace') {
          replaceTextRef.current.focus();
        }
      }
      lastReplaceTextRef.current = replaceText;
    }
  }, [replaceText, replaceCursorPos, activeEditor]);


const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = negativeHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = dragStartY.current - e.clientY;
      const newHeight = Math.max(60, Math.min(800, dragStartHeight.current + delta));
      setNegativeHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useLayoutEffect(() => {
    if (positiveTextRef.current && positiveHighlightRef.current) {
      positiveHighlightRef.current.scrollTop = positiveTextRef.current.scrollTop;
      positiveHighlightRef.current.scrollLeft = positiveTextRef.current.scrollLeft;
    }
  }, [editorText]);

  useLayoutEffect(() => {
    if (negativeTextRef.current && negativeHighlightRef.current) {
      negativeHighlightRef.current.scrollTop = negativeTextRef.current.scrollTop;
      negativeHighlightRef.current.scrollLeft = negativeTextRef.current.scrollLeft;
    }
  }, [negativeEditorText]);

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDropFile = async (e: React.DragEvent<HTMLTextAreaElement>, isNegative: boolean) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('image/')) {
        const metadata = await extractMetadataFromImage(file);
        if (metadata) {
          let pos = '';
          let neg = '';
          if (metadata.positive) {
            pos = metadata.positive;
            setEditorText(prev => cleanString(prev ? prev + '\n' + metadata.positive : metadata.positive));
          }
          if (metadata.negative) {
            neg = metadata.negative;
            setNegativeEditorText(prev => cleanString(prev ? prev + '\n' + metadata.negative : metadata.negative));
          }
          if (pos || neg) {
            window.dispatchEvent(new CustomEvent('restore_mixer_from_prompt', {
              detail: { positive: pos, negative: neg }
            }));
          }
        }
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            if (isNegative) {
              setNegativeEditorText(prev => cleanString(prev ? prev + '\n' + content : content));
            } else {
              setEditorText(prev => cleanString(prev ? prev + '\n' + content : content));
            }
          }
        };
        reader.readAsText(file);
      }
    }
  };

      const handleMoveSelection = (position: 'start' | 'end') => {
    const isPositive = activeEditor !== 'negative';
    const textarea = isPositive ? positiveTextRef.current : negativeTextRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = isPositive ? editorText : negativeEditorText;
    
    const isCurrentlyVertical = currentText.includes('\n');
    const delimiter = isCurrentlyVertical ? ',\n' : ', ';

    // Tokenize text by commas or newlines, respecting parentheses
    const rawTokens: { text: string; start: number; end: number }[] = [];
    let currentStart = 0;
    let inParen = 0;
    for (let i = 0; i < currentText.length; i++) {
      if (currentText[i] === '(') inParen++;
      else if (currentText[i] === ')') inParen--;
      
      if ((currentText[i] === ',' || currentText[i] === '\n') && inParen <= 0) {
        rawTokens.push({ text: currentText.substring(currentStart, i), start: currentStart, end: i });
        currentStart = i + 1;
      }
    }
    rawTokens.push({ text: currentText.substring(currentStart), start: currentStart, end: currentText.length });

    const tokens = rawTokens.filter(t => t.text.trim().length > 0);
    if (tokens.length === 0) return;

    let selStart = start;
    let selEnd = end;
    if (start === end) {
      let activeToken = tokens.find(t => t.start <= start && t.end >= start);
      if (!activeToken) {
        activeToken = tokens.slice().reverse().find(t => t.end < start) || tokens[0];
      }
      selStart = activeToken.start;
      selEnd = activeToken.end;
      while (selStart < selEnd && currentText[selStart].match(/\s/)) selStart++;
      while (selEnd > selStart && currentText[selEnd - 1].match(/\s/)) selEnd--;
      if (selStart >= selEnd) return;
    }
    
    // Find selected tokens
    let startIndex = tokens.findIndex(t => t.end >= selStart && t.start <= selStart);
    let endIndex = tokens.findIndex(t => t.end >= (selEnd > selStart ? selEnd - 1 : selEnd) && t.start <= (selEnd > selStart ? selEnd - 1 : selEnd));
    
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = tokens.length - 1;

    const selectedTokens = tokens.slice(startIndex, endIndex + 1);
    const unselectedTokens = tokens.filter((_, i) => i < startIndex || i > endIndex);

    let newTokensList = [];
    if (position === 'start') {
      newTokensList = [...selectedTokens, ...unselectedTokens];
    } else {
      newTokensList = [...unselectedTokens, ...selectedTokens];
    }

    let newText = '';
    let newSelectionStart = -1;
    let newSelectionEnd = -1;
    const selectedTokensSet = new Set(selectedTokens);

    for (let i = 0; i < newTokensList.length; i++) {
      const t = newTokensList[i];
      const cleanText = t.text.trim();
      if (!cleanText) continue;
      
      if (newText.length > 0) {
        newText += delimiter;
      }
      
      const isSelected = selectedTokensSet.has(t);
      if (isSelected && newSelectionStart === -1) {
        newSelectionStart = newText.length;
      }
      
      newText += cleanText;
      
      if (isSelected) {
        newSelectionEnd = newText.length;
      }
    }
    
    if (isPositive) {
      setEditorText(newText);
    } else {
      setNegativeEditorText(newText);
    }
    
    setTimeout(() => {
      if (textarea && newSelectionStart !== -1) {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };

  const handleMoveSelectionStep = (direction: 'left' | 'right') => {
    const isPositive = activeEditor !== 'negative';
    const textarea = isPositive ? positiveTextRef.current : negativeTextRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = isPositive ? editorText : negativeEditorText;

    const isCurrentlyVertical = currentText.includes('\n');
    const delimiter = isCurrentlyVertical ? ',\n' : ', ';

    // Tokenize text by commas or newlines, respecting parentheses
    const rawTokens: { text: string; start: number; end: number }[] = [];
    let currentStart = 0;
    let inParen = 0;
    for (let i = 0; i < currentText.length; i++) {
      if (currentText[i] === '(') inParen++;
      else if (currentText[i] === ')') inParen--;
      
      if ((currentText[i] === ',' || currentText[i] === '\n') && inParen <= 0) {
        rawTokens.push({ text: currentText.substring(currentStart, i), start: currentStart, end: i });
        currentStart = i + 1;
      }
    }
    rawTokens.push({ text: currentText.substring(currentStart), start: currentStart, end: currentText.length });

    const tokens = rawTokens.filter(t => t.text.trim().length > 0);
    if (tokens.length === 0) return;

    let selStart = start;
    let selEnd = end;
    if (start === end) {
      let activeToken = tokens.find(t => t.start <= start && t.end >= start);
      if (!activeToken) {
        activeToken = tokens.slice().reverse().find(t => t.end < start) || tokens[0];
      }
      selStart = activeToken.start;
      selEnd = activeToken.end;
      while (selStart < selEnd && currentText[selStart].match(/\s/)) selStart++;
      while (selEnd > selStart && currentText[selEnd - 1].match(/\s/)) selEnd--;
      if (selStart >= selEnd) return;
    }

    // Find selected tokens
    let startIndex = tokens.findIndex(t => t.end >= selStart && t.start <= selStart);
    let endIndex = tokens.findIndex(t => t.end >= (selEnd > selStart ? selEnd - 1 : selEnd) && t.start <= (selEnd > selStart ? selEnd - 1 : selEnd));
    
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = tokens.length - 1;
    
    const selectedTokensSet = new Set(tokens.slice(startIndex, endIndex + 1));

    if (direction === 'left' && startIndex > 0) {
      const prev = tokens[startIndex - 1];
      const selected = tokens.slice(startIndex, endIndex + 1);
      tokens.splice(startIndex - 1, endIndex - startIndex + 2, ...selected, prev);
    } else if (direction === 'right' && endIndex < tokens.length - 1) {
      const next = tokens[endIndex + 1];
      const selected = tokens.slice(startIndex, endIndex + 1);
      tokens.splice(startIndex, endIndex - startIndex + 2, next, ...selected);
    } else {
      return; // Cannot move further
    }
    
    // Reconstruct text
    let newText = '';
    let newSelectionStart = -1;
    let newSelectionEnd = -1;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const cleanText = t.text.trim();
      if (!cleanText) continue;
      
      if (newText.length > 0) {
        newText += delimiter;
      }
      
      const isSelected = selectedTokensSet.has(t);
      if (isSelected && newSelectionStart === -1) {
        newSelectionStart = newText.length;
      }
      
      newText += cleanText;
      
      if (isSelected) {
        newSelectionEnd = newText.length;
      }
    }
    
    if (isPositive) {
      setEditorText(newText);
    } else {
      setNegativeEditorText(newText);
    }
    
    setTimeout(() => {
      if (textarea && newSelectionStart !== -1) {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };

  const handleMoveTextBetweenEditors = (direction: 'down' | 'up') => {
    if (direction === 'down') {
      const textarea = positiveTextRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;
      const selectedText = editorText.substring(start, end).trim();
      const newEditorText = editorText.substring(0, start) + editorText.substring(end);
      setEditorText(cleanString(newEditorText));
      
      const newNegativeText = negativeEditorText ? `${negativeEditorText}, ${selectedText}` : selectedText;
      setNegativeEditorText(cleanString(newNegativeText));
    } else {
      const textarea = negativeTextRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;
      const selectedText = negativeEditorText.substring(start, end).trim();
      const newNegativeText = negativeEditorText.substring(0, start) + negativeEditorText.substring(end);
      setNegativeEditorText(cleanString(newNegativeText));
      
      const newEditorText = editorText ? `${editorText}, ${selectedText}` : selectedText;
      setEditorText(cleanString(newEditorText));
    }
  };

  const handleCopyTextBetweenEditors = (direction: 'down' | 'up') => {
    if (direction === 'down') {
      const textarea = positiveTextRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;
      const selectedText = editorText.substring(start, end).trim();
      
      const newNegativeText = negativeEditorText ? `${negativeEditorText}, ${selectedText}` : selectedText;
      setNegativeEditorText(cleanString(newNegativeText));
    } else {
      const textarea = negativeTextRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) return;
      const selectedText = negativeEditorText.substring(start, end).trim();
      
      const newEditorText = editorText ? `${editorText}, ${selectedText}` : selectedText;
      setEditorText(cleanString(newEditorText));
    }
  };

  const renderHighlightedText = (text: string, isNegative: boolean) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    const highlightBgClass = isLight ? 'bg-[#059669]' : 'bg-[#34d399]';

    let currentGlobalIndex = 0;

    const parenParts = text.split(/(\([^)]+\))/g);

    return parenParts.map((parenPart, i) => {
      const isParen = parenPart.startsWith('(') && parenPart.endsWith(')');
      const baseClass = isParen ? highlightColorClass : '';

      if (appliedFindText) {
        const searchRegex = new RegExp(`(${escapeRegExp(appliedFindText)})`, 'gi');
        const searchParts = parenPart.split(searchRegex);

        return searchParts.map((sPart, j) => {
          const partStartIndex = currentGlobalIndex;
          currentGlobalIndex += sPart.length;

          if (sPart.toLowerCase() === appliedFindText.toLowerCase()) {
            const cursorPos = isNegative ? negativeCursorPos : positiveCursorPos;
            const isActiveEditor = activeEditor === (isNegative ? 'negative' : 'positive');
            const isMatchActive = searchSelectionActive && isActiveEditor && cursorPos !== null && partStartIndex === cursorPos;

            if (isMatchActive) {
              const activeStyle = 'bg-blue-600 text-white';

              return (
                <span key={`find-${i}-${j}`} className={`${activeStyle} rounded-[2px] z-10 relative`}>
                  {sPart}
                </span>
              );
            } else {
              return (
                <span key={`find-${i}-${j}`} className={`bg-amber-500/40 rounded-[2px] ${baseClass}`}>
                  {sPart}
                </span>
              );
            }
          }

          return <span key={`text-${i}-${j}`} className={baseClass}>{sPart}</span>;
        });
      }

      currentGlobalIndex += parenPart.length;
      return <span key={`text-${i}`} className={baseClass}>{parenPart}</span>;
    });
  };

  const charCount = (editorText?.length || 0) + (negativeEditorText?.length || 0);
  const MAX_CHARS = 4096;

  return (
    <>
      
      {/* Top Header: Title, Auto Optimize, Char count */}
      <div className="p-2 border-b border-border-main flex items-center justify-between bg-bg-panel shrink-0 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-text-main font-bold uppercase tracking-widest hidden lg:inline">{t('output_synthesis', lang)}</span>
          <button 
            onClick={onToggleAutoOptimize}
            className={`px-2 py-1 text-[9px] font-mono border rounded outline-none transition-colors bg-transparent ${autoOptimize 
              ? 'border-border-main text-text-main' 
              : 'border-border-main/50 text-text-dim hover:text-text-main'}`}
          >
            {autoOptimize ? t('auto_optimize_on', lang) : t('auto_optimize_off', lang)}
          </button>
        </div>
        <div className="text-[10px] font-mono text-text-dim shrink-0">
          <span className="font-bold hidden sm:inline">CHAR:</span> {charCount} / {MAX_CHARS}
        </div>
      </div>

      {/* Tools Header: Search, Replace, Copy */}
      <div className="p-2 border-b border-border-main flex flex-wrap items-center justify-between bg-bg-panel shrink-0 gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 flex-1">
          <div className="flex items-center gap-1 shrink-0">
            <div className="relative flex items-center">
              <input 
                ref={findTextRef}
                type="text" 
                placeholder={t('find', lang)} 
                value={findText}
                onChange={e => {
                  setFindText(e.target.value);
                  if (e.target.value === '') setAppliedFindText('');
                  setActiveEditor('find');
                  setFindCursorPos(e.target.selectionStart || 0);
                  setFindSelectionEnd(e.target.selectionEnd || 0);
                }}
                onSelect={(e) => {
                  setActiveEditor('find');
                  setFindCursorPos(e.currentTarget.selectionStart || 0);
                  setFindSelectionEnd(e.currentTarget.selectionEnd || 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) handleFindPrev();
                    else handleFindNext();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  const text = e.dataTransfer.getData('text/plain');
                  if (text) {
                    setFindText(text);
                    if (text === '') setAppliedFindText('');
                    setActiveEditor('find');
                  }
                }}
                className={`w-28 pl-2 pr-6 py-1.5 ${theme === 'mono' ? 'bg-bg-input text-text-main hover:bg-gray-500' : 'bg-bg-input text-text-main border-border-main hover:border-border-hover'} text-[10px] font-mono border rounded outline-none transition-colors`}
              />
              {findText && (
                <button
                  onClick={() => {
                    setFindText('');
                    setAppliedFindText('');
                    setActiveEditor('find');
                    if (findTextRef.current) findTextRef.current.focus();
                  }}
                  className="absolute right-1 text-text-dim hover:text-text-main transition-colors"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex -space-x-px">
              <button 
                onClick={() => {
                  if (!findText) return;
                  handleFindNext();
                }}
                className={`shrink-0 flex items-center justify-center px-2 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] border border-border-hover rounded-l text-text-dim transition-colors`}
                title={lang === 'en' ? 'Search' : '検索'}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleFindPrev}
                className={`shrink-0 whitespace-nowrap px-2 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover text-text-dim transition-colors`}
                title="Shift+Enter"
              >
                {lang === 'en' ? 'Prev' : '前へ'}
              </button>
              <button 
                onClick={handleFindNext}
                className={`shrink-0 whitespace-nowrap px-2 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-r text-text-dim transition-colors`}
                title="Enter"
              >
                {lang === 'en' ? 'Next' : '次へ'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <input 
              ref={replaceTextRef}
              type="text" 
              placeholder={t('replace', lang)} 
              value={replaceText}
              onChange={e => {
                setReplaceText(e.target.value);
                setActiveEditor('replace');
                setReplaceCursorPos(e.target.selectionStart || 0);
                setReplaceSelectionEnd(e.target.selectionEnd || 0);
              }}
              onSelect={(e) => {
                setActiveEditor('replace');
                setReplaceCursorPos(e.currentTarget.selectionStart || 0);
                setReplaceSelectionEnd(e.currentTarget.selectionEnd || 0);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const text = e.dataTransfer.getData('text/plain');
                if (text) setReplaceText(text);
              }}
              className="bg-bg-input border border-border-main text-[11px] font-mono px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600 w-[120px] shrink-0"
            />
            <button 
              onClick={handleReplace}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
            >
              {t('replace', lang)}
            </button>
            <button 
              onClick={handleReplaceAll}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
            >
              {t('replace_all', lang)}
            </button>
          </div>

          <div className="relative flex items-center shrink-0 ml-2">
            <button 
              onClick={() => setShowFormatOptions(!showFormatOptions)}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 ${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded ${showFormatOptions ? 'text-text-main bg-border-main/50' : 'text-text-dim'} transition-colors shrink-0`}
            >
              {lang === 'en' ? 'Format...' : 'テキスト整理...'}
            </button>
            
            {showFormatOptions && (
              <div className="absolute top-[calc(100%+4px)] left-0 bg-bg-panel border border-border-main rounded-md shadow-xl flex flex-col gap-1.5 p-2 z-[100] min-w-[200px]">
                <button 
                  onClick={handleFormatComma}
                  className={`px-3 h-[28px] ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2`}
                  title="Toggle periods and commas"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">,</span>
                </button>
                <button 
                  onClick={handleFormatHyphen}
                  className={`px-3 h-[28px] ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2`}
                  title="Toggle periods and hyphens"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">-</span>
                </button>
                <button 
                  onClick={handleStripPunctuation}
                  className={`px-3 h-[28px] ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} font-mono border border-border-hover rounded transition-colors flex items-center justify-center gap-2`}
                  title="Toggle punctuation and spaces"
                >
                  <span className="text-[12px] font-bold bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-text-main">.,</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-text-dim opacity-80" />
                  <span className="text-[10px] font-bold text-text-dim leading-none">{lang === 'en' ? 'SPACE' : '空白'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden xl:block w-px h-6 bg-border-main mx-1 shrink-0"></div>
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <span className="text-[10px] font-mono text-text-dim mr-1 flex items-center gap-1 font-bold">
            <Copy className="w-3.5 h-3.5" /> COPY
          </span>
          <button 
            onClick={() => handleCopy('main')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_main', lang)}
          </button>
          <button 
            onClick={() => handleCopy('negative')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_negative_only', lang)}
          </button>
          <button 
            onClick={() => handleCopy('all')}
            className="shrink-0 w-20 h-8 text-[10px] font-mono font-bold rounded transition-colors bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white text-center"
          >
            {t('copy_all', lang)}
          </button>
        </div>
      </div>

      {/* Editor Toolbar (Rest) */}
      <div className="p-2 border-b border-border-main bg-bg-base flex flex-wrap items-center gap-2 shrink-0">
        {(() => {
          const text = activeEditor !== 'negative' ? editorText : negativeEditorText;
          const isVertical = text && text.includes('\n');
          return (
            <button 
              onClick={handleFormatVertical}
              className={`w-[124px] h-8 px-3 text-[10px] whitespace-nowrap font-bold font-mono border-2 ${theme === 'light' || theme === 'mono' ? 'bg-gray-200 hover:bg-gray-300 text-black border-gray-400' : 'border-white text-white bg-bg-input hover:bg-white hover:text-black'} rounded transition-colors flex items-center justify-center gap-1.5`}
              title={lang === 'en' ? "Toggle vertical/horizontal list" : "縦/横リストの切り替え"}
            >
              <List size={14} className={`${theme === 'light' || theme === 'mono' ? 'text-black' : ''}`} />
              {lang === 'en' ? (isVertical ? 'To Horizontal' : 'To Vertical') : (isVertical ? '横並びに戻す' : '縦リストに変換')}
            </button>
          );
        })()}
        <div className="w-px h-6 bg-border-main mx-1"></div>
        <button 
          onClick={handleMergeDupes}
          className={`px-3 h-8 text-[10px] font-mono border rounded transition-colors ${
            (theme === 'light' || theme === 'mono') 
              ? 'bg-[#3b5323]/10 hover:bg-[#3b5323]/20 border-[#3b5323]/60 text-[#3b5323]' 
              : 'bg-[#7a9a5a]/10 hover:bg-[#7a9a5a]/20 border-[#7a9a5a]/50 text-[#9bb87d]'
          }`}
          title="Merge duplicate phrases"
        >
          {t('merge_dupes', lang)}
        </button>
        <button 
          onClick={handleClearAllWeights}
          className={`px-3 h-8 text-[10px] font-mono border rounded transition-colors ${
            (theme === 'light' || theme === 'mono') 
              ? 'bg-[#991b1b]/10 hover:bg-[#991b1b]/20 border-[#991b1b]/60 text-[#991b1b]' 
              : 'bg-[#fca5a5]/10 hover:bg-[#fca5a5]/20 border-[#fca5a5]/50 text-[#fca5a5]'
          }`}
          title="Clear all emphasis weights from text"
        >
          {t('clear_all_weights', lang)}
        </button>
        <div className="flex items-center space-x-1 px-2 h-8 box-border bg-bg-input border border-border-main rounded shrink-0">
          <span className="text-[10px] font-mono text-text-dim pr-1">{t('global_weight', lang)}</span>
          <button 
            onClick={() => handleAdjustWeights(-0.1)}
            className="px-2 py-0.5 bg-bg-surface hover:bg-blue-500/10 text-[12px] font-mono border border-blue-500/50 rounded text-blue-500 transition-colors"
            title="Decrease weight by 0.1 (applies to selection or all)"
          >
            -0.1
          </button>
          <button 
            onClick={() => handleAdjustWeights(0.1)}
            className="px-2 py-0.5 bg-bg-surface hover:bg-red-500/10 text-[12px] font-mono border border-red-500/50 rounded text-red-500 transition-colors"
            title="Increase weight by 0.1 (applies to selection or all)"
          >
            +0.1
          </button>
        </div>

        <button 
          onClick={() => handleMoveSelection('start')}
          className={`px-3 h-8 ml-2 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
          title={t('move_to_front_tooltip', lang)}
        >
          {t('move_to_front', lang)}
        </button>
        <button 
          onClick={() => handleMoveSelectionStep('left')}
          className={`h-8 px-1.5 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-text-dim transition-colors flex items-center justify-center`}
          title={t('move_left', lang)}
        >
          <ChevronLeft size={12} />
        </button>
        <button 
          onClick={() => handleMoveSelectionStep('right')}
          className={`h-8 px-1.5 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-text-dim transition-colors flex items-center justify-center`}
          title={t('move_right', lang)}
        >
          <ChevronRight size={12} />
        </button>
        <button 
          onClick={() => handleMoveSelection('end')}
          className={`px-3 h-8  ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
          title={t('move_to_back_tooltip', lang)}
        >
          {t('move_to_back', lang)}
        </button>
        <div className="w-px h-6 bg-border-main mx-1"></div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleEmphasizeAdd}
            className={`px-2 h-8 text-[10px] font-mono border rounded transition-colors ${
              (theme === 'light' || theme === 'mono') || theme === 'paper'
                ? 'bg-[#b45309]/5 hover:bg-[#b45309]/10 border-[#b45309]/40 text-[#b45309]'
                : 'bg-bg-surface hover:bg-amber-500/10 border-amber-500/40 text-amber-500'
            }`}
            title="Add Emphasis ()"
          >+( )</button>
          <button 
            onClick={handleEmphasizeRemove}
            className={`px-2 h-8 text-[10px] font-mono border rounded transition-colors ${
              (theme === 'light' || theme === 'mono') || theme === 'paper'
                ? 'bg-[#b45309]/5 hover:bg-[#b45309]/10 border-[#b45309]/40 text-[#b45309]'
                : 'bg-bg-surface hover:bg-amber-500/10 border-amber-500/40 text-amber-500'
            }`}
            title="Remove 1 Layer of Emphasis"
          >-( )</button>
          <button 
            onClick={handleEmphasizeClear}
            className={`px-2 h-8 text-[10px] font-mono border rounded transition-colors ${
              (theme === 'light' || theme === 'mono') || theme === 'paper'
                ? 'bg-[#b45309]/5 hover:bg-[#b45309]/10 border-[#b45309]/40 text-[#b45309]'
                : 'bg-bg-surface hover:bg-amber-500/10 border-amber-500/40 text-amber-500'
            }`}
            title="Clear All Emphasis"
          >{t('emphasize_clear', lang)}</button>
        </div>

        <button 
          onClick={handleCleanupChat}
          className={`px-3 h-8  ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
          title="Clean Chat Logs"
        >
          {t('cleanup_chat', lang) || 'CHAT CLEAN'}
        </button>

        <button 
          onClick={handleUppercase}
          className={`px-3 h-8  ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
        >
          {t('uppercase', lang)}
        </button>
        <button 
          onClick={handleLowercase}
          className={`px-3 h-8  ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors`}
        >
          {t('lowercase', lang)}
        </button>
        <div className="w-px h-6 bg-border-main mx-1"></div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setEditorFontSize(s => Math.max(8, s - 1))}
            className={`px-2 h-8 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim`}
          >A-</button>
          <span className="text-[16px] font-bold font-mono text-text-main w-6 text-center shrink-0">{editorFontSize}</span>
          <button 
            onClick={() => setEditorFontSize(s => Math.min(24, s + 1))}
            className={`px-2 h-8 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim`}
          >A+</button>
          
          <select 
            value={editorFontWeight}
            onChange={e => setEditorFontWeight(e.target.value)}
            className={`ml-1 border border-border-main text-[10px] font-mono rounded h-8 px-1 outline-none cursor-pointer uppercase tracking-wider transition-colors shrink-0 ${theme === 'mono' ? 'bg-bg-input text-text-main hover:bg-gray-500 hover:text-white' : 'bg-bg-input text-text-main hover:bg-border-main'}`}
          >
            <option value="400">{t('font_normal', lang as Language)}</option>
            <option value="700">{t('font_bold', lang as Language)}</option>
          </select>

          <div className="flex items-center gap-1.5 mx-2" title={lang === 'en' ? 'Line Height' : '行間'}>
            <span className="text-[10px] font-mono font-bold text-text-main whitespace-nowrap">{lang === 'en' ? 'Line Height' : '行間'}</span>
            <input 
              type="range" 
              min="1.0" 
              max="2.5" 
              step="0.1" 
              value={editorLineHeight}
              onChange={e => setEditorLineHeight(parseFloat(e.target.value))}
              className="w-16 square-slider"
              title={`Line Height: ${editorLineHeight}`}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`px-3 h-8 border rounded text-[11px] font-mono transition-colors flex items-center gap-1.5 shrink-0 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} disabled:opacity-50 disabled:cursor-not-allowed border-border-hover text-text-main font-bold`}
            title={t('undo', lang)}
          >
            <Undo2 className="w-3.5 h-3.5" /> {lang === 'en' ? 'UNDO' : '前に戻す'}
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`px-3 h-8 border rounded text-[11px] font-mono transition-colors flex items-center gap-1.5 shrink-0 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} disabled:opacity-50 disabled:cursor-not-allowed border-border-hover text-text-main font-bold`}
            title={lang === 'en' ? 'REDO' : '次に進む'}
          >
            <Redo2 className="w-3.5 h-3.5" /> {lang === 'en' ? 'REDO' : '次に進む'}
          </button>
          
          <button 
          onClick={() => {            setEditorText('');            setNegativeEditorText('');          }}
          className={`px-3 h-8  border rounded text-[10px] font-mono transition-colors flex items-center gap-1 shrink-0 ${
            (theme === 'light' || theme === 'mono')
              ? 'bg-gray-200 hover:bg-gray-300 text-black border-gray-400 font-bold'
              : 'bg-transparent hover:bg-white/10 text-white border-white/50 font-bold'
          }`}
        >
          <Trash2 className="w-3 h-3" /> {t('clear_all', lang)}
        </button>
        </div>
      </div>
      
      

      <div className="flex-1 p-4 pt-2 overflow-y-auto bg-bg-panel flex flex-col gap-2">
        {/* Tabs */}

      {tabs && onTabChange && (
        <div 
          className="group/tabs flex items-center w-full shrink-0 mb-1"
          onMouseEnter={() => setShowScrollButtons(true)}
          onMouseLeave={() => {
            setShowScrollButtons(false);
            stopScroll();
          }}
        >
          <div className="relative flex-1 flex overflow-hidden">
            {showScrollButtons && (
              <button
                onMouseDown={() => startScroll('left')} onTouchStart={() => startScroll('left')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll} onTouchEnd={stopScroll}
                className="absolute left-0 z-10 flex h-full px-1 items-center justify-center bg-gradient-to-r from-bg-panel via-bg-panel to-transparent text-text-main opacity-70 hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 drop-shadow-md" />
              </button>
            )}
            <div 
              ref={tabsScrollRef}
              className="flex-1 flex items-center overflow-x-auto pl-0 pt-0 pb-1 pr-8 bg-transparent [&::-webkit-scrollbar]:hidden" 
              style={{ gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map(tab => (
                <div 
                  key={tab.id}
                  className={`group flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono border rounded cursor-pointer whitespace-nowrap transition-all ${
                    activeTabId === tab.id 
                      ? ((theme === 'light' || theme === 'mono') ? 'bg-gray-700 border-gray-700 text-white shadow-sm' : 'bg-white border-white text-gray-900 shadow-sm') 
                      : 'bg-bg-base border-border-main text-text-dim hover:bg-bg-input hover:text-text-main hover:border-border-hover'
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span className="truncate max-w-[120px]" title={tab.name}>{tab.name}</span>
                  {tabs.length > 1 ? (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (onTabClose) onTabClose(tab.id);
                      }}
                      className={`ml-1 w-3.5 h-3.5 flex items-center justify-center rounded-sm transition-colors ${
                        activeTabId === tab.id 
                          ? 'opacity-100 hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-400' 
                          : 'opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-400'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : (
                    <div className="ml-1 w-3.5 h-3.5 flex items-center justify-center opacity-0 pointer-events-none shrink-0">
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showScrollButtons && (
              <button
                onMouseDown={() => startScroll('right')} onTouchStart={() => startScroll('right')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll} onTouchEnd={stopScroll}
                className="absolute right-0 z-10 flex h-full px-1 items-center justify-center bg-gradient-to-l from-bg-panel via-bg-panel to-transparent text-text-main opacity-70 hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 drop-shadow-md" />
              </button>
            )}
          </div>
          <button 
            onClick={onTabAdd} 
            className="ml-1 px-2 py-1.5 text-text-dim hover:text-text-main hover:bg-bg-input rounded-sm border border-transparent transition-colors flex items-center justify-center shrink-0"
            title="Add Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => {
              if (confirmClearTabs) {
                if (onTabsClear) onTabsClear();
                setConfirmClearTabs(false);
              } else {
                setConfirmClearTabs(true);
                setTimeout(() => setConfirmClearTabs(false), 3000);
              }
            }} 
            className={`ml-auto px-3 py-0.5 text-[9px] font-mono font-bold border rounded-sm transition-colors uppercase shrink-0 ${
              confirmClearTabs 
                ? 'bg-red-500 text-white border-solid border-red-500 hover:bg-red-600' 
                : 'text-red-500 hover:text-white bg-transparent hover:bg-red-500/80 border-dashed border-red-500/50 hover:border-red-500/80'
            }`}
            title="Clear all tabs"
          >
            {confirmClearTabs ? t('confirm_clear', lang) || 'SURE?' : 'ALL CLEAR'}
          </button>
        </div>
      )}

        <div className={`${isPositiveOpen ? 'flex-1 min-h-[100px]' : 'shrink-0'} border border-border-main rounded-lg flex flex-col relative transition-colors ${paperMode ? 'bg-[#f4f4f5] border-gray-300 shadow-inner' : 'bg-bg-base'}`}>
          <div className="flex justify-between items-start sm:items-center px-3 pt-2 pb-1 gap-2 flex-wrap border-b border-border-main/30">
            <button 
              onClick={() => setIsPositiveOpen(!isPositiveOpen)}
              className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase mt-1 transition-colors text-text-main hover:opacity-70`}
            >
              {isPositiveOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              PROMPT
            </button>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              
              
              <button 
                onClick={() => handleSaveSetClick()}
                className="flex items-center gap-1 px-2 py-1 bg-accent-main hover:bg-blue-600 border border-accent-dim rounded text-[9px] font-mono text-white transition-colors"
              >
                <Save className="w-3 h-3" /> {t('save_as_set', lang)}
              </button>
              <button 
                onClick={() => handleSaveMasterClick(false, activeMasterTab === 'negative')}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <Save className="w-3 h-3" /> {t('save_as_master', lang)}
              </button>
              <button 
                onClick={() => handleSavePartClick(false)}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <PlusSquare className="w-3 h-3" /> {t('save_as_part', lang)}
              </button>
              <button 
                onClick={() => {
                  const text = editorText.trim();
                  if (!text) return;
                  const firstLine = text.split('\n')[0];
                  const title = selectedMemoId && selectedMemoName ? selectedMemoName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine);
                  setSaveMemoContent(text);
                  setSaveMemoDefaultTitle(title);
                  setIsSaveMemoModalOpen(true);
                }}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <PlusSquare className="w-3 h-3" /> {t('save_as_memo', lang)}
              </button>
              <button
                onClick={() => setEditorText('')}
                className="flex items-center gap-1 px-2 py-1 bg-bg-input hover:bg-red-500/10 hover:text-red-400 border border-border-hover hover:border-red-500/30 rounded text-[9px] font-mono text-text-dim transition-colors ml-1"
                title={t('clear', lang)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          {isPositiveOpen && (
          <div className="flex-1 relative flex flex-col mt-1">
      {/* Toast Notification (Moved to top of text area) */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute top-4 right-8 z-50 bg-bg-surface text-text-main px-4 py-2 rounded shadow-lg text-[10px] font-mono font-bold flex items-center gap-2 border border-border-main"
          >
            {t('copied', lang)}
          </motion.div>
        )}
      </AnimatePresence>
                        <div 
              ref={positiveHighlightRef}
              className={`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none pointer-events-none font-mono ${paperMode ? 'text-gray-800' : 'text-text-dim'}`}
              style={{ fontSize: `${editorFontSize}px`, lineHeight: editorLineHeight, fontWeight: editorFontWeight }}
              aria-hidden="true"
            >
              {editorText ? <>{renderHighlightedText(editorText, false)}{editorText.endsWith('\n') ? '\u200B' : ''}</> : <span className="opacity-50">{t('placeholder', lang)}</span>}
            </div>
            <textarea
              onKeyDown={(e) => handleKeyDown(e, false)}
              onPaste={(e) => handlePaste(e, false)}
              ref={positiveTextRef}
              onMouseDown={() => setSearchSelectionActive(false)}
              value={editorText}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'copy'; }} onDragOver={handleDragOver}
              onDrop={(e) => handleDropFile(e, false)}
              onChange={(e) => {
                setSearchSelectionActive(false);
                lastUserTextRef.current = e.target.value;
                setEditorText(e.target.value);
                setActiveEditor('positive');
                setPositiveCursorPos(e.target.selectionStart);
                if (setPositiveSelectionEnd) setPositiveSelectionEnd(e.target.selectionEnd);
              }}
              onSelect={(e) => {
                setSearchSelectionActive(false);
                setActiveEditor('positive');
                setPositiveCursorPos(e.currentTarget.selectionStart);
                if (setPositiveSelectionEnd) setPositiveSelectionEnd(e.currentTarget.selectionEnd);
              }}
              onScroll={(e) => {
                if (positiveHighlightRef.current) {
                  positiveHighlightRef.current.scrollTop = e.currentTarget.scrollTop;
                  positiveHighlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              
              style={{ fontSize: `${editorFontSize}px`, lineHeight: editorLineHeight, fontWeight: editorFontWeight }}
              className={`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono ${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-blue-600 selection:text-white'} bg-transparent text-transparent caret-text-main outline-none resize-none`}
              spellCheck={false}
            />
          </div>
          )}
        </div>
        
        {/* Move/Copy Text Buttons & Resizer */}
        <div className="flex justify-center -my-3 relative z-10">
          <div 
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 cursor-row-resize flex items-center justify-center group" 
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          >
            <div className={`w-full h-px ${isResizing ? 'bg-accent-main' : 'bg-transparent group-hover:bg-border-main'} transition-colors`} />
          </div>

          <div className="flex gap-2 bg-bg-panel p-1 rounded-full border border-border-main shadow-sm relative z-20">
            <button 
              onClick={() => handleCopyTextBetweenEditors('down')}
              className={`px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main hover:text-text-main'} rounded-full text-text-dim transition-colors border border-border-hover flex items-center justify-center gap-1 text-[9px] font-mono`}
              title={t('copy_to_negative', lang)}
            >
              <Copy size={12} /> <ArrowDown size={12} />
            </button>
            <button 
              onClick={() => handleMoveTextBetweenEditors('down')}
              className={`h-8 w-8 flex items-center justify-center ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main hover:text-text-main'} rounded-full text-text-dim transition-colors border border-border-hover flex items-center justify-center`}
              title={t('move_to_negative', lang)}
            >
              <ArrowDown size={14} />
            </button>
            <div className="w-px h-6 bg-border-main my-auto mx-1"></div>
            <button 
              onClick={() => handleMoveTextBetweenEditors('up')}
              className={`h-8 w-8 flex items-center justify-center ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main hover:text-text-main'} rounded-full text-text-dim transition-colors border border-border-hover flex items-center justify-center`}
              title={t('move_to_positive', lang)}
            >
              <ArrowUp size={14} />
            </button>
            <button 
              onClick={() => handleCopyTextBetweenEditors('up')}
              className={`px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main hover:text-text-main'} rounded-full text-text-dim transition-colors border border-border-hover flex items-center justify-center gap-1 text-[9px] font-mono`}
              title={t('copy_to_positive', lang)}
            >
              <Copy size={12} /> <ArrowUp size={12} />
            </button>
          </div>
        </div>

        <div 
          className={`${!isPositiveOpen && isNegativeOpen ? 'flex-1 min-h-[100px]' : 'shrink-0'} border border-border-main rounded-lg flex flex-col relative transition-colors ${paperMode ? 'bg-[#f4f4f5] border-gray-300 shadow-inner' : 'bg-bg-base'}`}
          style={{ height: (!isPositiveOpen && isNegativeOpen) ? 'auto' : (isNegativeOpen ? `${negativeHeight}px` : 'auto') }}
        >
          <div className="flex justify-between items-start sm:items-center px-3 pt-2 pb-1 gap-2 flex-wrap border-b border-border-main/30">
            <button 
            onClick={() => setIsNegativeOpen(!isNegativeOpen)}
            className={`flex items-center gap-1 text-[10px] font-mono font-bold uppercase mt-1 transition-colors text-text-main hover:opacity-70`}
          >
            {isNegativeOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            NEGATIVE PROMPT
          </button>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              
              
              <button 
                onClick={() => handleSaveMasterClick(true)}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <Save className="w-3 h-3" /> {t('save_as_master', lang)}
              </button>
              <button 
                onClick={() => handleSavePartClick(true)}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <PlusSquare className="w-3 h-3" /> {t('save_as_part', lang)}
              </button>
              <button 
                onClick={() => {
                  const text = negativeEditorText.trim();
                  if (!text) return;
                  const firstLine = text.split('\n')[0];
                  const title = selectedMemoId && selectedMemoName ? selectedMemoName : (firstLine.length > 20 ? firstLine.slice(0, 20) + '...' : firstLine);
                  setSaveMemoContent(text);
                  setSaveMemoDefaultTitle(title);
                  setIsSaveMemoModalOpen(true);
                }}
                className={`flex items-center gap-1 px-2 py-1 ${theme === 'mono' ? 'bg-bg-input hover:bg-gray-500 hover:text-white' : 'bg-bg-input hover:bg-border-main'} border border-border-hover rounded text-[9px] font-mono text-text-dim transition-colors`}
              >
                <PlusSquare className="w-3 h-3" /> {t('save_as_memo', lang)}
              </button>
              <button
                onClick={() => setNegativeEditorText('')}
                className="flex items-center gap-1 px-2 py-1 bg-bg-input hover:bg-red-500/10 hover:text-red-400 border border-border-hover hover:border-red-500/30 rounded text-[9px] font-mono text-text-dim transition-colors ml-1"
                title={t('clear', lang)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative flex flex-col mt-1">
            <div 
              ref={negativeHighlightRef}
              className={`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none pointer-events-none font-mono ${paperMode ? 'text-gray-800' : 'text-text-dim'}`}
              style={{ fontSize: `${editorFontSize}px`, lineHeight: editorLineHeight, fontWeight: editorFontWeight }}
              aria-hidden="true"
            >
              {negativeEditorText ? <>{renderHighlightedText(negativeEditorText, true)}{negativeEditorText.endsWith('\n') ? '\u200B' : ''}</> : <span className="opacity-50">Negative prompt...</span>}
            </div>
            <textarea
              onKeyDown={(e) => handleKeyDown(e, true)}
              onPaste={(e) => handlePaste(e, true)}
              ref={negativeTextRef}
              onMouseDown={() => setSearchSelectionActive(false)}
              value={negativeEditorText}
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'copy'; }} onDragOver={handleDragOver}
              onDrop={(e) => handleDropFile(e, true)}
              onChange={(e) => {
                setSearchSelectionActive(false);
                lastUserNegativeTextRef.current = e.target.value;
                setNegativeEditorText(e.target.value);
                setActiveEditor('negative');
                setNegativeCursorPos(e.target.selectionStart);
                if (setNegativeSelectionEnd) setNegativeSelectionEnd(e.target.selectionEnd);
              }}
              onSelect={(e) => {
                setSearchSelectionActive(false);
                setActiveEditor('negative');
                setNegativeCursorPos(e.currentTarget.selectionStart);
                if (setNegativeSelectionEnd) setNegativeSelectionEnd(e.currentTarget.selectionEnd);
              }}
              onScroll={(e) => {
                if (negativeHighlightRef.current) {
                  negativeHighlightRef.current.scrollTop = e.currentTarget.scrollTop;
                  negativeHighlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              
              style={{ fontSize: `${editorFontSize}px`, lineHeight: editorLineHeight, fontWeight: editorFontWeight }}
              className={`absolute inset-0 w-full h-full p-4 pt-2 m-0 border-none rounded-none appearance-none whitespace-pre-wrap break-words overflow-y-auto block tracking-normal focus:ring-0 shadow-none font-mono ${searchSelectionActive ? 'selection:bg-transparent selection:text-transparent' : 'selection:bg-red-600 selection:text-white'} bg-transparent text-transparent caret-text-main outline-none resize-none`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
        
      

      {/* Toast Notification */}

      <SavePartModal
        isOpen={isSavePartModalOpen}
        content={savePartContent}
        defaultName={savePartDefaultName}
        items={savePartItems}
        categories={uniqueCategories}
        selectedId={selectedPartId}
        selectedName={selectedPartName}
        onConfirm={(name, category, section, items, isUpdate) => {
          if (onSaveAsPart) {
            onSaveAsPart(name, savePartContent, category, section, items, isUpdate);
          }
          setIsSavePartModalOpen(false);
        }}
        onCancel={() => setIsSavePartModalOpen(false)}
        lang={lang}
      />
            <SaveMemoModal
        isOpen={isSaveMemoModalOpen}
        content={saveMemoContent}
        defaultTitle={saveMemoDefaultTitle}
        selectedMemoId={selectedMemoId || null}
        selectedMemoName={selectedMemoName || ''}
        onConfirm={(title, content, isUpdate) => {
          if (onSaveAsMemo) {
            onSaveAsMemo(title, content, isUpdate);
          }
          setIsSaveMemoModalOpen(false);
        }}
        onCancel={() => setIsSaveMemoModalOpen(false)}
        lang={lang}
      />
      <SaveMasterModal
        isOpen={isSaveMasterModalOpen}
        content={saveMasterContent}
        negativeContent={saveMasterNegativeContent}
        defaultTitle={saveMasterDefaultTitle}
        items={saveMasterItems}
        isNegative={saveMasterIsNegative}
        selectedId={saveMasterIsNegative ? selectedNegativeId : selectedMasterId}
        selectedName={saveMasterIsNegative ? selectedNegativeName : selectedMasterName}
        onConfirm={(title, content, isNegative, items, negativeContent, isUpdate) => {
          if (onSaveAsMaster) {
            if (items && items.length > 0) {
              items.forEach(item => {
                onSaveAsMaster(item.name, item.content, isNegative, undefined, isUpdate);
              });
            } else {
              onSaveAsMaster(title, content, isNegative, negativeContent, isUpdate);
            }
          }
          setIsSaveMasterModalOpen(false);
        }}
        onCancel={() => setIsSaveMasterModalOpen(false)}
        lang={lang}
      />
    </>
  );
};
