import React, { useState } from 'react';
import { MasterPrompt } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AddModal } from './AddModal';
import { Pencil, Trash2, Check, X, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Plus, List, ArrowRightToLine, ArrowLeftToLine, Copy } from 'lucide-react';
import { Language, t } from '../i18n';

interface MemoColumnProps {
  theme?: string;
  masters: MasterPrompt[];
    selectedId: string | null;
    onSelect: (id: string, insert?: boolean) => void;
    onAdd: (name: string) => void;
    onUpdate: (id: string, updates: Partial<MasterPrompt>) => void;
    onDuplicate?: (id: string) => void;
    onDelete: (id: string) => void;
    onDeleteBulk?: (ids: string[]) => void;
    onDeleteAll?: () => void;
    onMoveBulk?: (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => void;
    onReorder?: (startIndex: number, endIndex: number) => void;
          lang: Language;
}

export const MemoColumn: React.FC<MemoColumnProps> = ({ 
  masters, selectedId, onSelect, onAdd, onUpdate, onDuplicate, onDelete, onDeleteBulk, onDeleteAll, onMoveBulk, onReorder, lang, theme 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'dropdown'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMark, setEditMark] = useState<string | undefined>(undefined);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmQuickDeleteId, setConfirmQuickDeleteId] = useState<string | null>(null);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteBulk, setConfirmDeleteBulk] = useState(false);
  const [confirmDeleteAllState, setConfirmDeleteAllState] = useState(false);

  const currentList = masters;
  const currentSelectedId = selectedId;
  const currentOnSelect = onSelect;
  const currentOnAdd = onAdd;
  const currentOnUpdate = onUpdate;
  const currentOnDelete = onDelete;
  const currentOnDeleteBulk = onDeleteBulk;
  const currentOnDeleteAll = onDeleteAll;
  const currentOnMoveBulk = onMoveBulk;
  const currentOnReorder = onReorder;

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
    setEditMark(master.mark);
  };

  const handleSave = (id: string) => {
    currentOnUpdate(id, { name: editName, content: editContent, mark: editMark });
    setEditingId(null);
  };

  return (
    <>
      

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
                      currentOnSelect(item.id, true);
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
              className={`px-2 py-1 rounded-l transition-colors flex items-center justify-center ${viewMode === 'list' ? 'bg-border-hover text-text-main' : 'text-text-dim hover:bg-border-main'}`}
              title={t('view_list', lang)}
            >
              <List className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setViewMode('dropdown')} 
              className={`px-2 py-1 rounded-r border-l border-border-main transition-colors flex items-center justify-center ${viewMode === 'dropdown' ? 'bg-border-hover text-text-main' : 'text-text-dim hover:bg-border-main'}`}
              title={t('view_dropdown', lang)}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll p-2 space-y-2 bg-bg-panel relative">
        {bulkSelectedIds.size > 0 && viewMode === 'list' && (
          <div className="sticky top-0 z-20 bg-bg-panel/90 backdrop-blur pb-2 mb-2 border-b border-border-main flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-text-dim whitespace-nowrap">{bulkSelectedIds.size} selected</span>
              {true && (
                <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main rounded shrink-0">
                  {['⭐', '✔', '💡', '📌', '⚠️', '❌'].map(m => (
                    <button 
                      key={m}
                      onClick={() => {
                        bulkSelectedIds.forEach(id => currentOnUpdate(id, { mark: m === '❌' ? undefined : m }));
                        setBulkSelectedIds(new Set());
                      }}
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs hover:bg-bg-input ${m === '✔' ? 'text-blue-500' : ''}`}
                      title={m === '❌' ? "Remove Mark" : "Apply Mark"}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-end flex-1">
              {currentOnMoveBulk && (
                <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main rounded shrink-0">
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'top')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main" title="Move to Top">
                    <ChevronsUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'up')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main" title="Move Up">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'down')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main" title="Move Down">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'bottom')} className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-input text-text-dim hover:text-text-main" title="Move to Bottom">
                    <ChevronsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button onClick={() => setBulkSelectedIds(new Set())} className="px-2 py-1 bg-bg-input hover:bg-border-main border border-border-hover rounded text-[10px] font-mono text-text-dim transition-colors">
                {t('clear_selection', lang)}
              </button>
              
              <button onClick={() => setConfirmDeleteBulk(true)} className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-red-500/10 border border-red-500/50 rounded text-[10px] font-mono text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" /> DELETE
              </button>
            </div>
          </div>
        )}

        {currentList.filter(item => viewMode === 'list' || item.id === currentSelectedId).map((item, index) => {
          const isSelected = currentSelectedId === item.id;
          const isNegative = false;
          
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
                <div className="flex justify-between items-center mt-1">
                  <button onClick={() => setConfirmDeleteId(item.id)} className="text-text-dim hover:text-text-main p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="text-text-dim hover:text-text-dim p-1">
                      <X className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleSave(item.id)} className="text-green-500 hover:text-green-400 p-1">
                      <Check className="w-3 h-3" />
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
              className={`block p-3 rounded-lg group cursor-pointer transition-colors relative ${(theme === 'light' || theme === 'mono') ? 'bg-white shadow-sm' : (isSelected ? 'bg-bg-input' : 'bg-transparent')} ${isSelected ? 'border border-blue-500/50' : 'border border-border-main hover:border-border-hover'}`}
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
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? (isNegative ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]') : 'bg-transparent border border-gray-600'}`}></div>
              </div>
              <div className={`mt-1 text-[10px] font-mono truncate ${isSelected ? 'text-text-dim' : 'text-text-dim'}`}>
                {item.content}
              </div>
              <div className={`absolute top-2 right-6 ${confirmQuickDeleteId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex items-center transition-opacity bg-bg-panel rounded shadow-sm border border-border-main overflow-hidden`}>
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
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onDuplicate) onDuplicate(item.id); }}
                  className="p-1.5 text-text-dim hover:text-text-main hover:bg-bg-input transition-colors"
                  title="Duplicate"
                ><Copy className="w-3 h-3" /></button>
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
                  className={`p-1.5 transition-colors ${
                    confirmQuickDeleteId === item.id 
                      ? 'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 opacity-100' 
                      : 'text-text-dim hover:text-red-400 hover:bg-bg-input'
                  }`}
                  title={confirmQuickDeleteId === item.id ? "Confirm delete" : "Delete"}
                ><Trash2 className="w-3 h-3" /></button>
                <button 
                  onClick={(e) => startEdit(item, e)}
                  className={`p-1.5 text-text-dim ${isNegative ? 'hover:text-red-400' : 'hover:text-blue-400'} hover:bg-bg-input transition-colors`}
                ><Pencil className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 bg-bg-panel border-t border-border-main flex gap-2">
        <button onClick={() => setConfirmAdd(true)} className="flex-1 py-2 bg-bg-input border border-dashed border-border-hover rounded text-[11px] font-mono text-text-dim hover:text-text-main transition-colors">
          {t('add_memo', lang)}
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
        onConfirm={(name) => {
          currentOnAdd(name);
          setConfirmAdd(false);
        }}
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
