import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface AccordionProps {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  onAdd?: (e: React.MouseEvent) => void;
  onEdit?: (newName: string) => void;
  onDelete?: () => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  expandId?: number;
  collapseId?: number;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, badge, defaultOpen = false, onAdd, onEdit, onDelete, onEditStart, onEditEnd, expandId, collapseId, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  useEffect(() => {
    if (expandId && expandId > 0) setIsOpen(true);
  }, [expandId]);

  useEffect(() => {
    if (collapseId && collapseId > 0) setIsOpen(false);
  }, [collapseId]);

  return (
    <div className="bg-bg-panel border border-border-main rounded-md overflow-hidden">
      <div 
        className="w-full flex items-center justify-between p-2 hover:bg-bg-input transition-colors border-b border-border-main group cursor-pointer"
        onClick={() => !isEditing && setIsOpen(!isOpen)}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 mr-2" onClick={e => e.stopPropagation()}>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="bg-bg-base border border-border-main text-xs font-mono p-1 rounded text-text-main focus:outline-none focus:border-blue-500 flex-1 min-w-0"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (editTitle.trim()) {
                    onEdit?.(editTitle.trim());
                    setIsEditing(false);
                    onEditEnd?.();
                  }
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                    onEditEnd?.();
                  setEditTitle(title);
                }
              }}
            />
            <button onClick={() => {
              if (editTitle.trim()) {
                onEdit?.(editTitle.trim());
                setIsEditing(false);
                    onEditEnd?.();
              }
            }} className="text-green-500 hover:text-green-400 p-1">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => {
              setIsEditing(false);
                    onEditEnd?.();
              setEditTitle(title);
            }} className="text-text-dim hover:text-text-main p-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono font-bold text-text-main uppercase truncate">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="badge-count text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none min-w-[20px] text-center shadow-sm">
                {badge}
              </span>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2">
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-text-dim transition-opacity rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditTitle(title); onEditStart?.(); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 text-text-dim transition-opacity rounded"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onAdd && (
              <div 
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); onAdd(e); }}
                className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 flex items-center gap-1 hover:text-blue-400 text-text-dim transition-opacity border border-transparent hover:border-blue-500/30 rounded cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span className="text-[9px] font-mono whitespace-nowrap">NEW</span>
              </div>
            )}
            <div 
              className={`w-3 h-3 border border-border-hover rounded-sm flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-bg-surface' : ''}`}
            >
               <div className={`w-1 h-1 ${isOpen ? 'bg-blue-500' : 'bg-gray-500'}`} />
            </div>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="p-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
