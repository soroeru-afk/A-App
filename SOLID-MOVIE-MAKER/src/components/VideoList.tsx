import React, { useState } from 'react';
import { 
  Play, Folder, FolderOpen, Trash2, Edit2, Search, ExternalLink, HardDrive, 
  Check, Copy, RefreshCw, Terminal, AlertCircle, ChevronUp, ChevronDown, 
  ChevronsUp, ChevronsDown, CheckCircle, XCircle, LayoutGrid, List as ListIcon, 
  CheckSquare, Square 
} from 'lucide-react';
import { Category, VideoInfo, Language, PreferredPlayer, SortField, SortOrder } from '../types';
import { t } from '../translations';
import { launchPlayer, openContainingFolder, generateDirectCmd, PlayResult } from '../utils/playerLauncher';

interface VideoListProps {
  videos: VideoInfo[];
  categories: Category[];
  preferredPlayer: PreferredPlayer;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onUpdatePath: (id: string, newPath: string) => void;
  onBatchReplacePath: (fromStr: string, toStr: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onMoveTop: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onMoveBottom: (id: string) => void;
  onMoveCategory: (videoId: string, targetCategoryId: string) => void;
  onBulkMoveCategory: (videoIds: string[], targetCategoryId: string) => void;
  onCheckFilesExist: () => void;
  listSize: number;
  titleSize: number;
  lang: Language;
  showToast?: (message: string, isError?: boolean) => void;
}

export default function VideoList({
  videos,
  categories,
  preferredPlayer,
  onDelete,
  onUpdateTitle,
  onUpdatePath,
  onBatchReplacePath,
  onBulkDelete,
  onMoveTop,
  onMoveUp,
  onMoveDown,
  onMoveBottom,
  onMoveCategory,
  onBulkMoveCategory,
  onCheckFilesExist,
  listSize,
  titleSize,
  lang,
  showToast: propShowToast,
}: VideoListProps) {
  const txt = t(lang).videoList;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<'ALL' | 'MKV'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // View Mode: Card (Grid) or List (Table)
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    const saved = localStorage.getItem('solid_view_mode');
    return saved === 'list' || saved === 'card' ? saved : 'card';
  });

  // Expanded description/path IDs for Card view
  const [expandedDescIds, setExpandedDescIds] = useState<Set<string>>(new Set());

  const handleViewModeChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('solid_view_mode', mode);
  };

  const toggleExpandDesc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sorting
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Path Batch Replacement Bar State
  const [showPathReplaceBar, setShowPathReplaceBar] = useState(false);
  const [fromPathInput, setFromPathInput] = useState('D:\\Movies');
  const [toPathInput, setToPathInput] = useState('E:\\Movies');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editPath, setEditPath] = useState('');

  const showToast = (message: string, isError = false) => {
    if (propShowToast) {
      propShowToast(message, isError);
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : txt.uncategorized;
  };

  const handlePlayVideo = async (video: VideoInfo) => {
    const result: PlayResult = await launchPlayer(video, preferredPlayer);
    if (result.success) {
      showToast(result.message);
    } else {
      showToast(result.message, true);
    }
  };

  const handleDownloadDirectCmd = (video: VideoInfo) => {
    generateDirectCmd(video);
    showToast(`【${video.title}】直接起動ファイル (.cmd) を出力しました`);
  };

  const handleCopyPath = (pathText?: string) => {
    if (!pathText) return;
    navigator.clipboard.writeText(pathText);
    showToast('ファイルパスをクリップボードにコピーしました');
  };

  const handleExecutePathReplace = () => {
    if (!fromPathInput.trim()) return;
    onBatchReplacePath(fromPathInput.trim(), toPathInput.trim());
    showToast(`パス置換完了:「${fromPathInput}」→「${toPathInput}」`);
    setShowPathReplaceBar(false);
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

  const startEditPath = (video: VideoInfo) => {
    setEditingPathId(video.id);
    setEditPath(video.localPath || '');
  };

  const saveEditPath = () => {
    if (editingPathId) {
      onUpdatePath(editingPathId, editPath.trim());
    }
    setEditingPathId(null);
  };

  const toggleSelectAll = (filteredList: VideoInfo[]) => {
    if (selectedIds.size === filteredList.length && filteredList.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map((v) => v.id)));
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

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & search & sort
  const filteredVideos = videos
    .filter((v) => {
      if (filterFormat === 'MKV') {
        const ext = (v.extension || v.originalName.split('.').pop() || '').toLowerCase();
        if (ext !== 'mkv') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const catName = getCategoryName(v.categoryId).toLowerCase();
        const titleMatch = v.title.toLowerCase().includes(q);
        const catMatch = catName.includes(q);
        const pathMatch = (v.localPath || '').toLowerCase().includes(q);
        return titleMatch || catMatch || pathMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'order') {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }
      if (sortField === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      if (sortField === 'category') {
        const catA = getCategoryName(a.categoryId);
        const catB = getCategoryName(b.categoryId);
        return sortOrder === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
      }
      if (sortField === 'format') {
        const extA = (a.extension || '').toLowerCase();
        const extB = (b.extension || '').toLowerCase();
        return sortOrder === 'asc' ? extA.localeCompare(extB) : extB.localeCompare(extA);
      }
      if (sortField === 'date') {
        return sortOrder === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
      }
      return 0;
    });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <section className="flex-1 flex flex-col min-h-0 font-mono">
      {/* 03 Subheader info & filter bar */}
      <div className="text-[10px] text-text-dim mb-1.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span>03</span>
            <span className="font-bold text-text-bright tracking-wider uppercase">MOVIE DATABASE LIST</span>
          </div>

          <div className="h-3 w-[1px] bg-border-main" />

          {/* Quick format filter */}
          <div className="flex bg-panel-bg border border-border-main p-0.5">
            <button
              onClick={() => setFilterFormat('ALL')}
              className={`px-2 py-0.5 text-[9px] transition-colors ${
                filterFormat === 'ALL' ? 'bg-border-light text-text-bright font-bold' : 'text-text-dim'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterFormat('MKV')}
              className={`px-2 py-0.5 text-[9px] transition-colors ${
                filterFormat === 'MKV' ? 'bg-border-light text-text-bright font-bold' : 'text-text-dim'
              }`}
            >
              MKVのみ
            </button>
          </div>

          {/* Path drive replacer toggle button */}
          <button
            onClick={() => setShowPathReplaceBar(!showPathReplaceBar)}
            className={`px-2 py-0.5 border text-[9px] flex items-center gap-1 transition-colors ${
              showPathReplaceBar
                ? 'bg-border-light text-text-bright border-border-light font-bold'
                : 'border-border-main text-text-dim hover:text-text-normal'
            }`}
            title="映画が入っているドライブ（例: DドライブからEドライブ）を一括変更します"
          >
            <RefreshCw size={10} />
            <span>⟲ ドライブ/保存先パス一括変更</span>
          </button>

          {/* File existence check button */}
          <button
            onClick={onCheckFilesExist}
            className="px-2 py-0.5 border border-border-main text-text-dim hover:text-text-bright hover:border-border-light text-[9px] flex items-center gap-1 transition-colors bg-panel-bg"
            title="登録された全映画のファイルがPC内に存在するかチェックします"
          >
            <Search size={10} />
            <span>🔍 ファイル存在チェック</span>
          </button>
        </div>

        {/* Search, Selection, Sorting & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2 text-text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH TITLE OR CATEGORY..."
              className="pl-6 pr-2 py-0.5 text-[10px] bg-panel-bg border border-border-main text-text-bright w-48 lg:w-56 focus:border-border-light"
            />
          </div>

          {/* Select all toggle button */}
          {filteredVideos.length > 0 && (
            <button
              onClick={() => toggleSelectAll(filteredVideos)}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 border border-border-main bg-panel-bg hover:border-border-light text-text-dim hover:text-text-bright transition-colors"
              title={selectedIds.size === filteredVideos.length ? '全選択を解除' : 'すべての映画を選択'}
            >
              {selectedIds.size === filteredVideos.length && filteredVideos.length > 0 ? (
                <CheckSquare size={12} className="text-text-bright" />
              ) : (
                <Square size={12} className="text-text-dim" />
              )}
              <span>{selectedIds.size === filteredVideos.length && filteredVideos.length > 0 ? '全解除' : '全選択'}</span>
            </button>
          )}

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <>
              {/* 一括カテゴリ移動 */}
              <div className="flex items-center gap-1.5 bg-panel-bg border border-blue-900/80 px-2 py-0.5 text-[10px]">
                <span className="text-blue-300 font-bold">選択 {selectedIds.size} 件を移動:</span>
                <select
                  onChange={(e) => {
                    const targetCatId = e.target.value;
                    if (targetCatId) {
                      const count = selectedIds.size;
                      onBulkMoveCategory(Array.from(selectedIds), targetCatId);
                      const targetCat = categories.find((c) => c.id === targetCatId);
                      showToast(`選択した ${count} 件の映画を「${targetCat?.name || '指定カテゴリ'}」へ一括移動しました`);
                      setSelectedIds(new Set());
                      e.target.value = '';
                    }
                  }}
                  className="bg-base-bg border border-border-main text-text-bright text-[10px] px-1.5 py-0.5 cursor-pointer focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="">-- 移動先カテゴリを選択 --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-panel-bg text-text-bright">
                      ■ {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 一括削除 */}
              {showBulkConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-800 px-2 py-0.5">
                  <span className="text-red-400 font-bold text-[10px]">{txt.deleteConfirm(selectedIds.size)}</span>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-2 py-0.5 text-[10px] hover:bg-red-700"
                  >
                    {txt.yes}
                  </button>
                  <button
                    onClick={() => setShowBulkConfirm(false)}
                    className="text-text-dim hover:text-text-bright px-1 text-[10px]"
                  >
                    {txt.no}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBulkConfirm(true)}
                  className="flex items-center gap-1 text-red-400 border border-red-800 hover:bg-red-950/40 px-2 py-0.5 text-[10px]"
                >
                  <Trash2 size={11} />
                  <span>{txt.deleteSelected(selectedIds.size)}</span>
                </button>
              )}
            </>
          )}

          {/* Sort Dropdown (KNAVI style) */}
          <div className="flex items-center gap-1 text-[10px] text-text-dim ml-auto">
            <span className="font-bold">並び替え:</span>
            <select
              value={`${sortField}_${sortOrder}`}
              onChange={(e) => {
                const parts = e.target.value.split('_');
                const field = parts[0] as SortField;
                const order = parts[1] as SortOrder;
                setSortField(field);
                setSortOrder(order);
              }}
              className="h-6 bg-base-bg border border-border-main text-text-bright text-[10px] px-1.5 outline-none font-bold cursor-pointer"
            >
              <option value="order_asc">登録順（並び順）</option>
              <option value="title_asc">タイトル昇順 (A-Z)</option>
              <option value="title_desc">タイトル降順 (Z-A)</option>
              <option value="category_asc">カテゴリ順</option>
              <option value="format_asc">形式順</option>
              <option value="date_desc">登録日 (新しい順)</option>
              <option value="date_asc">登録日 (古い順)</option>
            </select>
          </div>

          {/* View Mode Switcher: Card [LayoutGrid] / List [ListIcon] (KNAVI style) */}
          <div className="h-6 inline-flex items-stretch border border-border-main bg-base-bg divide-x divide-border-main box-border">
            <button
              onClick={() => handleViewModeChange('card')}
              className={`px-1.5 flex items-center justify-center transition-colors ${
                viewMode === 'card' ? 'bg-border-main text-text-bright' : 'text-text-dim hover:text-text-normal'
              }`}
              title="カード表示"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-1.5 flex items-center justify-center transition-colors ${
                viewMode === 'list' ? 'bg-border-main text-text-bright' : 'text-text-dim hover:text-text-normal'
              }`}
              title="リスト表示"
            >
              <ListIcon size={13} />
            </button>
          </div>

          <span className="text-[10px] text-text-dim whitespace-nowrap">
            TOTAL: <strong className="text-text-bright">{filteredVideos.length}</strong>
          </span>
        </div>
      </div>

      {/* Path Batch Replacement Bar */}
      {showPathReplaceBar && (
        <div className="mb-2 p-2 bg-base-bg border border-border-main flex flex-wrap items-center gap-2 text-[11px] animate-fade-in">
          <HardDrive size={13} className="text-blue-400 shrink-0" />
          <span className="text-text-dim">保存先置換:</span>
          <input
            type="text"
            value={fromPathInput}
            onChange={(e) => setFromPathInput(e.target.value)}
            className="px-2 py-0.5 bg-panel-bg border border-border-main text-text-bright w-32 font-mono text-[10px]"
            placeholder="置換前 (例: D:\Movies)"
          />
          <span className="text-text-dim">→</span>
          <input
            type="text"
            value={toPathInput}
            onChange={(e) => setToPathInput(e.target.value)}
            className="px-2 py-0.5 bg-panel-bg border border-border-main text-text-bright w-32 font-mono text-[10px]"
            placeholder="置換後 (例: E:\Movies)"
          />
          <button
            onClick={handleExecutePathReplace}
            className="px-2.5 py-0.5 bg-border-main hover:bg-border-light text-text-bright font-bold border border-border-light text-[10px]"
          >
            全映画のパスを一括変更
          </button>
          <span className="text-[10px] text-text-dim ml-auto">
            ※実際の映画ファイルがある場所（Eドライブなど）に合わせて一括修正できます
          </span>
        </div>
      )}

      {/* Main Container: Card View or Table List View */}
      <div className="flex-1 border border-border-main bg-panel-bg flex flex-col overflow-hidden relative">
        {viewMode === 'card' ? (
          /* CARD VIEW (KNAVI-Style High-Contrast Technical Cards) */
          <div className="flex-1 overflow-y-auto min-h-0 p-3 scrollbar-thin">
            {filteredVideos.length === 0 ? (
              <div className="p-12 text-center text-text-dim text-xs flex flex-col items-center justify-center gap-2">
                <Folder size={24} className="opacity-30" />
                <div>登録されている映画データがありません</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
                {filteredVideos.map((video, idx) => {
                  const ext = video.extension || (video.originalName.split('.').pop() || 'MKV').toUpperCase();
                  const isMkv = ext === 'MKV';
                  const isSelected = selectedIds.has(video.id);
                  const isExpanded = expandedDescIds.has(video.id);

                  return (
                    <div
                      key={video.id}
                      className={`group relative flex flex-col justify-between border bg-base-bg/40 hover:bg-base-bg/90 transition-all shadow-sm p-3 ${
                        isSelected
                          ? 'border-border-light ring-1 ring-border-light bg-border-main/20'
                          : 'border-border-main hover:border-border-light'
                      }`}
                    >
                      {/* Top section: Header, Title, Spec, Path */}
                      <div>
                        {/* 1. Card Top (Checkbox, Format Badge, Order, Action Buttons) */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleSelect(video.id)}
                              className="text-text-dim hover:text-text-bright transition-colors"
                              title={isSelected ? '選択解除' : '選択'}
                            >
                              {isSelected ? (
                                <CheckSquare size={14} className="text-text-bright" />
                              ) : (
                                <Square size={14} className="text-text-dim" />
                              )}
                            </button>

                            <span
                              className={`font-mono font-black tracking-widest px-1.5 py-0.5 border text-[10px] select-none ${
                                isMkv ? 'border-blue-700 bg-blue-950/70 text-blue-200' : 'border-border-main bg-white text-black'
                              }`}
                              title={`フォーマット: ${ext}`}
                            >
                              {ext}
                            </span>

                            <span className="font-mono text-[9px] px-1 py-0.5 border border-border-main bg-base-bg text-text-dim select-none">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Top Right Action Bar */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Reorder Buttons */}
                            <div className="flex items-center gap-0.5 border-r border-border-main/50 pr-1 mr-0.5">
                              <button
                                onClick={() => onMoveTop(video.id)}
                                disabled={idx === 0}
                                className={`p-0.5 hover:text-text-bright ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                                title="一番上へ移動"
                              >
                                <ChevronsUp size={11} />
                              </button>
                              <button
                                onClick={() => onMoveUp(video.id)}
                                disabled={idx === 0}
                                className={`p-0.5 hover:text-text-bright ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                                title="1つ上へ移動"
                              >
                                <ChevronUp size={11} />
                              </button>
                              <button
                                onClick={() => onMoveDown(video.id)}
                                disabled={idx === filteredVideos.length - 1}
                                className={`p-0.5 hover:text-text-bright ${idx === filteredVideos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                                title="1つ下へ移動"
                              >
                                <ChevronDown size={11} />
                              </button>
                              <button
                                onClick={() => onMoveBottom(video.id)}
                                disabled={idx === filteredVideos.length - 1}
                                className={`p-0.5 hover:text-text-bright ${idx === filteredVideos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                                title="一番下へ移動"
                              >
                                <ChevronsDown size={11} />
                              </button>
                            </div>

                            <button
                              onClick={() => handleCopyPath(video.localPath || video.originalName)}
                              className="w-6 h-6 flex items-center justify-center bg-base-bg text-text-dim hover:text-text-bright border border-border-main hover:border-border-light transition-colors"
                              title="ファイルパスをコピー"
                            >
                              <Copy size={11} />
                            </button>
                            <button
                              onClick={() => startEdit(video)}
                              className="w-6 h-6 flex items-center justify-center bg-base-bg text-text-dim hover:text-text-bright border border-border-main hover:border-border-light transition-colors"
                              title="タイトル編集"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => onDelete(video.id)}
                              className="w-6 h-6 flex items-center justify-center bg-base-bg text-text-dim hover:text-red-400 border border-border-main hover:border-red-800 transition-colors"
                              title="削除"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* 2. Movie Title (Large & Bold, like KNAVI Stock Name) */}
                        <div className="mb-2">
                          {editingId === video.id ? (
                            <input
                              className="w-full bg-black border border-border-main text-text-bright px-2 py-1 text-sm focus:outline-none font-bold"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                style={{ fontSize: `${titleSize}px` }}
                                className="text-text-bright font-black leading-snug tracking-wide hover:underline cursor-pointer line-clamp-2"
                                onClick={() => handlePlayVideo(video)}
                                onDoubleClick={() => startEdit(video)}
                                title={`${video.title} - クリックで再生 (ダブルクリックで編集)`}
                              >
                                {video.title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 3. Specs / Status Row (like Price & Limit Row in KNAVI) */}
                        <div className="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1 bg-base-bg/70 px-2.5 py-1.5 border border-border-main mb-2.5 font-mono text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-dim">容量:</span>
                            <span className="font-bold text-text-bright">{video.fileSize || '---'}</span>
                          </div>

                          <div className="flex items-center gap-1 text-text-dim border-l border-border-main pl-2">
                            <span className="opacity-80">状態:</span>
                            {video.exists === false ? (
                              <span className="text-red-400 font-bold flex items-center gap-0.5" title="実在ファイルが見つかりません">
                                <XCircle size={11} /> 未検出
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5" title="実在ファイルを確認済">
                                <CheckCircle size={11} /> 正常
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[10px] ml-auto">
                            <span className="text-text-dim">登録日:</span>
                            <span className="text-text-bright font-mono">{formatDate(video.createdAt)}</span>
                          </div>
                        </div>

                        {/* 4. Path & Details Preview Box (like Company Overview in KNAVI) */}
                        <div className="bg-base-bg/40 border border-border-main/50 p-2.5 mb-2.5 min-h-[58px] transition-colors rounded-xs flex flex-col justify-center relative">
                          <div className="flex items-center justify-between mb-1 text-[10px]">
                            <div className="text-text-dim font-bold tracking-wider flex items-center gap-1">
                              <HardDrive size={11} className="opacity-70" />
                              <span>[ ファイルパス・保存先情報 ]</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => toggleExpandDesc(video.id, e)}
                              className="text-[9px] font-mono text-text-dim hover:text-text-bright px-1.5 py-0.5 border border-border-main/60 bg-base-bg rounded-xs transition-colors shrink-0"
                            >
                              {isExpanded ? '折りたたむ' : '全文表示'}
                            </button>
                          </div>

                          {editingPathId === video.id ? (
                            <input
                              className="px-1 py-0.5 bg-black border border-border-main text-text-bright font-mono w-full text-[10px]"
                              value={editPath}
                              onChange={(e) => setEditPath(e.target.value)}
                              onBlur={saveEditPath}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditPath();
                                if (e.key === 'Escape') setEditingPathId(null);
                              }}
                              autoFocus
                            />
                          ) : (
                            <p
                              onDoubleClick={() => startEditPath(video)}
                              onClick={() => handleCopyPath(video.localPath || video.originalName)}
                              className={`text-text-normal font-mono leading-relaxed break-all cursor-pointer hover:text-text-bright text-[10px] ${
                                isExpanded ? 'line-clamp-none max-h-48 overflow-y-auto pr-1' : 'line-clamp-2'
                              }`}
                              title="クリックでパスをコピー（ダブルクリックで編集）"
                            >
                              {video.localPath || video.originalName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 5. Card Footer (Category Dropdown + Play Action Button) */}
                      <div className="flex items-center justify-between border-t border-border-main pt-2.5 mt-1 text-[10px] text-text-dim">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
                          <Folder size={11} className="shrink-0 text-text-dim" />
                          <select
                            value={video.categoryId}
                            onChange={(e) => onMoveCategory(video.id, e.target.value)}
                            className="bg-base-bg border border-border-main text-text-normal hover:border-border-light py-0.5 px-1.5 cursor-pointer focus:outline-none text-[10px] truncate max-w-[150px] font-mono"
                            title="カテゴリを変更（移動）します"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id} className="bg-panel-bg text-text-bright">
                                ■ {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDownloadDirectCmd(video)}
                            className="px-2 py-1 bg-base-bg hover:bg-border-light text-text-dim hover:text-text-bright border border-border-main transition-colors text-[9px] font-bold"
                            title="直接起動ファイル (.cmd) を出力"
                          >
                            CMD
                          </button>

                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="px-3 py-1 bg-border-main hover:bg-text-bright hover:text-base-bg text-text-bright border border-border-light font-bold flex items-center gap-1.5 transition-colors text-[10px]"
                            title="KMPlayer / PotPlayer で直接再生"
                          >
                            <Play size={10} className="fill-current ml-0.5" />
                            <span>再生開始</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* LIST VIEW (Table Header & Rows) */
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[32px_44px_70px_1fr_180px_100px_90px_140px] gap-2 p-2 border-b border-border-main text-[10px] text-text-dim font-bold bg-base-bg items-center select-none">
              {/* Checkbox */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={filteredVideos.length > 0 && selectedIds.size === filteredVideos.length}
                  onChange={() => toggleSelectAll(filteredVideos)}
                  className="cursor-pointer"
                />
              </div>

              {/* 順序 */}
              <div 
                onClick={() => handleToggleSort('order')}
                className="flex items-center justify-center gap-1 cursor-pointer hover:text-text-bright"
                title="手動並び替え順で表示"
              >
                <span>順序</span>
                <span className="text-[9px]">{sortField === 'order' ? (sortOrder === 'asc' ? '◆' : '◇') : '⇅'}</span>
              </div>

              {/* PLAY */}
              <div className="text-center">PLAY</div>

              {/* TITLE / FILE INFO */}
              <div 
                onClick={() => handleToggleSort('title')}
                className="cursor-pointer hover:text-text-bright flex items-center gap-1"
              >
                <span>TITLE / FILE INFO</span>
                <span className="text-[9px]">{sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
              </div>

              {/* CATEGORY (移動) */}
              <div 
                onClick={() => handleToggleSort('category')}
                className="cursor-pointer hover:text-text-bright flex items-center gap-1"
              >
                <span>CATEGORY (移動)</span>
                <span className="text-[9px]">{sortField === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
              </div>

              {/* FORMAT */}
              <div 
                onClick={() => handleToggleSort('format')}
                className="text-center cursor-pointer hover:text-text-bright flex items-center justify-center gap-1"
              >
                <span>FORMAT</span>
                <span className="text-[9px]">{sortField === 'format' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
              </div>

              {/* DATE */}
              <div 
                onClick={() => handleToggleSort('date')}
                className="text-right cursor-pointer hover:text-text-bright flex items-center justify-end gap-1"
              >
                <span>DATE</span>
                <span className="text-[9px]">{sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
              </div>

              {/* ACTION */}
              <div className="text-center">ACTION</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-main/40">
              {filteredVideos.length === 0 ? (
                <div className="p-12 text-center text-text-dim text-xs flex flex-col items-center justify-center gap-2">
                  <Folder size={24} className="opacity-30" />
                  <div>登録されている映画データがありません</div>
                </div>
              ) : (
                filteredVideos.map((video, idx) => {
                  const ext = video.extension || (video.originalName.split('.').pop() || 'MKV').toUpperCase();
                  const isMkv = ext === 'MKV';

                  return (
                    <div
                      key={video.id}
                      className="grid grid-cols-[32px_44px_70px_1fr_180px_100px_90px_140px] gap-2 px-2 py-1.5 items-center hover:bg-base-bg/80 group transition-colors"
                    >
                      {/* Checkbox */}
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(video.id)}
                          onChange={() => toggleSelect(video.id)}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* 順序 (No. 表示) */}
                      <div className="text-center font-mono text-[10px] text-text-dim select-none">
                        {idx + 1}
                      </div>

                      {/* Play & CMD Button */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handlePlayVideo(video)}
                          className="w-6 h-5 flex items-center justify-center bg-border-main hover:bg-text-bright hover:text-base-bg text-text-bright border border-border-light transition-colors"
                          title="KMPlayer / PotPlayer で直接再生"
                        >
                          <Play size={10} className="ml-0.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleDownloadDirectCmd(video)}
                          className="w-7 h-5 flex items-center justify-center bg-base-bg hover:bg-border-light text-text-dim hover:text-text-bright border border-border-main transition-colors text-[9px] font-bold"
                          title="直接起動ファイル (.cmd) を出力"
                        >
                          CMD
                        </button>
                      </div>

                      {/* Title & Local Path */}
                      <div className="flex flex-col min-w-0 pr-2">
                        {editingId === video.id ? (
                          <input
                            className="px-1 py-0.5 bg-black border border-border-main text-text-bright text-xs w-full"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              style={{ fontSize: `${titleSize}px` }}
                              className="text-text-bright font-bold truncate cursor-pointer hover:underline"
                              onDoubleClick={() => startEdit(video)}
                              onClick={() => handlePlayVideo(video)}
                              title={`${video.title} - クリックで再生 (ダブルクリックで名前編集)`}
                            >
                              {video.title}
                            </span>
                          </div>
                        )}

                        {/* Local File Path line (Fixed 10px size) */}
                        {editingPathId === video.id ? (
                          <input
                            className="px-1 py-0.5 mt-0.5 bg-black border border-border-main text-text-dim font-mono w-full text-[10px]"
                            value={editPath}
                            onChange={(e) => setEditPath(e.target.value)}
                            onBlur={saveEditPath}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditPath()}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="text-[10px] text-text-dim font-mono truncate cursor-pointer hover:text-text-normal flex items-center gap-1 mt-0.5"
                            onDoubleClick={() => startEditPath(video)}
                            title="ダブルクリックでパスを編集"
                          >
                            <HardDrive size={10} className="shrink-0 opacity-50" />
                            <span className="truncate">{video.localPath || video.originalName}</span>
                            {video.exists === true && (
                              <span title="ファイル存在確認済" className="text-emerald-400 shrink-0">✓</span>
                            )}
                            {video.exists === false && (
                              <span title="ファイルが見つかりません" className="text-red-400 shrink-0 font-bold">✗</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Category dropdown (Instant Move) */}
                      <div className="flex items-center">
                        <select
                          value={video.categoryId}
                          onChange={(e) => onMoveCategory(video.id, e.target.value)}
                          style={{ fontSize: `${Math.max(10, listSize - 4)}px` }}
                          className="w-full bg-base-bg border border-border-main text-text-normal hover:border-border-light py-1 px-1.5 cursor-pointer focus:outline-none focus:border-text-dim"
                          title="カテゴリを変更（移動）します"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id} className="bg-panel-bg text-text-bright">
                              ■ {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Format & Size */}
                      <div className="flex flex-col items-center justify-center">
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold border ${
                            isMkv
                              ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                              : 'bg-base-bg text-text-dim border-border-main'
                          }`}
                        >
                          {ext}
                        </span>
                        {video.fileSize && (
                          <span className="text-[9px] text-text-dim mt-0.5 font-mono">{video.fileSize}</span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="text-right text-[10px] text-text-dim font-mono">
                        {formatDate(video.createdAt)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-1">
                        {/* 並び替え操作ボタン群 (カラー無し・モノクロ標準) */}
                        <div className="flex items-center gap-0.5 border-r border-border-main/50 pr-1 mr-0.5">
                          <button
                            onClick={() => onMoveTop(video.id)}
                            disabled={idx === 0}
                            className={`p-0.5 hover:text-text-bright ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                            title="一番上（最上段）へ移動"
                          >
                            <ChevronsUp size={11} />
                          </button>
                          <button
                            onClick={() => onMoveUp(video.id)}
                            disabled={idx === 0}
                            className={`p-0.5 hover:text-text-bright ${idx === 0 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                            title="1つ上に移動"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            onClick={() => onMoveDown(video.id)}
                            disabled={idx === filteredVideos.length - 1}
                            className={`p-0.5 hover:text-text-bright ${idx === filteredVideos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                            title="1つ下に移動"
                          >
                            <ChevronDown size={11} />
                          </button>
                          <button
                            onClick={() => onMoveBottom(video.id)}
                            disabled={idx === filteredVideos.length - 1}
                            className={`p-0.5 hover:text-text-bright ${idx === filteredVideos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-text-dim hover:opacity-100'}`}
                            title="一番下（最下段）へ移動"
                          >
                            <ChevronsDown size={11} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleCopyPath(video.localPath || video.originalName)}
                          className="p-1 text-text-dim hover:text-text-bright hover:bg-base-bg transition-colors"
                          title="ファイルパスをコピー"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => startEdit(video)}
                          className="p-1 text-text-dim hover:text-text-bright hover:bg-base-bg transition-colors"
                          title="タイトル・パス編集"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => onDelete(video.id)}
                          className="p-1 text-text-dim hover:text-red-400 hover:bg-base-bg transition-colors"
                          title="この映画を削除"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
