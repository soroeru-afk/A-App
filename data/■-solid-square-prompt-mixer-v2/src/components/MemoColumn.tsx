import React, { useState, useRef } from 'react';
import { MasterPrompt } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AddModal } from './AddModal';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { MoreHorizontal, Pencil, Trash2, Check, X, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Plus, Upload, List, ArrowRightToLine, ArrowLeftToLine, Copy, Pin, Star, Sparkles, AlertTriangle } from 'lucide-react';
import { Language, t } from '../i18n';
import { MARK_OPTIONS, renderMarkSymbol } from './MasterColumn';
import { parseFileNameToTitle } from '../utils/filenameParser';

interface MemoColumnProps {
  theme?: string;
  masters: MasterPrompt[];
  selectedId: string | null;
  onSelect: (id: string, insert?: boolean) => void;
  onAdd: (name: string, content?: string) => void;
  onAddBulk?: (items: { name: string; content: string }[]) => void;
  onUpdate: (id: string, updates: Partial<MasterPrompt>) => void;
  onDuplicate?: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteBulk?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onMoveBulk?: (ids: string[], direction: 'top' | 'up' | 'down' | 'bottom') => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  lang: Language;
}

async function readEntry(entry: any): Promise<{ name: string; content: string }[]> {
  const results: { name: string; content: string }[] = [];
  if (!entry) return results;

  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file(resolve, reject);
    });
    if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.text') || file.type.startsWith('text/') || file.name.endsWith('.json')) {
      try {
        const text = await file.text();
        const title = parseFileNameToTitle(file.name);
        results.push({ name: title, content: text });
      } catch (e) {
        console.error('Error reading file:', file.name, e);
      }
    }
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const entries = await new Promise<any[]>((resolve) => {
      const readAll = (acc: any[]) => {
        dirReader.readEntries((batch: any[]) => {
          if (!batch || batch.length === 0) {
            resolve(acc);
          } else {
            readAll([...acc, ...batch]);
          }
        }, () => resolve(acc));
      };
      readAll([]);
    });

    for (const childEntry of entries) {
      const childResults = await readEntry(childEntry);
      results.push(...childResults);
    }
  }

  return results;
}

