import React, { useState, useRef } from 'react';
import { MasterPrompt } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { AddModal } from './AddModal';
import { MoreHorizontal, Pencil, Trash2, Check, X, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Plus, List, ArrowRightToLine, ArrowLeftToLine, Copy, Pin, Star, Sparkles, AlertTriangle, Upload } from 'lucide-react';
import { Language, t } from '../i18n';
import { MARK_OPTIONS, renderMarkSymbol } from './MasterColumn';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { extractMemoTitleFromFilename } from '../utils/filenameParser';

interface MemoColumnProps {
  theme?: string;
  masters: MasterPrompt[];
  selectedId: string | null;
  onSelect: (id: string, insert?: boolean) => void;
  onAdd: (name: string, content?: string) => void;
  onImportFiles?: (items: { name: string; content: string }[]) => void;
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
  masters, selectedId, onSelect, onAdd, onImportFiles, onUpdate, onDuplicate, onDelete, onDeleteBulk, onDeleteAll, onMoveBulk, onReorder, lang, theme 
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
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);
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

  const processLoadedFiles = async (files: File[]) => {
    const validFiles = files.filter(f => {
      const ext = f.name.toLowerCase();
      return ext.endsWith('.txt') || ext.endsWith('.md') || ext.endsWith('.text') || f.type.startsWith('text/') || !ext.includes('.');
    });

    if (validFiles.length === 0) return;

    const readPromises = validFiles.map(file => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = (e.target?.result as string) || '';
          const name = extractMemoTitleFromFilename(file.name);
          resolve({ name, content });
        };
        reader.onerror = () => {
          resolve({ name: extractMemoTitleFromFilename(file.name), content: '' });
        };
        reader.readAsText(file);
      });
    });

    const results = await Promise.all(readPromises);
    if (onImportFiles) {
      onImportFiles(results);
    } else {
      results.forEach(res => {
        currentOnAdd(res.name, res.content);
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const f = e.target.files.item(i);
        if (f) files.push(f);
      }
      if (files.length > 0) {
        processLoadedFiles(files);
      }
    }
    e.target.value = '';
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    // Check if dropping files/folders from OS
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOverFiles(false);

      // Support webkitGetAsEntry for folders or files
      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const files: File[] = [];
        const queue: any[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
            if (entry) {
              queue.push(entry);
            } else {
              const file = item.getAsFile();
              if (file) files.push(file);
            }
          }
        }

        const readEntry = async (entry: any) => {
          if (entry.isFile) {
            return new Promise<void>((resolve) => {
              entry.file((file: File) => {
                files.push(file);
                resolve();
              }, () => resolve());
            });
          } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            return new Promise<void>((resolve) => {
              dirReader.readEntries(async (entries: any[]) => {
                for (const subEntry of entries) {
                  await readEntry(subEntry);
                }
                resolve();
              }, () => resolve());
            });
          }
        };

        if (queue.length > 0) {
          for (const entry of queue) {
            await readEntry(entry);
          }
          if (files.length > 0) {
            processLoadedFiles(files);
            return;
          }
        }
      }

      const files: File[] = [];
      if (e.dataTransfer.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const f = e.dataTransfer.files.item(i);
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        processLoadedFiles(files);
      }
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      if (!isDragOverFiles) setIsDragOverFiles(true);
    }
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverFiles(false);
  };

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
            <div className="flex-1 text-text-dim flex items-center font-bold tracking-wider">{t('prompt_memo', lang)}</div>
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
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
        className="flex-1 overflow-y-scroll p-2 space-y-2 bg-bg-panel relative"
      >
        {isDragOverFiles && (
          <div className="absolute inset-0 bg-accent-main/10 backdrop-blur-[1px] border-2 border-dashed border-accent-main z-40 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
            <Upload className="w-8 h-8 text-accent-main animate-bounce mb-2" />
            <span className="font-mono text-xs font-bold text-accent-main tracking-wider">
              {lang === 'en' ? 'DROP TEXT / MD FILES HERE' : 'ここにテキストまたはフォルダをドロップ'}
            </span>
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
                      const isSelected = editMark === id || (id === 'pin' && (editMark === '📌' || editMark === '●')) || (id === 'star' && (editMark === '★' || editMark === '⭐')) || (id === 'check' && (editMark === '✓' || editMark === '✔')) || (id === 'sparkles' && (editMark === '◆' || editMark === '✦' || editMark === '💡')) || (id === 'alert' && (editMark === '▲' || editMark === '⚠️' || editMark === '⚠'));

                      return (
                        <button 
                          key={id}
                          onClick={() => setEditMark(prev => isSelected ? undefined : id)}
                          className={`w-6 h-6 flex items-center justify-center transition-colors ${isSelected ? 'bg-bg-surface border border-border-hover' : 'hover:bg-bg-input hover:!text-text-main'}`}
                          style={{ color: isSelected ? 'var(--mark-color)' : 'var(--toolbar-icon-color)' }}
                          title={label}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSolid ? 'fill-current' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
                <input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={`bg-bg-base border border-border-main text-xs font-mono p-1.5 text-text-main focus:outline-none ${isNegative ? 'focus:border-red-500' : 'focus:border-border-hover'}`}
                  placeholder={t('name', lang)}
                />
                <AutoResizeTextarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className={`bg-bg-base border border-border-main text-[13px] leading-relaxed font-mono p-2 text-text-main focus:outline-none ${isNegative ? 'focus:border-red-500' : 'focus:border-border-hover'} resize-y`}
                  minHeight={64}
                  placeholder={t('content', lang)}
                />
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
                      className={`p-1 transition-colors ${
                        copiedItemId === 'edit_' + item.id ? 'text-green-500' : 'text-text-dim hover:text-green-400'
                      }`}
                      title={lang === 'en' ? "Copy Memo Text" : "メモをコピー"}
                    >
                      {copiedItemId === 'edit_' + item.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <div className="relative w-3 h-3 flex items-center justify-center">
                          <div className="border border-current w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>
                        </div>
                      )}
                    </button>
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
              className={`block p-3 group cursor-pointer transition-colors relative ${(theme === 'light' || theme === 'mono') ? 'bg-white shadow-sm' : (isSelected ? 'bg-bg-input' : 'bg-transparent')} ${isSelected ? 'border border-border-hover' : 'border border-border-main hover:border-border-hover'}`}
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
                      className="mt-0.5 cursor-pointer accent-gray-600"
                    />
                  )}
                  <div className={`text-[13px] font-bold font-mono pr-6 flex items-center flex-wrap ${isSelected ? 'text-text-main' : 'text-text-dim'}`}>
                    {renderMarkSymbol(item.mark)}
                    {item.name.toUpperCase()}
                  </div>
                </div>
                <div className={`w-2 h-2 shrink-0 ${isSelected ? (isNegative ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]' : 'bg-gray-400') : 'bg-transparent border border-gray-600'}`}></div>
              </div>
              <div className={`mt-1 text-[11px] font-mono truncate ${isSelected ? 'text-text-main opacity-85' : 'text-text-dim'}`}>
                {item.content}
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
                      className={`opacity-0 group-hover:opacity-100 p-1 bg-bg-panel border border-border-main transition-all ${
                        copiedItemId === item.id 
                          ? 'text-green-500 bg-green-500/10 opacity-100'
                          : 'text-text-dim hover:text-green-400'
                      }`}
                      title={lang === 'en' ? 'Copy Memo Text' : 'メモをコピー'}
                    >
                      {copiedItemId === item.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <div className="relative w-3 h-3 flex items-center justify-center">
                          <div className="border border-current w-full h-full flex items-center justify-center font-mono text-[9px] font-bold leading-none">P</div>
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(item.id); }}
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-text-main transition-opacity p-1 bg-bg-panel border border-border-main"
                      title={lang === 'en' ? 'More actions' : 'メニュー'}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </>
                )}
                
                {(expandedActionId === item.id || confirmQuickDeleteId === item.id) && (
                  <>
                    <div className="flex items-center bg-bg-panel border border-border-main overflow-hidden">
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
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onDuplicate) onDuplicate(item.id); }}
                      className="p-1.5 text-text-dim hover:text-text-main bg-bg-panel border border-border-main"
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
                      className={`p-1.5 bg-bg-panel border border-border-main ${
                        confirmQuickDeleteId === item.id 
                          ? 'text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 opacity-100' 
                          : 'text-text-dim hover:text-red-400 hover:bg-bg-input'
                      }`}
                      title={confirmQuickDeleteId === item.id ? 'Confirm delete' : 'Delete'}
                    ><Trash2 className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => startEdit(item, e)}
                      className="p-1.5 text-text-dim hover:text-text-main bg-bg-panel border border-border-main transition-colors"
                    ><Pencil className="w-3 h-3" /></button>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedActionId(null); }}
                      className="p-1.5 text-text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors bg-bg-panel border border-border-main"
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
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          accept=".txt,.md,.text,text/plain,text/markdown" 
          className="hidden" 
          onChange={handleFileInputChange} 
        />
        <button 
          onClick={() => setConfirmAdd(true)} 
          className="flex-1 py-2 bg-bg-input hover:bg-bg-surface border border-border-main text-[11px] font-mono font-bold text-text-main transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {t('add_memo', lang)}
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="flex-1 py-2 bg-bg-input hover:bg-bg-surface border border-border-main text-[11px] font-mono font-bold text-text-main transition-colors flex items-center justify-center gap-1.5"
          title={lang === 'en' ? 'Import .txt / .md files' : 'テキスト・MDファイルを読み込む'}
        >
          <Upload className="w-3.5 h-3.5 text-accent-main" /> {t('import_file', lang)}
        </button>
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
