import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '../i18n';

interface SaveMixerModalProps {
  isOpen: boolean;
  items?: {name: string, content: string}[];
  onConfirm: (categoryId: string, items: {name: string, content: string}[]) => void;
  onCancel: () => void;
  lang: Language;
  mixerCategories?: {id: string, label: string}[];
}

export const SaveMixerModal: React.FC<SaveMixerModalProps> = ({ isOpen, items, onConfirm, onCancel, lang, mixerCategories }) => {
  const [selectedMixerCat, setSelectedMixerCat] = useState('');
  
  useEffect(() => {
    if (isOpen && mixerCategories && mixerCategories.length > 0) {
      setSelectedMixerCat(mixerCategories[0].id);
    }
  }, [isOpen, mixerCategories]);
  
  
  const isBulk = items && items.length > 0;

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
              {isBulk ? `${lang === 'en' ? 'Copy' : 'コピー'} ${items.length} ${lang === 'en' ? 'items to Prompt Mixer' : '個のアイテムをプロンプトミキサーへ'}` : (lang === 'en' ? 'Copy to Prompt Mixer' : 'プロンプトミキサーへコピー')}
            </h2>
            
            {mixerCategories && mixerCategories.length > 0 ? (
              <div className="flex flex-col gap-2">
                <label className="block text-[10px] font-mono text-text-dim">Category (カテゴリ)</label>
                <select
                  value={selectedMixerCat}
                  onChange={(e) => setSelectedMixerCat(e.target.value)}
                  className="w-full bg-bg-input border border-border-main text-text-main text-xs font-mono p-2 rounded focus:outline-none focus:border-blue-500"
                >
                  {mixerCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-[11px] text-red-500">
                {lang === 'en' ? 'No mixer categories available.' : 'ミキサーのカテゴリがありません。'}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-bg-input hover:bg-border-main text-text-dim text-[11px] font-mono rounded transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={() => {
                  if (selectedMixerCat && items) {
                    onConfirm(selectedMixerCat, items);
                  }
                }}
                disabled={!selectedMixerCat || !isBulk}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold rounded transition-colors disabled:opacity-50"
              >
                {lang === 'en' ? 'Copy (コピー)' : 'コピー (Copy)'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  
  return createPortal(modalContent, document.body);
};
