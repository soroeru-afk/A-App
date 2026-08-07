import React, { useMemo, useState, useEffect } from 'react';
import { VariationPart } from '../types';
import { Accordion } from './Accordion';
import { ConfirmModal } from './ConfirmModal';
import { AddModal } from './AddModal';
import { User, Pencil, Trash2, Check, X, Plus, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, ArrowLeftToLine, ArrowRightToLine, Copy } from 'lucide-react';
import { Language, t } from '../i18n';
import { AttributeMixer } from './AttributeMixer';

interface VariationColumnProps {
  parts: VariationPart[];
  customCategories?: { name: string, section: number }[];
  customSectionNames?: Record<number, string>;
  onRenameSection?: (section: number, newName: string) => void;
  selectedIds: Set<string>;
  onTogglePart: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTogglePartNegative?: (id: string) => void;
  onAdd: (category: string, section: number, name: string, content?: string) => void;
  onUpdate: (id: string, updates: Partial<VariationPart>) => void;
  onDuplicate?: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll?: () => void;
  onAddCategory?: (section: number, name: string) => void;
  onRenameCategory?: (section: number, oldName: string, newName: string) => void;
  onDeleteCategory?: (section: number, name: string) => void;
  onReorderCategory?: (draggedSection: number, draggedCat: string, targetSection: number, targetCat?: string) => void;
  onReorder?: (draggedId: string, targetId: string) => void;
  onCopyToMaster?: (part: VariationPart) => void;
  onCopyToMixer?: (part: VariationPart) => void;
  onCopyBulkToMaster?: (items: VariationPart[]) => void;
  onCopyBulkToMixer?: (items: VariationPart[]) => void;
  onMixAttributes?: (pos: string, neg: string) => void;
  onInsertText?: (text: string, isNegative?: boolean) => void;
  onCopyToParts?: (parts: VariationPart[], categories: { name: string, section: number }[]) => { added: number, skipped: number };
  lang: Language;
  theme: string;
  activeTab?: 'parts' | 'mixer' | 'memo';
  setActiveTab?: (tab: 'parts' | 'mixer' | 'memo') => void;
  children?: React.ReactNode;
}

