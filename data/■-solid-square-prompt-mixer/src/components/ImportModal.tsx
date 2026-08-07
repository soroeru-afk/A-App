import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '../i18n';

interface ImportModalProps {
  isOpen: boolean;
  onMerge: () => void;
  onOverwrite: () => void;
  onCancel: () => void;
  lang: Language;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onMerge, onOverwrite, onCancel, lang }) => {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-panel border border-border-main rounded-lg shadow-xl p-6 w-full max-w-sm m-4"
          >
            <h3 className="text-text-main text-base font-bold font-mono mb-4">
              {lang === 'en' ? 'Import Data' : 'データのインポート'}
            </h3>
            <p className="text-text-main text-sm font-mono mb-6 whitespace-pre-wrap">
              {lang === 'en' 
                ? 'How would you like to import the data? Merge keeps your current items, while Overwrite replaces everything.' 
                : 'インポート方法を選択してください。\n\n【マージ（結合）】現在のデータを残したまま、新しいデータを追加します。\n\n【上書き】現在のデータをすべて消去し、インポートするデータで完全に置き換えます。'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-3 py-2 bg-bg-input hover:bg-border-main text-text-dim text-[11px] font-mono rounded transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={onOverwrite}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 text-[11px] font-mono font-bold rounded transition-colors"
              >
                {lang === 'en' ? 'Overwrite' : '上書きする'}
              </button>
              <button
                onClick={onMerge}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold rounded transition-colors"
              >
                {lang === 'en' ? 'Merge (Add)' : 'マージ（結合）'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  return createPortal(modalContent, document.body);
};
