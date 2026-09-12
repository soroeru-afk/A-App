import React, { useState } from 'react';
import { MasterPrompt } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AddModal } from './AddModal';
import { MoreHorizontal, Pencil, Trash2, Check, X, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Plus, List, ArrowRightToLine, ArrowLeftToLine, Copy } from 'lucide-react';
import { Language, t } from '../i18n';

interface MasterColumnProps {
  masters: MasterPrompt[];
  negatives?: MasterPrompt[];
  selectedId: string | null;
  selectedNegativeId: string | null;
  onSelect: (id: string, insert?: boolean) => void;
  onSelectNegative: (id: string, insert?: boolean) => void;
  onAdd: (name: string, content?: string) => void;
  onAddNegative: (name: string, content?: string) => void;
  onUpdate: (id: string, updates: Partial<MasterPrompt>) => void;
  onUpdateNegative: (id: string, updates: Partial<MasterPrompt>) => void;
  onDuplicate?: (id: string) => void;
  onDuplicateNegative?: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteNegative: (id: string) => void;
  onDeleteBulk?: (ids: string[]) => void;
  onDeleteBulkNegative?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onDeleteAllNegative?: () => void;
  onMoveBulk?: (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => void;
  onMoveBulkNegative?: (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  onReorderNegative?: (startIndex: number, endIndex: number) => void;
  onCopyToPart?: (item: MasterPrompt) => void;
  onCopyBulkToPart?: (items: MasterPrompt[]) => void;
  onCopyBulkToPartDirect?: (items: MasterPrompt[], category: string, section: number) => void;
  uniqueCategories?: [string, number][];
  activeTab: 'master' | 'negative';
  theme?: string;
  setActiveTab: (tab: 'master' | 'negative') => void;
  lang: Language;
}

export const MasterColumn: React.FC<MasterColumnProps> = ({ 
  masters, negatives = [], selectedId, selectedNegativeId, onSelect, onSelectNegative, onAdd, onAddNegative, onUpdate, onUpdateNegative, onDuplicate, onDuplicateNegative, onDelete, onDeleteNegative, onDeleteBulk, onDeleteBulkNegative, onDeleteAll, onDeleteAllNegative, onMoveBulk, onMoveBulkNegative, onReorder, onReorderNegative, onCopyToPart, onCopyBulkToPart, onCopyBulkToPartDirect, uniqueCategories, activeTab, setActiveTab, lang, theme 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'dropdown'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editNegativeContent, setEditNegativeContent] = useState<string | undefined>(undefined);
  const [editMark, setEditMark] = useState<string | undefined>(undefined);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmQuickDeleteId, setConfirmQuickDeleteId] = useState<string | null>(null);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteBulk, setConfirmDeleteBulk] = useState(false);
  const [confirmDeleteAllState, setConfirmDeleteAllState] = useState(false);

  const currentList = activeTab === 'master' ? masters : negatives;
  const currentSelectedId = activeTab === 'master' ? selectedId : selectedNegativeId;
  const currentOnSelect = activeTab === 'master' ? onSelect : onSelectNegative;
  const currentOnAdd = activeTab === 'master' ? onAdd : onAddNegative;
  const currentOnUpdate = activeTab === 'master' ? onUpdate : onUpdateNegative;
  const currentOnDelete = activeTab === 'master' ? onDelete : onDeleteNegative;
  const currentOnDeleteBulk = activeTab === 'master' ? onDeleteBulk : onDeleteBulkNegative;
  const currentOnDeleteAll = activeTab === 'master' ? onDeleteAll : onDeleteAllNegative;
  const currentOnMoveBulk = activeTab === 'master' ? onMoveBulk : onMoveBulkNegative;
  const currentOnReorder = activeTab === 'master' ? onReorder : onReorderNegative;
  const currentOnDuplicate = activeTab === 'master' ? onDuplicate : onDuplicateNegative;