export const VariationColumn: React.FC<VariationColumnProps> = ({ 
  parts, customCategories = [], customSectionNames = {}, onRenameSection, selectedIds, onTogglePart, onTogglePin, onTogglePartNegative, onAdd, onUpdate, onDuplicate, onDelete, onDeleteAll, onAddCategory, onRenameCategory, onDeleteCategory, onReorderCategory, onReorder, onCopyToMaster, onCopyToMixer, onCopyBulkToMaster, onCopyBulkToMixer, onMixAttributes, onInsertText, onCopyToParts, lang, theme, activeTab = 'parts', setActiveTab, children
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [draggedPart, setDraggedPart] = useState<{ id: string, category: string } | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<{ name: string, section: number } | null>(null);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmQuickDeleteId, setConfirmQuickDeleteId] = useState<string | null>(null);
  const [confirmAddData, setConfirmAddData] = useState<{ category: string, section: number } | null>(null);
  const [confirmAddCategoryData, setConfirmAddCategoryData] = useState<number | null>(null);
  const [confirmDeleteCategoryData, setConfirmDeleteCategoryData] = useState<{ section: number, name: string } | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmDeleteAllState, setConfirmDeleteAllState] = useState(false);

  const uniqueCategories = useMemo(() => {
    const cats = new Map<string, number>(); // category -> section
    parts.forEach(p => cats.set(p.category, p.section));
    if (customCategories) {
      customCategories.forEach(c => cats.set(c.name, c.section));
    }
    return Array.from(cats.entries());
  }, [parts, customCategories]);

  const handleBulkMove = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    
    if (val === 'copy_to_master') {
      if (onCopyBulkToMaster) {
        const itemsToCopy = parts.filter(p => bulkSelectedIds.has(p.id));
        onCopyBulkToMaster(itemsToCopy);
      }
      setBulkSelectedIds(new Set());
      e.target.value = ''; // reset
      return;
    }
    
    if (val === 'copy_to_mixer') {
      if (onCopyBulkToMixer) {
        const itemsToCopy = parts.filter(p => bulkSelectedIds.has(p.id));
        onCopyBulkToMixer(itemsToCopy);
      }
      setBulkSelectedIds(new Set());
      e.target.value = ''; // reset
      return;
    }

    const [sectionStr, ...catParts] = val.split(':');
    const category = catParts.join(':');
    const section = Number(sectionStr);
    
    bulkSelectedIds.forEach(id => {
      onUpdate(id, { category, section: section as 1|2|3|4|5 });
    });
    setBulkSelectedIds(new Set());
    e.target.value = ''; // reset
  };

  const handleBulkDelete = () => {
    setConfirmBulkDelete(true);
  };

  const confirmBulkDeleteExecute = () => {
    bulkSelectedIds.forEach(id => onDelete(id));
    setBulkSelectedIds(new Set());
    setConfirmBulkDelete(false);
  };

  const handleToggleBulkSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBulkSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };


  const handleSectionDragStart = (e: React.DragEvent, sectionId: number) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };
  const handleSectionDragEnd = (e: React.DragEvent) => {
    setDraggedSection(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };
  const handleSectionDragOver = (e: React.DragEvent, targetSectionId: number) => {
    e.preventDefault();
    if (draggedCategory) { e.dataTransfer.dropEffect = 'move'; return; }
    if (draggedSection !== null && draggedSection !== targetSectionId) {
      setSectionOrder(prev => {
        const fromIdx = prev.indexOf(draggedSection);
        const toIdx = prev.indexOf(targetSectionId);
        if (fromIdx < 0 || toIdx < 0) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        localStorage.setItem('variation_section_order', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleCatDragStart = (e: React.DragEvent, name: string, section: number) => {
    e.stopPropagation();
    setDraggedCategory({ name, section });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };
  const handleCatDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedCategory(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleSectionContainerDrop = (e: React.DragEvent, section: number) => {
    e.preventDefault();
    if (!draggedCategory) return;
    if (draggedCategory.section === section) return;
    if (onReorderCategory) {
      onReorderCategory(draggedCategory.section, draggedCategory.name, section);
    }
  };

  const handleCatDragOver = (e: React.DragEvent, section: number) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleCatDrop = (e: React.DragEvent, targetName: string, section: number) => {
    e.preventDefault();
    if (!draggedCategory || (draggedCategory.section === section && draggedCategory.name === targetName)) return;
    if (onReorderCategory) {
      onReorderCategory(draggedCategory.section, draggedCategory.name, section, targetName);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, section: number) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory.section === section) return;
    if (onReorderCategory) {
      onReorderCategory(draggedCategory.section, draggedCategory.name, section);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string, category: string) => {
    e.stopPropagation();
    setDraggedPart({ id, category });
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedPart(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (draggedPart?.category === category) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDrop = (e: React.DragEvent, id: string, category: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!draggedPart || draggedPart.category !== category || draggedPart.id === id) return;
    if (onReorder) {
      onReorder(draggedPart.id, id);
    }
  };

  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return parts;
    const query = searchQuery.toLowerCase();
    return parts.filter(
      (p) => p.name.toLowerCase().includes(query) || p.content.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  }, [parts, searchQuery]);

  const [expandId, setExpandId] = useState(0);
  const [collapseId, setCollapseId] = useState(0);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem('variation_section_order');
    let parsed = saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    if (!parsed.includes(5)) parsed.push(5);
    return parsed;
  });
  
  useEffect(() => {
    const handleImport = () => {
      const saved = localStorage.getItem('variation_section_order');
      if (saved) {
        try { 
          let parsed = JSON.parse(saved); 
          if (!parsed.includes(5)) parsed.push(5);
          setSectionOrder(parsed); 
        } catch (e) {}
      }
    };
    window.addEventListener('attributeMixerDataImported', handleImport);
    return () => window.removeEventListener('attributeMixerDataImported', handleImport);
  }, []);
  
  const moveSection = (secId: number, direction: 'up' | 'down') => {
    setSectionOrder(prev => {
      const idx = prev.indexOf(secId);
      if (idx < 0) return prev;
      const next = [...prev];
      if (direction === 'up' && idx > 0) {
        [next[idx-1], next[idx]] = [next[idx], next[idx-1]];
      } else if (direction === 'down' && idx < prev.length - 1) {
        [next[idx+1], next[idx]] = [next[idx], next[idx+1]];
      }
      localStorage.setItem('variation_section_order', JSON.stringify(next));
      return next;
    });
  };


  // Group by Section, then Category
  const groupedParts = useMemo(() => {
    const sections = {
      1: { name: customSectionNames[1] || t('sec_composition' as any, lang), categories: {} as Record<string, VariationPart[]> },
      2: { name: customSectionNames[2] || t('sec_pose' as any, lang), categories: {} as Record<string, VariationPart[]> },
      3: { name: customSectionNames[3] || t('sec_details' as any, lang), categories: {} as Record<string, VariationPart[]> },
      4: { name: customSectionNames[4] || t('sec_context' as any, lang), categories: {} as Record<string, VariationPart[]> },
      5: { name: customSectionNames[5] || t('sec_others' as any, lang), categories: {} as Record<string, VariationPart[]> },
    };

    customCategories.forEach(cat => {
      const sec = sections[cat.section as 1 | 2 | 3 | 4 | 5];
      if (sec && !sec.categories[cat.name]) {
        sec.categories[cat.name] = [];
      }
    });

    filteredParts.forEach((part) => {
      const sec = sections[part.section as 1 | 2 | 3 | 4 | 5] || sections[5]; // Fallback to 5 (Others)
      if (!sec) return;
      if (!sec.categories[part.category]) {
        sec.categories[part.category] = [];
      }
      sec.categories[part.category].push(part);
    });

    // Sorting removed so users can fully freely reorder items including pinned ones
    return sections;
  }, [filteredParts, customCategories, customSectionNames, lang]);

  const startEdit = (part: VariationPart, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(part.id);
    setEditName(part.name);
    setEditContent(part.content);
    setEditCategory(part.category);
  };

  const handleSave = (id: string) => {
    onUpdate(id, { name: editName, content: editContent, category: editCategory });
    setEditingId(null);
  };

  return (
    <>
      <div className="p-2 bg-bg-panel border-b border-border-main shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 w-full bg-bg-base border border-border-main p-1.5 text-[10px] font-mono uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab?.('parts')}
            className={`flex-1 flex justify-center items-center gap-1 py-1.5 px-2 border whitespace-nowrap transition-colors ${activeTab === 'parts' ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main') : 'border-transparent text-text-dim hover:text-text-main'}`}
          >
            {t('variation_parts', lang)}
          </button>
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('mixer')}
              className={`flex-1 flex justify-center items-center gap-1 py-1.5 px-2 border whitespace-nowrap transition-colors ${activeTab === 'mixer' ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main') : 'border-transparent text-text-dim hover:text-text-main'}`}
            >
              <User size={12} /> {t('prompt_mixer', lang)}
            </button>
          )}
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('memo')}
              className={`flex-1 flex justify-center items-center gap-1 py-1.5 px-2 border whitespace-nowrap transition-colors ${activeTab === 'memo' ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main') : 'border-transparent text-text-dim hover:text-text-main'}`}
            >
              {t('prompt_memo', lang)}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'parts' ? (
      <>
      <div className="p-4 flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
        <div className={`flex flex-wrap items-center gap-2 bg-bg-surface p-2 border ${bulkSelectedIds.size > 0 ? 'border-blue-500/30' : 'border-border-main'} rounded shadow-sm shrink-0 min-h-[42px]`}>
          <span className="text-[10px] font-mono text-text-dim flex-shrink-0 flex items-center justify-center w-6 h-6 bg-bg-input rounded-full font-bold">{bulkSelectedIds.size}</span>
          <select 
            onChange={handleBulkMove}
            value=""
            disabled={bulkSelectedIds.size === 0}
            className="flex-1 min-w-[70px] bg-bg-input hover:bg-text-main hover:text-bg-base border border-border-main text-text-main text-[13px] font-mono px-2 py-1.5 rounded outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:hover:bg-bg-input disabled:hover:text-text-main"
          >
            <option value="" disabled className="bg-bg-panel text-text-dim">Move to...</option>
            <option value="copy_to_master" className="bg-bg-panel text-text-main">{t('copy_to_master_prompts', lang)}</option>
            <option value="copy_to_mixer" className="bg-bg-panel text-text-main">➡ {lang === 'en' ? 'Copy to Prompt Mixer' : 'プロンプトミキサーへコピー'}</option>
            <option disabled className="bg-bg-panel text-text-dim">──────────</option>
            {uniqueCategories.map(([cat, sec]) => (
              <option key={`${sec}:${cat}`} value={`${sec}:${cat}`} className="bg-bg-panel text-text-main">
                {t(cat as any, lang) || cat} ({t(`sec_${sec === 1 ? 'composition' : sec === 2 ? 'pose' : sec === 3 ? 'details' : 'context'}` as any, lang)})
              </option>
            ))}
          </select>
          <button 
            onClick={handleBulkDelete}
            disabled={bulkSelectedIds.size === 0}
            className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-red-500/10 border border-red-500/50 rounded text-[10px] font-mono text-red-500 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" /> DELETE
          </button>
          <button 
            onClick={() => setBulkSelectedIds(new Set())} 
            disabled={bulkSelectedIds.size === 0}
            className="px-2 py-1 bg-bg-input hover:bg-border-main border border-border-hover rounded text-[10px] font-mono text-text-dim transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {t('clear_selection', lang)}
          </button>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('search', lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-input border border-border-main text-[11px] font-mono px-8 py-2 rounded focus:outline-none focus:border-blue-500 text-text-main placeholder-gray-600"
              />
              <span className="absolute left-2.5 top-2.5 opacity-30 font-mono text-[10px] text-text-main">/</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if (isAllExpanded) {
                  setCollapseId(prev => prev + 1);
                } else {
                  setExpandId(prev => prev + 1);
                }
                setIsAllExpanded(!isAllExpanded);
              }} 
              className={`px-2 py-1 text-[10px] border rounded transition-colors whitespace-nowrap flex items-center justify-center gap-1 shrink-0 ${
                (theme === 'light' || theme === 'mono') || theme === 'paper'
                  ? 'bg-gray-200 hover:bg-gray-300 text-black border-gray-400 font-bold'
                  : 'bg-transparent hover:bg-white/10 text-white border-white/50 font-bold'
              }`}
            >
              {isAllExpanded ? <ChevronsUp size={12} /> : <ChevronsDown size={12} />}
              {isAllExpanded ? t('collapse_all', lang) : t('expand_all', lang)}
            </button>
          </div>
        </div>
        
        

        <div className="flex-1 overflow-y-scroll pr-2 space-y-4 content-start min-h-0 pb-12">
          {sectionOrder.map((secIdNum) => {
            const secId = String(secIdNum);
            const secData = groupedParts[secIdNum as keyof typeof groupedParts];
            if (!secData) return null;
            const catEntries = Object.entries(secData.categories) as [string, VariationPart[]][];

            return (
              <div 
                key={secId} 
                className="space-y-4"
                onDragOver={(e) => handleSectionDragOver(e, Number(secId))} onDrop={(e) => handleSectionContainerDrop(e, Number(secId))}
              >
                <div draggable={editingId === null && editingCategory === null && editingSectionId === null} onDragStart={(e) => handleSectionDragStart(e, Number(secId))} onDragEnd={handleSectionDragEnd} style={{ cursor: "grab" }} className={`flex items-center justify-between p-2 border-l-4 shadow-sm bg-transparent group text-text-main ${
                  secId === '1' ? 'border-blue-500' : 
                  secId === '2' ? 'border-orange-500' : 
                  secId === '3' ? 'border-green-500' : 
                  secId === '4' ? 'border-purple-500' :
                  'border-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <button onClick={() => moveSection(Number(secId), 'up')} className="hover:text-text-main text-text-dim opacity-0 group-hover:opacity-100 transition-opacity"><ChevronUp size={12} /></button>
                      <button onClick={() => moveSection(Number(secId), 'down')} className="hover:text-text-main text-text-dim opacity-0 group-hover:opacity-100 transition-opacity"><ChevronDown size={12} /></button>
                    </div>
                    {editingSectionId === Number(secId) ? (
                      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editSectionName}
                          onChange={(e) => setEditSectionName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onRenameSection?.(Number(secId), editSectionName);
                              setEditingSectionId(null);
                            } else if (e.key === 'Escape') {
                              setEditingSectionId(null);
                            }
                          }}
                          className="text-xs font-mono font-bold uppercase bg-bg-input border border-border-main px-1 py-0.5 rounded outline-none w-32 text-text-main"
                          autoFocus
                          onBlur={() => {
                            onRenameSection?.(Number(secId), editSectionName);
                            setEditingSectionId(null);
                          }}
                        />
                      </div>
                    ) : (
                      <h3 className="text-xs font-mono font-bold uppercase flex items-center group/title cursor-text" onClick={(e) => {
                        if (onRenameSection) {
                          e.stopPropagation();
                          setEditingSectionId(Number(secId));
                          setEditSectionName(secData.name);
                        }
                      }}>
                        {secData.name}
                        {onRenameSection && <Pencil className="w-3 h-3 ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity text-text-dim" />}
                      </h3>
                    )}
                  </div>
                  {onAddCategory && (
                    <button 
                      onClick={() => setConfirmAddCategoryData(Number(secId))}
                      className="px-1.5 py-0.5 bg-transparent border border-transparent hover:border-current rounded opacity-0 group-hover:opacity-100 flex items-center transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-[9px] ml-1 font-mono">CAT</span>
                    </button>
                  )}
                </div>
                {catEntries.length > 0 && (
                  <div className="space-y-2">
                    {catEntries.map(([category, catParts]) => {
                      const totalCount = catParts.length;
                      return (

                        <div 
                          key={category}
                          draggable={editingId === null && editingCategory === null && editingSectionId === null}
                          onDragStart={(e) => handleCatDragStart(e, category, Number(secId))}
                          onDragEnd={handleCatDragEnd}
                          onDragOver={(e) => handleCatDragOver(e, Number(secId))}
                          onDrop={(e) => handleCatDrop(e, category, Number(secId))}
                        >
                        <Accordion 
                          key={category} 
                          title={t(category as any, lang) || category}
                          onEditStart={() => setEditingCategory(category)}
                          onEditEnd={() => setEditingCategory(null)} 
                          badge={totalCount} 
                          defaultOpen={false}
                          expandId={expandId}
                          collapseId={collapseId}
                          onEdit={onRenameCategory ? (newName) => onRenameCategory(Number(secId), category, newName) : undefined}
                          onDelete={onDeleteCategory ? () => setConfirmDeleteCategoryData({ section: Number(secId), name: category }) : undefined}
                          onAdd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmAddData({ category, section: Number(secId) });
                          }}
                        >
                          <div className="flex flex-col gap-2">
                            {catParts.length === 0 ? (
                              <div className="text-center py-4 text-text-dim text-[10px] font-mono italic">
                                {t('empty', lang) || 'Empty'}
                              </div>
                            ) : (
                              catParts.map((part, index) => {
                                const isSelected = selectedIds.has(part.id);
                            
                            if (editingId === part.id) {
                              return (
                                <div 
                                  key={part.id} 
                                  className="p-2 rounded bg-bg-input border border-blue-500/50 flex flex-col gap-2"
                                >
                                  <input 
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="bg-bg-base border border-border-main text-xs font-mono p-1.5 rounded text-text-main focus:outline-none focus:border-blue-500 w-full"
                                    placeholder={t('name', lang)}
                                  />
                                  <input 
                                    value={editCategory}
                                    onChange={e => setEditCategory(e.target.value)}
                                    className="bg-bg-base border border-border-main text-xs font-mono p-1.5 rounded text-text-main focus:outline-none focus:border-blue-500 w-full"
                                    placeholder={t('category', lang)}
                                  />
                                  <textarea 
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className="bg-bg-base border border-border-main text-[11px] font-mono p-1.5 rounded text-text-dim focus:outline-none focus:border-blue-500 resize-y min-h-[64px] h-16 w-full"
                                    placeholder={t('content', lang)}
                                  />
                                  <div className="flex justify-between items-center mt-1">
                                    <button onClick={() => setConfirmDeleteId(part.id)} className="text-text-dim hover:text-text-main p-1">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                    <div className="flex gap-2">
                                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-transparent hover:bg-bg-input border border-transparent hover:border-border-main text-text-dim hover:text-text-main rounded text-[10px] font-mono transition-colors">
                                        CANCEL
                                      </button>
                                      <button onClick={() => handleSave(part.id)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-mono font-bold transition-colors">
                                        {t('save', lang)}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={part.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, part.id, category)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, category)}
                                onDrop={(e) => handleDrop(e, part.id, category)}
                                className={`p-2 rounded flex items-center space-x-2 cursor-pointer transition-colors group relative ${isSelected ? (part.isNegative ? 'bg-red-500/10 border border-red-500/50' : 'bg-bg-surface border border-blue-500/30') : (part.isNegative ? 'bg-red-500/5 border border-red-500/30 hover:border-red-500/50' : 'bg-bg-input border border-border-main hover:border-border-hover')}`}
                                onClick={() => onTogglePart(part.id)}
                              >
                                <input 
                                  type="checkbox"
                                  checked={bulkSelectedIds.has(part.id)}
                                  onChange={() => {}}
                                  onClick={(e) => handleToggleBulkSelect(part.id, e)}
                                  className="w-3 h-3 flex-shrink-0 cursor-pointer accent-blue-500"
                                />
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className="flex justify-between items-center pr-6">
                                    <span className={`text-[13px] font-bold font-mono truncate text-text-main`}>
                                      {part.name}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-mono truncate mt-0.5 text-text-main opacity-70">{part.content || <span className="opacity-40">----- (No Content) -----</span>}</span>
                                </div>
                                <div className="absolute right-2 flex items-center gap-1">
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity bg-bg-panel rounded shadow-sm border border-border-main overflow-hidden">
                                    <button 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onReorder && index > 0) onReorder(part.id, catParts[0].id); }}
                                      className="p-1 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                      disabled={index === 0}
                                      title="Move to Top"
                                    ><ChevronsUp className="w-3 h-3" /></button>
                                    <button 
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onReorder && index < catParts.length - 1) onReorder(part.id, catParts[catParts.length - 1].id); }}
                                      className="p-1 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                      disabled={index === catParts.length - 1}
                                      title="Move to Bottom"
                                    ><ChevronsDown className="w-3 h-3" /></button>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onDuplicate) onDuplicate(part.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-blue-400 transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCopyToMaster) onCopyToMaster(part); }}
                                    className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-green-400 transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"
                                    title="Copy to Master Prompts"
                                  >
                                    <ArrowLeftToLine className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCopyToMixer) onCopyToMixer(part); }}
                                    className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-blue-400 transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"
                                    title="Copy to Prompt Mixer"
                                  >
                                    <ArrowLeftToLine className="w-3 h-3" style={{ transform: 'rotate(180deg)' }} />
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.preventDefault(); 
                                      e.stopPropagation(); 
                                      if (confirmQuickDeleteId === part.id) {
                                        onDelete(part.id);
                                        setConfirmQuickDeleteId(null);
                                      } else {
                                        setConfirmQuickDeleteId(part.id);
                                        setTimeout(() => setConfirmQuickDeleteId(null), 3000);
                                      }
                                    }}
                                    className={`transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main ${
                                      confirmQuickDeleteId === part.id 
                                        ? 'opacity-100 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20' 
                                        : 'opacity-0 group-hover:opacity-100 text-text-dim hover:text-red-400 hover:bg-bg-input'
                                    }`}
                                    title={confirmQuickDeleteId === part.id ? "Confirm delete" : "Delete"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={(e) => startEdit(part, e)}
                                    className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-blue-400 transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <div className="flex flex-col items-center justify-center -my-1 ml-1">
                                    {part.isNegative ? (
                                      <button 
                                        className="text-[8px] leading-none opacity-100 uppercase text-red-500 font-mono flex-shrink-0 py-1 px-1 font-bold hover:text-red-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onTogglePartNegative) onTogglePartNegative(part.id);
                                        }}
                                        title="Remove Negative Tag"
                                      >
                                        NEG
                                      </button>
                                    ) : (
                                      <button 
                                        className="text-[8px] leading-none opacity-0 group-hover:opacity-100 uppercase text-text-dim font-mono flex-shrink-0 py-1 px-1 hover:text-red-400 font-bold"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onTogglePartNegative) onTogglePartNegative(part.id);
                                        }}
                                        title="Mark as Negative Part"
                                      >
                                        NEG
                                      </button>
                                    )}
                                    {part.isPinned ? (
                                      <button 
                                        className="text-[8px] leading-none opacity-100 uppercase text-blue-400 font-mono flex-shrink-0 py-1 px-1 hover:text-blue-300"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTogglePin(part.id);
                                        }}
                                      >
                                        ⭐
                                      </button>
                                    ) : (
                                      <button 
                                        className="text-[8px] leading-none opacity-0 group-hover:opacity-100 uppercase text-text-dim font-mono flex-shrink-0 py-1 px-1 hover:text-blue-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onTogglePin(part.id);
                                        }}
                                      >
                                        PIN
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }))}
                        </div>
                      </Accordion>
                        </div>
                    );
                  })}
                  </div>
                )}
              </div>
            );
          })}
          {filteredParts.length === 0 && (
            <div className="text-center py-8 text-text-dim text-[10px] font-mono">
              {t('no_parts', lang)}
              </div>
          )}
        </div>
      </div>

      {onDeleteAll && (
        <div className="p-3 bg-bg-panel border-t border-border-main shrink-0">
          <button onClick={() => setConfirmDeleteAllState(true)} className="w-full py-2 bg-bg-input border border-dashed border-red-500/30 rounded text-[11px] font-mono text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            {t('delete_all', lang)}
          </button>
        </div>
      )}
      </>
      ) : activeTab === 'mixer' ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <AttributeMixer 
            onApply={onMixAttributes || (() => {})} 
            onInsertText={onInsertText} 
            onCopyToParts={onCopyToParts} 
            theme={theme} 
            lang={lang} 
            existingParts={parts} 
            customSectionNames={customSectionNames} 
            customCategories={customCategories} 
          />
        </div>
      ) : (
        children
      )}

      <ConfirmModal
        isOpen={confirmBulkDelete}
        message={t('confirm_delete_bulk', lang)}
        onConfirm={confirmBulkDeleteExecute}
        onCancel={() => setConfirmBulkDelete(false)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        message={t('confirm_delete', lang)}
        onConfirm={() => {
          if (confirmDeleteId) onDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
        lang={lang}
      />
      <AddModal
        isOpen={confirmAddData !== null}
        title={t('add_new_item', lang)}
        onConfirm={(name, content) => {
          if (confirmAddData) onAdd(confirmAddData.category, confirmAddData.section, name, content);
          setConfirmAddData(null);
        }}
        showContentField={true}
        onCancel={() => setConfirmAddData(null)}
        lang={lang}
      />
      <AddModal
        isOpen={confirmAddCategoryData !== null}
        title="New Category"
        onConfirm={(name) => {
          if (confirmAddCategoryData && onAddCategory) onAddCategory(confirmAddCategoryData, name);
          setConfirmAddCategoryData(null);
        }}
        onCancel={() => setConfirmAddCategoryData(null)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmDeleteCategoryData !== null}
        message={`Delete category "${confirmDeleteCategoryData?.name}" and all its parts?`}
        onConfirm={() => {
          if (confirmDeleteCategoryData && onDeleteCategory) onDeleteCategory(confirmDeleteCategoryData.section, confirmDeleteCategoryData.name);
          setConfirmDeleteCategoryData(null);
        }}
        onCancel={() => setConfirmDeleteCategoryData(null)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmDeleteAllState}
        message={t('confirm_delete_all', lang)}
        onConfirm={() => {
          if (onDeleteAll) onDeleteAll();
          setConfirmDeleteAllState(false);
        }}
        onCancel={() => setConfirmDeleteAllState(false)}
        lang={lang}
      />
    </>
  );
};
