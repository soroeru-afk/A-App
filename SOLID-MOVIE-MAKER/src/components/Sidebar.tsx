import React, { useState } from 'react';
import { Folder, Film, Plus, Edit2, Trash2 } from 'lucide-react';
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
  width: number;
  onWidthChange: (width: number) => void;
  lang: Language;
}

export default function Sidebar({
  categories,
  videos,
  activeCategoryId,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  width,
  onWidthChange,
  lang
}: SidebarProps) {
  const txt = t(lang).sidebar;

  const totalVideos = videos.length;
  const dirCount = categories.length;

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

  const startResize = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startWidth = width;
    const startX = mouseDownEvent.clientX;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(480, startWidth + (mouseMoveEvent.clientX - startX)));
      onWidthChange(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div 
      style={{ width: `${width}px` }}
      className="flex-shrink-0 h-full flex flex-col border-r border-border-main bg-panel-bg relative select-none"
    >
      
      {/* Brand Header */}
      <div className="p-4 border-b border-border-main">
        <div className="flex items-center gap-2 mb-1">
          <div className="grid grid-cols-2 gap-[1px]">
            <div className="w-1.5 h-1.5 bg-text-bright"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-80"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-60"></div>
            <div className="w-1.5 h-1.5 bg-text-bright opacity-40"></div>
          </div>
          <h1 className="text-sm font-bold tracking-widest text-text-bright">SOLID MOVIE MAKER</h1>
        </div>
        <div className="text-[10px] text-text-dim tracking-[0.2em] font-medium">DATA LINK</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">

        {/* 00 システムステータス */}
        <section>
          <div className="text-[10px] text-text-dim mb-2 flex items-center gap-2">
            <span>00</span><span>{txt.systemStatus}</span>
          </div>
          <div className="border border-border-main p-3 bg-base-bg font-mono text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-text-normal">{txt.dirCount}</span>
              <span className="font-bold text-text-bright">{dirCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-normal">{txt.totalVideos}</span>
              <span className="font-bold text-text-bright">{totalVideos}</span>
            </div>
          </div>
        </section>

        {/* 01 カテゴリディレクトリ */}
        <section className="flex-1 flex flex-col">
          <div className="text-[10px] text-text-dim mb-2 flex items-center gap-2">
            <span>01</span><span>{txt.catDir}</span>
          </div>
          
          <button 
            onClick={onAddCategory}
            className="w-full py-2 mb-3 border border-border-main hover:border-text-dim flex items-center justify-center gap-2 text-xs transition-colors"
          >
             <Plus size={14} /> {txt.newCategoryDefault}
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs text-left
                ${activeCategoryId === null ? 'bg-border-main text-text-bright font-bold' : 'text-text-normal hover:bg-base-bg'}
              `}
            >
              <Film size={14} className={activeCategoryId === null ? 'text-text-bright' : 'text-text-dim'} />
              <span>{txt.allData}</span>
            </button>

            {categories.map(cat => (
              <div
                key={cat.id}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs text-left group cursor-pointer
                  ${activeCategoryId === cat.id ? 'bg-border-main text-text-bright font-bold' : 'text-text-normal hover:bg-base-bg'}
                `}
                onClick={() => onSelectCategory(cat.id)}
              >
                <Folder size={14} className={activeCategoryId === cat.id ? 'text-text-bright' : 'text-text-dim shrink-0'} />
                
                {editingId === cat.id ? (
                    <input 
                        className="flex-1 px-1 py-0.5 bg-black border border-border-main w-full text-text-bright shrink"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        onClick={e => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <span className="truncate flex-1" onDoubleClick={(e) => startEdit(e, cat)}>
                        {cat.name === '未割り当て' ? txt.uncategorized : cat.name}
                    </span>
                )}

                 {cat.id !== 'cat_default' && (
                     deleteConfirmId === cat.id ? (
                         <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <button onClick={(e) => handleDelete(e, cat.id)} className="text-red-500 font-bold px-1 hover:text-red-400">{txt.del}</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="text-text-dim px-1 hover:text-text-bright">{txt.cxl}</button>
                         </div>
                     ) : (
                         <div className="flex items-center gap-2 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                             <button onClick={(e) => startEdit(e, cat)} className="text-text-dim hover:text-text-bright" title={txt.rename}>
                                 <Edit2 size={12} />
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(cat.id); }} className="text-text-dim hover:text-red-400" title={txt.delete}>
                                 <Trash2 size={12} />
                             </button>
                         </div>
                     )
                 )}
                 
                 {deleteConfirmId !== cat.id && editingId !== cat.id && (
                     <span className="text-[10px] text-text-dim opacity-100 shrink-0 ml-1">
                         {videos.filter(v => v.categoryId === cat.id).length}
                     </span>
                 )}
               </div>
             ))}
           </div>
         </section>

       </div>

       {/* Drag Resize Handle */}
       <div 
         onMouseDown={startResize}
         className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-text-bright/20 active:bg-text-bright transition-colors z-40"
       />

     </div>
  );
}
