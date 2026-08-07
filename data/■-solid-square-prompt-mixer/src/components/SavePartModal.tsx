import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '../i18n';

interface SavePartModalProps {
  isOpen: boolean;
  content?: string;
  defaultName?: string;
  items?: {name: string, content: string}[];
  categories: [string, number][]; // [category, section]
  selectedId?: string | null;
  selectedName?: string;
  onConfirm: (name: string, category: string, section: number, items?: {name: string, content: string}[], isUpdate?: boolean) => void;
  onCancel: () => void;
  lang: Language;
}

export const SavePartModal: React.FC<SavePartModalProps> = ({ isOpen, content, defaultName, items, categories, selectedId, selectedName, onConfirm, onCancel, lang }) => {
  const [name, setName] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');

  const isBulk = items && items.length > 0;

  useEffect(() => {
    if (isOpen) {
      setName(defaultName || '');
      if (categories.length > 0 && !selectedCat) {
        setSelectedCat(`${categories[0][1]}:${categories[0][0]}`);
      }
    }
  }, [isOpen, defaultName, categories]);

  
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-panel border border-border-main rounded-lg shadow-xl p-6 w-full max-w-sm m-4 flex flex-col gap-4"
          >
            <h2 className="text-text-main text-sm font-mono font-bold">
              {isBulk ? `Save ${items.length} items to parts` : t('save_as_part', lang)}
            </h2>
            
            {!isBulk && (
              <div>
                <label className="block text-[10px] font-mono text-text-dim mb-1">{t('name', lang)}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('name', lang)}
                  className="w-full bg-bg-input border border-border-main text-text-main text-xs font-mono p-2 rounded focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-text-dim mb-1">{t('category', lang)}</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full bg-bg-input border border-border-main text-text-main text-xs font-mono p-2 rounded focus:outline-none focus:border-blue-500"
              >
                {categories.map(([cat, sec]) => (
                  <option key={`${sec}:${cat}`} value={`${sec}:${cat}`}>
                    {t(cat as any, lang) || cat} (Section {sec})
                  </option>
                ))}
              </select>
            </div>

            {!isBulk && (
              <div>
                <label className="block text-[10px] font-mono text-text-dim mb-1">{t('content', lang)}</label>
                <div className="bg-bg-base border border-border-main text-text-dim text-[10px] font-mono p-2 rounded max-h-20 overflow-y-auto whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-bg-input hover:bg-border-main text-text-dim text-[11px] font-mono rounded transition-colors"
              >
                {t('cancel', lang)}
              </button>
              {selectedId && !isBulk && (
                <button
                  onClick={() => {
                    const [sectionStr, ...catParts] = selectedCat.split(':');
                    const categoryName = catParts.join(':');
                    onConfirm(name.trim() || selectedName || '', categoryName, Number(sectionStr), items, true);
                  }}
                  disabled={!selectedCat}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-mono font-bold rounded transition-colors disabled:opacity-50"
                  title={`Update: ${selectedName}`}
                >
                  {t('update_current', lang)}
                </button>
              )}
              <button
                onClick={() => {
                  const [sectionStr, ...catParts] = selectedCat.split(':');
                  const categoryName = catParts.join(':');
                  onConfirm(name.trim(), categoryName, Number(sectionStr), items, false);
                }}
                disabled={(!isBulk && !name.trim()) || !selectedCat}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold rounded transition-colors disabled:opacity-50"
              >
                {t('save_as_new', lang)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