  const handleToggleBulk = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBulkSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    if (currentOnReorder) {
      currentOnReorder(draggedIndex, index);
    }
  };

  const startEdit = (master: MasterPrompt, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(master.id);
    setEditName(master.name);
    setEditContent(master.content);
    setEditNegativeContent(master.negativeContent);
    setEditMark(master.mark);
  };

  const handleSave = (id: string) => {
    currentOnUpdate(id, { name: editName, content: editContent, mark: editMark, negativeContent: editNegativeContent && editNegativeContent.trim() !== '' ? editNegativeContent : undefined });
    setEditingId(null);
  };

  return (
    <>
      <div className="p-2 bg-bg-panel border-b border-border-main shrink-0 overflow-x-auto">
        <div className="flex w-full gap-1 bg-bg-base border border-border-main p-1.5 text-[10px] font-mono uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('master')} 
            className={`flex-1 py-1.5 px-2 border transition-colors whitespace-nowrap ${activeTab === 'master' ? (theme === 'mono' ? 'bg-black text-white border-black' : 'bg-bg-surface text-text-main border-text-main') : 'border-transparent text-text-dim hover:text-text-main'}`}
          >
            {t('master_prompts', lang)}
          </button>
          <button 
            onClick={() => setActiveTab('negative')} 
            className={`flex-1 py-1.5 px-2 border transition-colors whitespace-nowrap ${activeTab === 'negative' ? (theme === 'mono' ? 'bg-red-900 text-white border-red-900' : 'bg-bg-surface text-red-500 border-red-500') : 'border-transparent text-text-dim hover:text-red-500'}`}
          >
            {t('negative_prompts', lang)}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-bg-panel border-b border-border-main shrink-0">
        <div className="flex gap-2 text-[10px] font-mono w-full">
          {viewMode === 'dropdown' ? (
            <div className="relative flex-1">
              <button 
                onClick={(e) => {
                  e.currentTarget.nextElementSibling?.classList.toggle('hidden');
                }}
                onBlur={(e) => {
                  // Small delay to allow click on options
                  setTimeout(() => {
                    e.target.nextElementSibling?.classList.add('hidden');
                  }, 150);
                }}
                className="w-full flex items-center justify-between bg-bg-input border border-border-main text-text-main p-1.5 rounded focus:outline-none focus:border-blue-500 cursor-pointer text-left"
              >
                {currentSelectedId ? (() => {
                  const item = currentList.find(i => i.id === currentSelectedId);
                  if (!item) return '-- SELECT --';
                  return (
                    <span className="truncate">
                      {item.mark && <span className={`mr-1 ${item.mark === '✔' ? 'text-blue-500' : ''}`}>{item.mark}</span>}
                      {item.name}
                    </span>
                  );
                })() : '-- SELECT --'}
                <ChevronDown className="w-3 h-3 ml-2 shrink-0" />
              </button>
              <div className="hidden absolute top-full left-0 right-0 mt-1 max-h-[50vh] overflow-y-auto bg-bg-input border border-border-main rounded shadow-xl z-50">
                {currentList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      currentOnSelect(item.id, false);
                    }}
                    className={`px-2 py-1.5 cursor-pointer hover:bg-bg-surface transition-colors flex items-center ${item.id === currentSelectedId ? 'bg-bg-surface' : ''}`}
                  >
                    {item.mark && <span className={`mr-1 shrink-0 ${item.mark === '✔' ? 'text-blue-500' : ''}`}>{item.mark}</span>}
                    <span className="truncate text-text-main">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 text-text-dim flex items-center">{t('master_presets', lang)}</div>
          )}
          <div className="flex items-center bg-bg-input border border-border-main rounded shrink-0">
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-2 py-1 rounded-l transition-colors flex items-center justify-center ${viewMode === 'list' ? (theme === 'mono' ? 'bg-black text-white' : 'bg-border-hover text-text-main') : (theme === 'mono' ? 'text-text-dim hover:bg-gray-200 hover:text-black' : 'text-text-dim hover:bg-border-main')}`}
              title={t('view_list', lang)}
            >
              <List className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setViewMode('dropdown')} 
              className={`px-2 py-1 rounded-r border-l border-border-main transition-colors flex items-center justify-center ${viewMode === 'dropdown' ? (theme === 'mono' ? 'bg-black text-white' : 'bg-border-hover text-text-main') : (theme === 'mono' ? 'text-text-dim hover:bg-gray-200 hover:text-black' : 'text-text-dim hover:bg-border-main')}`}
              title={t('view_dropdown', lang)}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-border-main bg-bg-panel shrink-0 z-10 shadow-sm">
<div className={`flex flex-wrap items-center gap-2 bg-bg-surface p-2 border ${bulkSelectedIds.size > 0 ? "border-blue-500/30" : "border-border-main"} rounded shadow-sm shrink-0 min-h-[42px]`}>
              <span className={`text-[10px] font-mono flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full font-bold ${bulkSelectedIds.size > 0 ? "text-blue-400 bg-blue-500/10" : "text-text-dim bg-bg-input"}`}>{bulkSelectedIds.size}</span>
              
              {activeTab === 'master' && (
                <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main rounded shrink-0">
                  {['⭐', '✔', '💡', '📌', '⚠️', '❌'].map(m => (
                    <button 
                      key={m}
                      onClick={() => {
                        bulkSelectedIds.forEach(id => currentOnUpdate(id, { mark: m === '❌' ? undefined : m }));
                        setBulkSelectedIds(new Set());
                      }}
                      disabled={bulkSelectedIds.size === 0}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-bg-input ${m === "✔" ? "text-blue-500" : ""} disabled:opacity-50`}
                      title={m === '❌' ? "Remove Mark" : "Apply Mark"}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {currentOnMoveBulk && (
                <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main rounded shrink-0">
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'top')} disabled={bulkSelectedIds.size === 0} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main disabled:opacity-50" title="Move to Top">
                    <ChevronsUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'up')} disabled={bulkSelectedIds.size === 0} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main disabled:opacity-50" title="Move Up">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'down')} disabled={bulkSelectedIds.size === 0} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main disabled:opacity-50" title="Move Down">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'bottom')} disabled={bulkSelectedIds.size === 0} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main disabled:opacity-50" title="Move to Bottom">
                    <ChevronsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {onCopyBulkToPart && (
                <select 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const itemsToCopy = currentList.filter(item => bulkSelectedIds.has(item.id));
                    
                    if (val === 'default') {
                      onCopyBulkToPart(itemsToCopy);
                    } else {
                      const [sectionStr, ...catParts] = val.split(':');
                      const category = catParts.join(':');
                      const section = Number(sectionStr);
                      if (onCopyBulkToPartDirect) {
                        onCopyBulkToPartDirect(itemsToCopy, category, section);
                      }
                    }
                    setBulkSelectedIds(new Set());
                    e.target.value = '';
                  }}
                  value=""
                  disabled={bulkSelectedIds.size === 0}
                  className="flex-1 min-w-[70px] bg-bg-input hover:bg-bg-surface border border-border-main hover:border-text-dim text-text-main text-[10px] font-mono px-2 py-1 rounded outline-none transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled className="bg-bg-panel text-text-dim">Copy to Parts...</option>
                  <option value="default" className="bg-bg-panel text-text-main">{t('save_as_part', lang)}...</option>
                  {uniqueCategories && uniqueCategories.length > 0 && <option disabled className="bg-bg-panel text-text-dim">──────────</option>}
                  {uniqueCategories?.map(([cat, sec]) => (
                    <option key={`${sec}:${cat}`} value={`${sec}:${cat}`} className="bg-bg-panel text-text-main">
                      {t(cat as any, lang) || cat} ({t(`sec_${sec === 1 ? 'composition' : sec === 2 ? 'pose' : sec === 3 ? 'details' : 'context'}` as any, lang)})
                    </option>
                  ))}
                </select>
              )}
              
              <button onClick={() => setConfirmDeleteBulk(true)} disabled={bulkSelectedIds.size === 0} className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-red-500/10 border border-red-500/50 rounded text-[10px] font-mono text-red-500 transition-colors whitespace-nowrap disabled:opacity-50">
                <Trash2 className="w-3 h-3" /> DELETE
              </button>
              
              <button onClick={() => setBulkSelectedIds(new Set())} disabled={bulkSelectedIds.size === 0} className="px-2 py-1 bg-bg-input hover:bg-border-main border border-border-hover rounded text-[10px] font-mono text-text-dim hover:text-text-main transition-colors whitespace-nowrap disabled:opacity-50">
                {t('clear_selection', lang)}
              </button>
            </div>
      </div>
      <div className="flex-1 overflow-y-scroll p-2 space-y-2 bg-bg-panel relative">
        {currentList.filter(item => viewMode === 'list' || item.id === currentSelectedId).map((item, index) => {
          const isSelected = currentSelectedId === item.id;
          const isNegative = activeTab === 'negative';
          
          if (editingId === item.id) {
            return (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg bg-bg-input border ${isNegative ? 'border-red-500/50' : 'border-blue-500/50'} flex flex-col gap-2`}
              >
                {!isNegative && (
                  <div className="flex gap-2 p-1 bg-bg-base border border-border-main rounded">
                    {['⭐', '✔', '💡', '📌', '⚠️'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setEditMark(prev => prev === m ? undefined : m)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-sm ${editMark === m ? 'bg-bg-surface border border-blue-500/50' : 'hover:bg-bg-input'} ${m === '✔' ? 'text-blue-500' : ''}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                <input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={`bg-bg-base border border-border-main text-xs font-mono p-1.5 rounded text-text-main focus:outline-none ${isNegative ? 'focus:border-red-500' : 'focus:border-blue-500'}`}
                  placeholder={t('name', lang)}
                />
                <textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className={`bg-bg-base border border-border-main text-[11px] font-mono p-1.5 rounded text-text-dim focus:outline-none ${isNegative ? 'focus:border-red-500' : 'focus:border-blue-500'} resize-y min-h-[64px] h-16`}
                  placeholder={t('content', lang)}
                />
                {!isNegative && (
                  <textarea 
                    value={editNegativeContent || ''}
                    onChange={e => setEditNegativeContent(e.target.value || undefined)}
                    className={`bg-bg-base border border-border-main text-[11px] font-mono p-1.5 rounded text-text-dim focus:outline-none focus:border-red-500 resize-y min-h-[64px] h-16`}
                    placeholder="NEGATIVE PROMPT"
                  />
                )}
                <div className="flex justify-between items-center mt-1">
                  <button onClick={() => setConfirmDeleteId(item.id)} className="text-text-dim hover:text-text-main p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(editContent);
                        setCopiedItemId('edit_' + item.id);
                        setTimeout(() => setCopiedItemId(null), 2000);
                      }}
                      className={`px-3 py-1.5 flex items-center justify-center gap-1.5 bg-transparent hover:bg-bg-input border text-[10px] font-mono transition-colors rounded ${
                        copiedItemId === 'edit_' + item.id ? 'border-green-500/50 text-green-500 bg-green-500/10' : 'border-border-main text-text-dim hover:text-green-400'
                      }`}
                      title={lang === 'en' ? "Copy Prompt Text" : "プロンプトをコピー"}
                    >
                      {copiedItemId === 'edit_' + item.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <div className="relative w-3 h-3 flex items-center justify-center">
                          <div className="border border-current rounded-[2px] w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>
                        </div>
                      )}
                      COPY
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-transparent hover:bg-bg-input border border-transparent hover:border-border-main text-text-dim hover:text-text-main rounded text-[10px] font-mono transition-colors">
                      CANCEL
                    </button>
                    <button onClick={() => handleSave(item.id)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-mono font-bold transition-colors">
                      {t('save', lang)}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              draggable={viewMode === 'list'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`block p-3 rounded-lg group cursor-pointer transition-colors relative ${(theme === 'light' || theme === 'mono') ? (isNegative ? 'bg-red-50' : 'bg-white shadow-sm') : (isSelected ? (isNegative ? 'bg-red-500/10' : 'bg-bg-input') : (isNegative ? 'bg-red-500/5' : 'bg-transparent'))} ${isSelected ? (isNegative ? 'border border-red-500/50' : 'border border-blue-500/50') : (isNegative ? 'border border-red-500/30 hover:border-red-500/50' : 'border border-border-main hover:border-border-hover')}`}
              onClick={(e) => {
                e.preventDefault();
                currentOnSelect(item.id);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  {viewMode === 'list' && (
                    <input 
                      type="checkbox"
                      checked={bulkSelectedIds.has(item.id)}
                      onChange={(e) => handleToggleBulk(item.id, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 cursor-pointer"
                    />
                  )}
                  <div className={`text-[13px] font-bold font-mono pr-6 ${isSelected ? 'text-text-main' : 'text-text-dim'}`}>
                    {item.mark && <span className={`mr-1 ${item.mark === '✔' ? 'text-blue-500' : ''}`}>{item.mark}</span>}
                    {item.name.toUpperCase()}
                    {item.negativeContent !== undefined && <span className="ml-2 text-[8px] bg-accent-main text-white px-1 py-0.5 rounded">SET</span>}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? (isNegative ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]') : 'bg-transparent border border-gray-600'}`}></div>
              </div>
              <div className={`mt-1 text-[10px] font-mono truncate ${isSelected ? 'text-text-dim' : 'text-text-dim'}`}>
                {item.content || <span className="opacity-40">----- (No Content) -----</span>}
              </div>
              <div className={`absolute top-2 right-6 flex items-center gap-1`}>
                {expandedActionId !== item.id && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.content);
                        setCopiedItemId(item.id);
                        setTimeout(() => setCopiedItemId(null), 2000);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 bg-bg-panel rounded shadow-sm border border-border-main transition-all ${
                        copiedItemId === item.id 
                          ? 'text-green-500 bg-green-500/10 opacity-100'
                          : 'text-text-dim hover:text-green-400'
                      }`}
                      title={lang === 'en' ? 'Copy Prompt Text' : 'プロンプトをコピー'}
                    >
                      {copiedItemId === item.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <div className="relative w-3 h-3 flex items-center justify-center">
                          <div className="border border-current rounded-[2px] w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(item.id); }}
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel rounded shadow-sm border border-border-main"
                      title={lang === 'en' ? 'More actions' : 'メニュー'}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </>
                )}
                
                {(expandedActionId === item.id || confirmQuickDeleteId === item.id) && (
                  <>
                    <div className="flex items-center bg-bg-panel rounded shadow-sm border border-border-main overflow-hidden">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentOnReorder && index > 0) currentOnReorder(index, 0); }}
                        className="p-1.5 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={index === 0}
                        title="Move to Top"
                      ><ChevronsUp className="w-3 h-3" /></button>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentOnReorder && index < currentList.length - 1) currentOnReorder(index, currentList.length - 1); }}
                        className="p-1.5 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        disabled={index === currentList.length - 1}
                        title="Move to Bottom"
                      ><ChevronsDown className="w-3 h-3" /></button>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (currentOnDuplicate) currentOnDuplicate(item.id); }}
                      className="p-1.5 text-text-dim hover:text-blue-400 bg-bg-panel rounded shadow-sm border border-border-main"
                      title="Duplicate"
                    ><Copy className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onCopyToPart) onCopyToPart(item); }}
                      className="p-1.5 text-text-dim hover:text-green-400 bg-bg-panel rounded shadow-sm border border-border-main"
                      title="Copy to Variation Parts"
                    ><ArrowRightToLine className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirmQuickDeleteId === item.id) {
                          currentOnDelete(item.id);
                          setConfirmQuickDeleteId(null);
                        } else {
                          setConfirmQuickDeleteId(item.id);
                          setTimeout(() => setConfirmQuickDeleteId(null), 3000);
                        }
                      }}
                      className={`p-1.5 bg-bg-panel rounded shadow-sm border border-border-main ${
                        confirmQuickDeleteId === item.id 
                          ? 'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 opacity-100' 
                          : 'text-text-dim hover:text-red-400 hover:bg-bg-input'
                      }`}
                      title={confirmQuickDeleteId === item.id ? "Confirm delete" : "Delete"}
                    ><Trash2 className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => startEdit(item, e)}
                      className="p-1.5 text-text-dim hover:text-blue-400 bg-bg-panel rounded shadow-sm border border-border-main"
                    ><Pencil className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(null); }}
                      className="p-1.5 text-text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors bg-bg-panel rounded shadow-sm border border-border-main"
                      title="Close"
                    ><X className="w-3 h-3" /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 bg-bg-panel border-t border-border-main flex gap-2">
        <button onClick={() => setConfirmAdd(true)} className="flex-1 py-2 bg-bg-input border border-dashed border-border-hover rounded text-[11px] font-mono text-text-dim hover:text-text-main transition-colors">
          {t('add_master', lang)}
        </button>
        {currentOnDeleteAll && (
          <button onClick={() => setConfirmDeleteAllState(true)} className="py-2 px-3 bg-bg-input border border-dashed border-red-500/30 rounded text-[11px] font-mono text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            {t('delete_all', lang)}
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        message={t('confirm_delete', lang)}
        onConfirm={() => {
          if (confirmDeleteId) currentOnDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
        lang={lang}
      />
      <AddModal
        isOpen={confirmAdd}
        title={t('add_new_item', lang)}
        onConfirm={(name, content) => {
          currentOnAdd(name, content);
          setConfirmAdd(false);
        }}
        showContentField={true}
        onCancel={() => setConfirmAdd(false)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmDeleteBulk}
        message={t('confirm_delete_bulk', lang)}
        onConfirm={() => {
          if (currentOnDeleteBulk) {
            currentOnDeleteBulk(Array.from(bulkSelectedIds));
            setBulkSelectedIds(new Set());
          }
          setConfirmDeleteBulk(false);
        }}
        onCancel={() => setConfirmDeleteBulk(false)}
        lang={lang}
      />
      <ConfirmModal
        isOpen={confirmDeleteAllState}
        message={t('confirm_delete_all', lang)}
        onConfirm={() => {
          if (currentOnDeleteAll) currentOnDeleteAll();
          setConfirmDeleteAllState(false);
        }}
        onCancel={() => setConfirmDeleteAllState(false)}
        lang={lang}
      />
    </>
  );
};
