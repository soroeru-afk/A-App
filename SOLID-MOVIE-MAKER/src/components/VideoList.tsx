import React, { useState } from 'react';
import { Film, Trash2, Edit2, Play, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { Category, VideoInfo, Language } from '../types';
import { t } from '../translations';

interface VideoListProps {
  videos: VideoInfo[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onMoveVideo: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  lang: Language;
}

export default function VideoList({ videos, categories, onDelete, onUpdateTitle, onBulkDelete, onMoveVideo, lang }: VideoListProps) {
  const txt = t(lang).videoList;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getCategoryName = (id: string) => {
    const name = categories.find(c => c.id === id)?.name;
    if (!name || name === '未割り当て') return txt.uncategorized;
    return name;
  };

  const startEdit = (video: VideoInfo) => {
    setEditingId(video.id);
    setEditTitle(video.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
       onUpdateTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === videos.length && videos.length > 0) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(videos.map(v => v.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="text-[10px] text-text-dim mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span>03</span><span>{txt.title}</span>
        </div>
        <div className="flex gap-4 items-center">
            {selectedIds.size > 0 && (
                showBulkConfirm ? (
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">{txt.deleteConfirm(selectedIds.size)}</span>
                        <button onClick={handleBulkDelete} className="bg-red-500 text-white px-2 py-0.5 hover:bg-red-600 border border-red-500">{txt.yes}</button>
                        <button onClick={() => setShowBulkConfirm(false)} className="border border-border-main px-2 py-0.5 hover:bg-border-light text-text-bright">{txt.no}</button>
                    </div>
                ) : (
                    <button 
                      onClick={() => setShowBulkConfirm(true)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-400 border border-red-500 hover:bg-red-500/10 px-2 py-0.5"
                    >
                        <Trash2 size={10} />
                        <span>{txt.deleteSelected(selectedIds.size)}</span>
                    </button>
                )
            )}
            <span>{txt.sortDate}</span>
            <span>{txt.totalRecords} {videos.length}</span>
        </div>
      </div>
      
      <div className="flex-1 border border-border-main bg-panel-bg flex flex-col overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_4fr_2fr_2fr_auto] gap-2 p-2 border-b border-border-main text-[10px] text-text-dim font-bold bg-base-bg items-center">
          <div className="flex justify-center px-2">
              <input 
                  type="checkbox" 
                  checked={videos.length > 0 && selectedIds.size === videos.length}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
              />
          </div>
          <div className="text-center">{txt.colPlay}</div>
          <div>{txt.colTitle}</div>
          <div>{txt.colCategory}</div>
          <div className="text-right">{txt.colDate}</div>
          <div className="text-center w-44 shrink-0">{txt.colEdit}</div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {videos.length === 0 ? (
                <div className="p-8 text-center text-text-dim text-xs">
                    {txt.noData}
                </div>
            ) : (
                videos.map(video => (
                    <div key={video.id} className="grid grid-cols-[auto_1fr_4fr_2fr_2fr_auto] gap-2 p-2 border-b border-border-main/50 text-xs items-center hover:bg-base-bg group">
                        
                        <div className="flex justify-center px-2">
                            <input 
                                type="checkbox" 
                                checked={selectedIds.has(video.id)}
                                onChange={() => toggleSelect(video.id)}
                                className="cursor-pointer"
                            />
                        </div>

                         <div className="flex justify-center">
                             {video.localPath ? (
                                 <a
                                     href={`solid-play://?path=${encodeURIComponent(video.localPath)}`}
                                     className="w-14 h-6 flex items-center justify-center border border-blue-900/60 bg-blue-950/20 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-all rounded-sm"
                                     title={txt.playExternalTooltip}
                                 >
                                     <Play size={12} className="fill-current" />
                                 </a>
                             ) : (
                                 <div className="w-14 h-6 flex items-center justify-center border border-border-main text-text-dim opacity-40 rounded-sm" title="絶対パス未登録">
                                     <Play size={12} />
                                 </div>
                             )}
                         </div>
                        
                        <div className="flex items-center gap-2 truncate">
                            <Film size={12} className="text-text-dim flex-shrink-0" />
                            {editingId === video.id ? (
                                <input 
                                    className="flex-1 px-1 py-0.5 bg-black border border-border-main text-text-bright w-full"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                    autoFocus
                                />
                            ) : (
                                <span className="text-text-bright font-bold truncate cursor-pointer" onDoubleClick={() => startEdit(video)}>
                                    {video.title}
                                </span>
                            )}
                        </div>
                        
                        <div className="text-text-dim truncate text-[10px]">
                            {getCategoryName(video.categoryId)}
                        </div>
                        
                        <div className="text-right text-text-dim text-[10px] font-mono">
                            {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex justify-end w-44 shrink-0 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {deleteConfirmId === video.id ? (
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleDelete(video.id)} className="text-red-500 font-bold px-2 py-0.5 hover:bg-red-500/10 border border-red-900/60 rounded-sm text-[10px]">{txt.delete}</button>
                                    <button onClick={() => setDeleteConfirmId(null)} className="text-text-dim px-2 py-0.5 hover:bg-base-bg border border-border-main rounded-sm text-[10px]">{txt.cancel}</button>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => startEdit(video)} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-text-bright hover:bg-base-bg rounded-sm" 
                                        title={txt.rename}
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                    <button 
                                        onClick={() => onMoveVideo(video.id, 'top')} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-text-bright hover:bg-base-bg rounded-sm" 
                                        title="一番上へ"
                                    >
                                        <ChevronsUp size={11} />
                                    </button>
                                    <button 
                                        onClick={() => onMoveVideo(video.id, 'up')} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-text-bright hover:bg-base-bg rounded-sm" 
                                        title="上へ"
                                    >
                                        <ChevronUp size={11} />
                                    </button>
                                    <button 
                                        onClick={() => onMoveVideo(video.id, 'down')} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-text-bright hover:bg-base-bg rounded-sm" 
                                        title="下へ"
                                    >
                                        <ChevronDown size={11} />
                                    </button>
                                    <button 
                                        onClick={() => onMoveVideo(video.id, 'bottom')} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-text-bright hover:bg-base-bg rounded-sm" 
                                        title="一番下へ"
                                    >
                                        <ChevronsDown size={11} />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirmId(video.id)} 
                                        className="w-6 h-6 flex items-center justify-center border border-border-main text-text-dim hover:text-red-400 hover:bg-base-bg rounded-sm ml-1" 
                                        title={txt.delete}
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </section>
  );
}
