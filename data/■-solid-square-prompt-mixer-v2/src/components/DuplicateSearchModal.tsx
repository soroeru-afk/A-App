import React, { useState, useMemo, useEffect } from 'react';
import { VariationPart, SectionType } from '../types';
import { X, Trash2, Combine, CheckSquare, Square } from 'lucide-react';
import { t } from '../i18n';

interface DuplicateSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: VariationPart[];
  onDeleteBulk: (ids: string[]) => void;
  onMerge: (idsToMerge: string[], mergedName: string, mergedContent: string, section: SectionType, category: string) => void;
  lang: string;
  theme: string;
}

const getTags = (str: string) => {
  return str.toLowerCase().split(/[,、\n]+/).map(s => s.trim()).filter(Boolean);
};

const getBigrams = (str: string) => {
  const bigrams = new Set<string>();
  const s = str.toLowerCase().replace(/\s+/g, '');
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.substring(i, i + 2));
  }
  return bigrams;
};

const calcSimilarity = (p1: VariationPart, p2: VariationPart) => {
  if (p1.content === p2.content) return 1;
  if (p1.name.toLowerCase() === p2.name.toLowerCase()) return 0.9;
  
  const tags1 = getTags(p1.content);
  const tags2 = getTags(p2.content);
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  let intersect = 0;
  for (const tg of set1) {
    if (set2.has(tg)) intersect++;
  }
  const union = set1.size + set2.size - intersect;
  const jaccard = union === 0 ? 0 : intersect / union;
  if (jaccard >= 0.5) return jaccard;

  const bg1 = getBigrams(p1.content);
  const bg2 = getBigrams(p2.content);
  let bgIntersect = 0;
  for (const b of bg1) {
    if (bg2.has(b)) bgIntersect++;
  }
  const bgSim = (2.0 * bgIntersect) / (bg1.size + bg2.size);
  if (bgSim >= 0.7) return bgSim;
  
  const lenRatio = Math.min(p1.content.length, p2.content.length) / Math.max(p1.content.length, p2.content.length);
  if (lenRatio > 0.5) {
    if (p1.content.toLowerCase().includes(p2.content.toLowerCase()) || p2.content.toLowerCase().includes(p1.content.toLowerCase())) {
      return 0.8;
    }
  }

  return 0;
};