export const MemoColumn: React.FC<MemoColumnProps> = ({ 
  masters, selectedId, onSelect, onAdd, onAddBulk, onUpdate, onDuplicate, onDelete, onDeleteBulk, onDeleteAll, onMoveBulk, onReorder, lang, theme 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'dropdown'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
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

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      dragCounter.current += 1;
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingFile(false);
      }
    }
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDropArea = async (e: React.DragEvent) => {
    if (draggedIndex !== null) return; // If internal item reorder

    if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;

    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDraggingFile(false);

    const items = e.dataTransfer.items;
    const filesList: { name: string; content: string }[] = [];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
          if (entry) {
            const res = await readEntry(entry);
            filesList.push(...res);
          } else {
            const file = item.getAsFile();
            if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.text') || file.type.startsWith('text/'))) {
              try {
                const text = await file.text();
                filesList.push({ name: parseFileNameToTitle(file.name), content: text });
              } catch (err) {}
            }
          }
        }
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.text') || file.type.startsWith('text/')) {
          try {
            const text = await file.text();
            filesList.push({ name: parseFileNameToTitle(file.name), content: text });
          } catch (err) {}
        }
      }
    }

    if (filesList.length > 0) {
      if (onAddBulk) {
        onAddBulk(filesList);
      } else {
        filesList.forEach(item => currentOnAdd(item.name, item.content));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const items: { name: string; content: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const title = parseFileNameToTitle(file.name);
        items.push({ name: title, content: text });
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }

    if (items.length > 0) {
      if (onAddBulk) {
        onAddBulk(items);
      } else {
        items.forEach(item => currentOnAdd(item.name, item.content));
      }
    }

    e.target.value = '';
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
                  setTimeout(() => {
                    e.target.nextElementSibling?.classList.add('hidden');
                  }, 150);
                }}
                className="w-full flex items-center justify-between bg-bg-input border border-border-main text-text-main p-1.5 focus:outline-none focus:border-border-hover cursor-pointer text-left"
              >
                {currentSelectedId ? (() => {
                  const item = currentList.find(i => i.id === currentSelectedId);
                  if (!item) return '-- SELECT --';
                  return (
                    <span className="truncate flex items-center">
                      {renderMarkSymbol(item.mark)}
                      {item.name}
                    </span>
                  );
                })() : '-- SELECT --'}
                <ChevronDown className="w-3 h-3 ml-2 shrink-0" />
              </button>
              <div className="hidden absolute top-full left-0 right-0 mt-1 max-h-[50vh] overflow-y-auto bg-bg-input border border-border-main shadow-xl z-50">
                {currentList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      currentOnSelect(item.id, true);
                    }}
                    className={`px-2 py-1.5 cursor-pointer hover:bg-bg-surface transition-colors flex items-center ${item.id === currentSelectedId ? 'bg-bg-surface' : ''}`}
                  >
                    {renderMarkSymbol(item.mark)}
                    <span className="truncate text-text-main">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 text-text-dim flex items-center">{t('master_presets', lang)}</div>
          )}
          <div className="flex items-center bg-bg-input border border-border-main shrink-0">
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-2.5 py-1 transition-colors flex items-center justify-center font-bold ${viewMode === 'list' ? 'bg-text-main text-bg-base' : 'text-text-dim hover:text-text-main hover:bg-bg-surface'}`}
              title={t('view_list', lang)}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('dropdown')} 
              className={`px-2.5 py-1 border-l border-border-main transition-colors flex items-center justify-center font-bold ${viewMode === 'dropdown' ? 'bg-text-main text-bg-base' : 'text-text-dim hover:text-text-main hover:bg-bg-surface'}`}
              title={t('view_dropdown', lang)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {bulkSelectedIds.size > 0 && viewMode === 'list' && (
        <div className="p-2 border-b border-border-main bg-bg-panel shrink-0 z-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 bg-bg-surface p-2 border border-border-hover shrink-0 min-h-[42px]">
            <span className="text-[10px] font-mono flex-shrink-0 flex items-center justify-center w-6 h-6 border border-border-main font-bold text-text-main bg-bg-input">
              {bulkSelectedIds.size}
            </span>
            
            <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main shrink-0">
              {MARK_OPTIONS.map(({ id, icon: Icon, isSolid, label }) => (
                <button 
                  key={id}
                  onClick={() => {
                    bulkSelectedIds.forEach(idVal => currentOnUpdate(idVal, { mark: id }));
                    setBulkSelectedIds(new Set());
                  }}
                  className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-text-main transition-colors"
                  style={{ color: 'var(--toolbar-icon-color)' }}
                  title={`Apply ${label}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSolid ? 'fill-current' : ''}`} />
                </button>
              ))}
              <button 
                onClick={() => {
                  bulkSelectedIds.forEach(idVal => currentOnUpdate(idVal, { mark: undefined }));
                  setBulkSelectedIds(new Set());
                }}
                className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-red-400 transition-colors"
                style={{ color: 'var(--toolbar-icon-color)' }}
                title="Remove Mark"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentOnMoveBulk && (
              <div className="flex gap-1 p-0.5 bg-bg-base border border-border-main shrink-0">
                <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'top')} className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-text-main" style={{ color: 'var(--toolbar-icon-color)' }} title="Move to Top">
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'up')} className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-text-main" style={{ color: 'var(--toolbar-icon-color)' }} title="Move Up">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'down')} className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-text-main" style={{ color: 'var(--toolbar-icon-color)' }} title="Move Down">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => currentOnMoveBulk(Array.from(bulkSelectedIds), 'bottom')} className="w-5 h-5 flex items-center justify-center hover:bg-bg-input hover:!text-text-main" style={{ color: 'var(--toolbar-icon-color)' }} title="Move to Bottom">
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button onClick={() => setConfirmDeleteBulk(true)} className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-red-500/10 border border-red-500/50 text-[10px] font-mono text-red-500 transition-colors whitespace-nowrap">
              <Trash2 className="w-3 h-3" /> DELETE
            </button>
            
            <button onClick={() => setBulkSelectedIds(new Set())} className="px-2 py-1 bg-bg-input hover:bg-border-main border border-border-hover text-[10px] font-mono text-text-dim hover:text-text-main transition-colors whitespace-nowrap">
              {t('clear_selection', lang)}
            </button>
          </div>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-scroll p-2 space-y-2 bg-bg-panel relative min-h-0"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverArea}
        onDrop={handleDropArea}
      >
        {isDraggingFile && (
          <div className="absolute inset-0 bg-bg-surface/90 backdrop-blur-xs border-2 border-dashed border-border-hover z-50 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
            <Upload className="w-10 h-10 text-text-main mb-2 animate-bounce" />
            <p className="text-xs font-mono font-bold text-text-main">
              {t('drop_files_here', lang)}
            </p>
          </div>
        )}

        {currentList.filter(item => viewMode === 'list' || item.id === currentSelectedId).map((item, index) => {
          const isSelected = currentSelectedId === item.id;
          const isNegative = false;
          
          if (editingId === item.id) {
            return (
              <div 
                key={item.id} 
                className={`p-3 bg-bg-input border ${isNegative ? 'border-red-500/50' : 'border-border-hover'} flex flex-col gap-2`}
              >
                {!isNegative && (
                  <div className="flex gap-1.5 p-1 bg-bg-base border border-border-main">
                    {MARK_OPTIONS.map(({ id, icon: Icon, isSolid, label }) => {
                      const isSelected = editMark === id;
                      return (
                        <button 
                          key={id} 
                          type="button" 
                          onClick={() => setEditMark(isSelected ? undefined : id)} 
                          className={`w-6 h-6 flex items-center justify-center border transition-all ${isSelected ? 'border-border-hover bg-bg-surface font-bold text-text-main' : 'border-border-main hover:bg-bg-surface text-text-dim hover:text-text-main'}`}
                          title={label}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSolid ? 'fill-current' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase">{t('name', lang)}</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-bg-base border border-border-main text-text-main text-xs p-1.5 focus:outline-none focus:border-border-hover font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-dim block mb-1 uppercase">{t('content', lang)}</label>
                  <AutoResizeTextarea
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    minRows={3}
                    className="w-full bg-bg-base border border-border-main text-text-main text-[13px] leading-relaxed p-1.5 focus:outline-none focus:border-border-hover font-mono resize-none"
                  />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <button 
                    onClick={() => {
                      setConfirmQuickDeleteId(item.id);
                    }}
                    className="px-2 py-1 bg-transparent hover:bg-red-500/10 border border-red-500/40 text-[10px] font-mono text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> DELETE
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-bg-base hover:bg-bg-surface border border-border-main text-[10px] font-mono text-text-dim hover:text-text-main transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> {t('cancel', lang)}
                    </button>
                    <button 
                      onClick={() => handleSave(item.id)}
                      className="px-3 py-1 bg-text-main text-bg-base hover:opacity-90 text-[10px] font-mono font-bold transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> {t('save', lang)}
                    </button>
                  </div>
                </div>

                <ConfirmModal
                  isOpen={confirmQuickDeleteId === item.id}
                  message={t('confirm_delete', lang)}
                  onConfirm={() => {
                    currentOnDelete(item.id);
                    setConfirmQuickDeleteId(null);
                    setEditingId(null);
                  }}
                  onCancel={() => setConfirmQuickDeleteId(null)}
                  lang={lang}
                />
              </div>
            );
          }

          const isBulkSelected = bulkSelectedIds.has(item.id);

          return (
            <div 
              key={item.id}
              draggable={viewMode === 'list'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`group border transition-all ${
                isSelected 
                  ? 'border-border-hover bg-bg-surface' 
                  : (isBulkSelected ? 'border-border-hover bg-bg-surface/50' : 'border-border-main bg-bg-input hover:border-border-hover')
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div 
                onClick={() => {
                  currentOnSelect(item.id, true);
                }}
                className="p-2 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {viewMode === 'list' && (
                    <input 
                      type="checkbox"
                      checked={isBulkSelected}
                      onChange={() => {}}
                      onClick={(e) => handleToggleBulk(item.id, e)}
                      className="w-3.5 h-3.5 rounded-none accent-text-main cursor-pointer shrink-0"
                    />
                  )}

                  {renderMarkSymbol(item.mark)}

                  <span className={`font-mono text-xs truncate ${isSelected ? 'font-bold text-text-main' : 'text-text-main font-bold'}`}>
                    {item.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button 
                    onClick={(e) => startEdit(item, e)}
                    className="p-1 hover:bg-bg-surface text-text-dim hover:text-text-main transition-colors"
                    title={t('edit', lang)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(item.id);
                    }}
                    className="p-1 hover:bg-bg-surface text-text-dim hover:text-red-400 transition-colors"
                    title={t('delete', lang)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedActionId(expandedActionId === item.id ? null : item.id);
                    }}
                    className="p-1 hover:bg-bg-surface text-text-dim hover:text-text-main transition-colors"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.content && (
                <div 
                  onClick={() => {
                    currentOnSelect(item.id, true);
                  }}
                  className="px-2 pb-2 text-[13px] leading-relaxed font-mono text-text-main line-clamp-3 cursor-pointer opacity-90"
                >
                  {item.content}
                </div>
              )}

              {expandedActionId === item.id && (
                <div className="px-2 py-1.5 bg-bg-base border-t border-border-main flex items-center justify-end gap-1.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDuplicate) onDuplicate(item.id);
                      setExpandedActionId(null);
                    }}
                    className="px-2 py-1 bg-bg-input hover:bg-bg-surface border border-border-main text-[10px] font-mono text-text-dim hover:text-text-main transition-colors flex items-center gap-1"
                    title="Duplicate memo"
                  >
                    <Copy className="w-3 h-3" /> COPY
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedActionId(null);
                    }}
                    className="p-1.5 text-text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors bg-bg-panel border border-border-main"
                    title="Close"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-bg-panel border-t border-border-main flex gap-2">
        <button 
          onClick={() => setConfirmAdd(true)} 
          className="flex-1 py-2 bg-bg-input hover:bg-bg-surface border border-border-main text-[11px] font-mono font-bold text-text-main transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {t('add_memo', lang)}
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex-1 py-2 bg-bg-input hover:bg-bg-surface border border-border-main text-[11px] font-mono font-bold text-text-main transition-colors flex items-center justify-center gap-1.5"
          title={lang === 'en' ? 'Load text files' : 'テキストファイルを一括読込'}
        >
          <Upload className="w-3.5 h-3.5" /> {t('load_files', lang)}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".txt,.md,.text,text/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        {currentOnDeleteAll && (
          <button onClick={() => setConfirmDeleteAllState(true)} className="py-2 px-3 bg-bg-input border border-red-500/40 text-[11px] font-mono font-bold text-red-500 hover:text-white hover:bg-red-500 transition-colors">
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
