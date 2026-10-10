import React, { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, Clapperboard, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Category, VideoInfo, Language } from '../types';
import { t } from '../translations';

interface SidebarProps {
  categories: Category[];
  videos: VideoInfo[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategoryUp: (id: string) => void;
  onMoveCategoryDown: (id: string) => void;
  listSize: number;
  sidebarWidth: number;
  onResizeStart: (e: React.MouseEvent) => void;
  lang: Language;
  actionToast?: { message: string; isError?: boolean } | null;
}

export default function Sidebar({
  categories,
  videos,
  activeCategoryId,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  listSize,
  sidebarWidth,
  onResizeStart,
  lang,
  actionToast,
}: SidebarProps) {
  const txt = t(lang).sidebar;

  const totalVideos = videos.length;
  const dirCount = categories.length;
  const mkvVideos = videos.filter(
    (v) => (v.extension || v.originalName.split('.').pop() || '').toLowerCase() === 'mkv'
  ).length;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEdit = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onEditCategory(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div
      style={{ width: `${sidebarWidth}px` }}
      className="flex-shrink-0 h-full flex flex-col border-r border-border-main bg-panel-bg font-mono select-none relative group/sidebar"
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-border-main">
        <div className="flex items-center gap-2 mb-1">
          <div className="grid grid-cols-2 gap-[1.5px]">
            <div className="w-1.5 h-1.5 bg-text-bright"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-80"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-60"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-40"></div>
          </div>
          <h1 className="text-sm font-bold tracking-widest text-text-bright truncate">SOLID MOVIE MAKER</h1>
        </div>
        <div className="text-[10px] text-text-dim tracking-[0.2em] font-medium truncate">
          KM / POTPLAYER LINK
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* 00 システムステータス */}
        <section>
          <div className="text-[10px] text-text-dim mb-1.5 flex items-center gap-2">
            <span>00</span>
            <span className="uppercase">{txt.systemStatus}</span>
          </div>
          <div className="border border-border-main p-2 bg-base-bg font-mono text-xs flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-dim">{txt.totalVideos}</span>
              <span className="font-bold text-text-bright">{totalVideos}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-dim">{txt.mkvCount}</span>
              <span className="font-bold text-blue-400">{mkvVideos}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-dim">{txt.dirCount}</span>
              <span className="font-bold text-text-bright">{dirCount}</span>
            </div>
          </div>
        </section>

          {/* 01 カテゴリディレクトリ */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="text-[10px] text-text-dim mb-1.5 flex items-center gap-2">
              <span>01</span>
              <span className="uppercase">{txt.catDir}</span>
            </div>

            <button
              onClick={onAddCategory}
              className="w-full py-1 mb-2 border border-border-main hover:bg-base-bg flex items-center justify-center gap-1.5 text-xs transition-colors text-text-normal bg-panel-bg"
            >
              <Plus size={12} />
              <span>{txt.newCategoryDefault}</span>
            </button>

            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto pr-0.5">
              {/* [ ALL MOVIES ] */}
              <button
                onClick={() => onSelectCategory(null)}
                style={{ fontSize: `${listSize}px` }}
                className={`flex items-center gap-2 px-2 py-1.5 text-left transition-colors ${
                  activeCategoryId === null
                    ? 'bg-border-main text-text-bright font-bold'
                    : 'text-text-normal hover:bg-base-bg'
                }`}
              >
                <Clapperboard
                  size={Math.max(12, listSize - 2)}
                  className={activeCategoryId === null ? 'text-text-bright' : 'text-text-dim shrink-0'}
                />
                <span className="truncate">{txt.allData}</span>
                <span className="ml-auto text-[10px] text-text-dim shrink-0">{totalVideos}</span>
              </button>

              {/* Category List with Up/Down and Edit/Delete */}
              {categories.map((cat, idx) => {
                const count = videos.filter((v) => v.categoryId === cat.id).length;
                const isActive = activeCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    style={{ fontSize: `${listSize}px` }}
                    className={`flex items-center gap-1.5 px-1.5 py-1 text-left group/item cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-border-main text-text-bright font-bold'
                        : 'text-text-normal hover:bg-base-bg'
                    }`}
                    onClick={() => onSelectCategory(cat.id)}
                  >
                    {/* Category Move Up / Down Buttons */}
                    <div
                      className="flex flex-col shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onMoveCategoryUp(cat.id)}
                        disabled={idx === 0}
                        className={`hover:text-text-bright ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
                        title="1つ上に移動"
                      >
                        <ChevronUp size={10} />
                      </button>
                      <button
                        onClick={() => onMoveCategoryDown(cat.id)}
                        disabled={idx === categories.length - 1}
                        className={`hover:text-text-bright ${idx === categories.length - 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
                        title="1つ下に移動"
                      >
                        <ChevronDown size={10} />
                      </button>
                    </div>

                    {/* Folder Icon (Industrial Monochrome Outline) */}
                    <Folder
                      size={Math.max(12, listSize - 2)}
                      className={isActive ? 'text-text-bright shrink-0' : 'text-text-dim shrink-0'}
                    />

                    {/* Category Name or Inline Edit */}
                    {editingId === cat.id ? (
                      <input
                        className="flex-1 px-1 py-0.5 bg-black border border-border-main w-full text-text-bright shrink"
                        style={{ fontSize: `${listSize}px` }}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span className="truncate flex-1" onDoubleClick={(e) => startEdit(e, cat)}>
                        {cat.name === '未割り当て' ? txt.uncategorized : cat.name}
                      </span>
                    )}

                    {/* Actions & Count */}
                    {deleteConfirmId === cat.id ? (
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleDelete(e, cat.id)}
                          className="text-red-400 font-bold px-1 hover:underline text-[10px]"
                        >
                          {txt.del}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-text-dim px-1 hover:text-text-bright text-[10px]"
                        >
                          {txt.cxl}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEdit(e, cat)}
                          className="text-text-dim hover:text-text-bright p-0.5"
                          title={txt.rename}
                        >
                          <Edit2 size={10} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(cat.id);
                          }}
                          className="text-text-dim hover:text-red-400 p-0.5"
                          title={txt.delete}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}

                    {deleteConfirmId !== cat.id && editingId !== cat.id && (
                      <span className="text-[10px] text-text-dim shrink-0 ml-1 font-mono">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action Toast Indicator (Simple & Minimal at bottom of Sidebar) */}
          {actionToast && (
            <div className="mt-auto pt-2 border-t border-border-main">
              <div
                className={`p-1.5 border text-[10px] font-mono flex items-center justify-between animate-fade-in ${
                  actionToast.isError
                    ? 'bg-red-950/70 border-red-800 text-red-300'
                    : 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="shrink-0">{actionToast.isError ? '⚠️' : '▶'}</span>
                  <span className="truncate">{actionToast.message}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Industrial Resizable Grip Handle (Right Border) */}
      <div
        onMouseDown={onResizeStart}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-border-light active:bg-text-bright/40 transition-colors flex items-center justify-center z-20 group/handle"
        title="ドラッグしてサイドバーの横幅を変更"
      >
        <div className="w-[1px] h-full bg-border-main group-hover/handle:bg-border-light" />
        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/handle:opacity-100 transition-opacity">
          <div className="w-1 h-1 bg-text-bright rounded-full" />
          <div className="w-1 h-1 bg-text-bright rounded-full" />
          <div className="w-1 h-1 bg-text-bright rounded-full" />
        </div>
      </div>
    </div>
  );
}