export const DuplicateSearchModal: React.FC<DuplicateSearchModalProps> = ({
  isOpen, onClose, parts, onDeleteBulk, onMerge, lang, theme
}) => {
  const [groups, setGroups] = useState<VariationPart[][]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergingGroupIds, setMergingGroupIds] = useState<string[] | null>(null);
  const [mergeName, setMergeName] = useState('');
  const [mergeContent, setMergeContent] = useState('');
  const [mergeSection, setMergeSection] = useState<SectionType>(1);
  const [mergeCategory, setMergeCategory] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{message: string, action: () => void} | null>(null);

  const doSearch = () => {
    const graph = new Map<string, string[]>();
    parts.forEach(p => graph.set(p.id, []));

    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        if (calcSimilarity(parts[i], parts[j]) > 0) {
          graph.get(parts[i].id)!.push(parts[j].id);
          graph.get(parts[j].id)!.push(parts[i].id);
        }
      }
    }

    const visited = new Set<string>();
    const newGroups: VariationPart[][] = [];

    for (const p of parts) {
      if (!visited.has(p.id) && graph.get(p.id)!.length > 0) {
        const comp: VariationPart[] = [];
        const q = [p.id];
        visited.add(p.id);
        while (q.length > 0) {
          const cur = q.shift()!;
          comp.push(parts.find(x => x.id === cur)!);
          for (const nei of graph.get(cur)!) {
            if (!visited.has(nei)) {
              visited.add(nei);
              q.push(nei);
            }
          }
        }
        if (comp.length > 1) {
          newGroups.push(comp);
        }
      }
    }
    setGroups(newGroups);
    setSelectedIds(new Set());
    setMergingGroupIds(null);
  };

  useEffect(() => {
    if (isOpen) {
      doSearch();
    }
  }, [isOpen, parts]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleMergeClick = (groupParts: VariationPart[]) => {
    const ids = groupParts.map(p => p.id).filter(id => selectedIds.has(id));
    if (ids.length < 2) return;
    const selectedParts = parts.filter(p => ids.includes(p.id));
    setMergingGroupIds(ids);
    setMergeName(selectedParts[0].name);
    setMergeSection(selectedParts[0].section);
    setMergeCategory(selectedParts[0].category);
    
    // Auto merge content
    const allTags = new Set<string>();
    selectedParts.forEach(p => {
      getTags(p.content).forEach(t => allTags.add(t));
    });
    setMergeContent(Array.from(allTags).join(', '));
  };

  const handleMergeSubmit = () => {
    if (!mergingGroupIds || !mergeName || !mergeContent) return;
    onMerge(mergingGroupIds, mergeName, mergeContent, mergeSection, mergeCategory);
    setSelectedIds(prev => {
      const next = new Set(prev);
      mergingGroupIds.forEach(id => next.delete(id));
      return next;
    });
    setMergingGroupIds(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl ${theme === 'light' || theme === 'mono' ? 'bg-white' : 'bg-bg-base border border-border-main'}`}>
        
        <div className="flex justify-between items-center p-4 border-b border-border-main">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Combine className="w-5 h-5" />
            {lang === 'en' ? 'Duplicate / Similar Parts' : '重複・類似パーツの確認'}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                // Just toggle isOpen or recalculate manually? Actually we can just force re-render.
                doSearch();
              }}
              className="text-[11px] font-mono px-3 py-1.5 bg-bg-input text-text-dim hover:text-text-main hover:bg-border-main flex items-center gap-1 transition-colors"
            >
              <Combine className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Refresh' : '再サーチ'}
            </button>
            <button 
              onClick={() => {
                const toDelete = new Set<string>();
                const toKeep = new Map<string, any>();
                
                const scorePart = (p: any) => {
                  let score = 0;
                  if (p.category.includes('(') && p.category.includes(')')) score += 10;
                  if (p.name.includes('/') || p.name.includes('(')) score += 5;
                  score += p.category.length * 0.1;
                  return score;
                };

                for (const p of parts) {
                  const normTags = p.content.toLowerCase().split(/[,、\n]+/).map(s => s.trim().replace(/[\s　]+/g, ' ')).filter(Boolean).join(',');
                  if (!normTags) continue;
                  
                  // Match by section and identical content (tags). We ignore category to merge identical parts across similar categories.
                  const key = `${p.section}|${normTags}`;
                  
                  if (toKeep.has(key)) {
                    const existing = toKeep.get(key)!;
                    const existingScore = scorePart(existing);
                    const currentScore = scorePart(p);
                    
                    if (currentScore > existingScore) {
                      toDelete.add(existing.id);
                      toKeep.set(key, p);
                    } else {
                      toDelete.add(p.id);
                    }
                  } else {
                    toKeep.set(key, p);
                  }
                }
                if (toDelete.size > 0) {
                  setConfirmAction({
                    message: lang === 'en' ? `Are you sure you want to delete ${toDelete.size} exact duplicates?` : `完全に一致する重複パーツを ${toDelete.size} 件削除してよろしいですか？`,
                    action: () => {
                      onDeleteBulk(Array.from(toDelete));
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        toDelete.forEach(id => next.delete(id));
                        return next;
                      });
                      setAlertMessage(lang === 'en' ? `Successfully merged ${toDelete.size} duplicate parts.` : `${toDelete.size} 件の重複パーツを削除し、一つにまとめました。`);
                    }
                  });
                } else {
                  setAlertMessage(lang === 'en' ? 'No exact duplicates found.' : '完全に一致する重複パーツは見つかりませんでした。（カンマの有無や空白の違いがないかご確認ください）');
                }
              }}
              className="text-[11px] font-mono px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex items-center gap-1"
            >
              <Combine className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Auto-merge Exact Duplicates' : '完全一致を一つにする'}
            </button>
            <button 
              onClick={() => {
                if (selectedIds.size === 0) return;
                const ids = Array.from(selectedIds);
                onDeleteBulk(ids);
                setSelectedIds(new Set());
              }}
              disabled={selectedIds.size === 0}
              className={`text-[11px] font-mono px-3 py-1.5 flex items-center gap-1 ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed text-text-dim bg-bg-base' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Delete Selected' : '選択を削除'}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-bg-panel text-text-dim ml-2 border border-transparent hover:border-border-main transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {groups.length === 0 ? (
            <div className="text-center py-10 text-text-dim font-mono">
              {lang === 'en' ? 'No similar parts found.' : '重複または類似するパーツは見つかりませんでした。'}
            </div>
          ) : (
            groups.map((group, i) => {
              const selectedInGroup = group.filter(p => selectedIds.has(p.id));
              return (
                <div key={i} className="border border-border-main bg-bg-panel overflow-hidden">
                  <div className="p-2 bg-bg-input border-b border-border-main flex justify-between items-center">
                    <span className="text-xs font-mono text-text-dim uppercase font-bold">Group {i + 1}</span>
                    <div className="flex gap-2">
                      <button 
                        disabled={selectedInGroup.length === 0}
                        onClick={() => {
                          const ids = selectedInGroup.map(p => p.id);
                          onDeleteBulk(ids);
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            ids.forEach(id => next.delete(id));
                            return next;
                          });
                        }}
                        className={`text-[11px] font-mono px-2 py-1 flex items-center gap-1 ${selectedInGroup.length === 0 ? 'opacity-50 cursor-not-allowed text-text-dim bg-bg-base' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        {lang === 'en' ? 'Delete Selected' : '選択を削除'}
                      </button>
                      <button 
                        disabled={selectedInGroup.length < 2}
                        onClick={() => handleMergeClick(group)}
                        className={`text-[11px] font-mono px-2 py-1 flex items-center gap-1 ${selectedInGroup.length < 2 ? 'opacity-50 cursor-not-allowed text-text-dim bg-bg-base' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                      >
                        <Combine className="w-3 h-3" />
                        {lang === 'en' ? 'Merge Selected' : '選択をまとめる'}
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-border-main">
                    {group.map(p => {
                      const isSelected = selectedIds.has(p.id);
                      return (
                        <div key={p.id} className="p-3 flex items-start gap-3 hover:bg-bg-input/50 transition-colors">
                          <button onClick={() => toggleSelect(p.id)} className="mt-1 text-text-dim hover:text-text-main">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-accent-main" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-text-main truncate">{p.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 border border-border-main text-text-dim font-mono truncate max-w-[100px]">{p.category}</span>
                              <span className="text-[9px] px-1.5 py-0.5 border border-border-main text-text-dim font-mono">Sec {p.section}</span>
                            </div>
                            <div className="text-xs text-text-dim font-mono break-words whitespace-pre-wrap">{p.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-panel border border-border-main shadow-xl p-6 w-full max-w-sm m-4">
            <p className="text-text-main text-sm font-mono mb-6">{confirmAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 bg-bg-input hover:bg-border-main text-text-dim text-[11px] font-mono transition-colors">
                {lang === 'en' ? 'Cancel' : 'キャンセル'}
              </button>
              <button onClick={() => { confirmAction.action(); setConfirmAction(null); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold transition-colors">
                {lang === 'en' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-panel border border-border-main shadow-xl p-6 w-full max-w-sm m-4">
            <p className="text-text-main text-sm font-mono mb-6">{alertMessage}</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setAlertMessage(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {mergingGroupIds && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl ${theme === 'light' || theme === 'mono' ? 'bg-white' : 'bg-bg-panel border border-border-main'}`}>
            <h3 className="text-sm font-bold text-text-main uppercase font-mono">
              {lang === 'en' ? 'Merge Parts' : 'パーツをまとめる'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase mb-1 block">Name</label>
                <input 
                  type="text"
                  value={mergeName}
                  onChange={e => setMergeName(e.target.value)}
                  className="w-full bg-bg-input border border-border-main text-sm px-2 py-1.5 focus:outline-none focus:border-accent-main text-text-main"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-text-dim uppercase mb-1 block">Content</label>
                <textarea 
                  value={mergeContent}
                  onChange={e => setMergeContent(e.target.value)}
                  className="w-full bg-bg-input border border-border-main text-sm font-mono px-2 py-1.5 focus:outline-none focus:border-accent-main text-text-main min-h-[100px] resize-y"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setMergingGroupIds(null)} className="px-3 py-1.5 text-xs font-mono text-text-dim hover:text-text-main transition-colors">
                {lang === 'en' ? 'Cancel' : 'キャンセル'}
              </button>
              <button onClick={handleMergeSubmit} className="px-3 py-1.5 text-xs font-mono bg-accent-main text-white hover:bg-opacity-90 transition-colors shadow-lg">
                {lang === 'en' ? 'Save & Delete Originals' : '保存して元パーツを削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
