import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Language, t } from '../i18n';

interface AddModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: (name: string, content?: string) => void;
  showContentField?: boolean;
  onCancel: () => void;
  lang: Language;
}

export const AddModal: React.FC<AddModalProps> = ({ isOpen, title, onConfirm, onCancel, lang, showContentField = false }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setContent('');
    }
  }, [isOpen]);

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
            <p className="text-text-main text-sm font-mono mb-4">{title}</p>
            {showContentField ? (
              <div className="flex flex-col gap-3 mb-6">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-bg-base border border-border-main text-sm font-mono p-2 rounded text-text-main focus:outline-none focus:border-blue-500 w-full"
                  placeholder={t('name', lang)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && name.trim()) {
                      onConfirm(name.trim(), content);
                    } else if (e.key === 'Escape') {
                      onCancel();
                    }
                  }}
                />
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="bg-bg-base border border-border-main text-sm font-mono p-2 rounded text-text-main focus:outline-none focus:border-blue-500 w-full h-24 resize-none"
                  placeholder={t('placeholder', lang)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && name.trim()) {
                      onConfirm(name.trim(), content);
                    } else if (e.key === 'Escape') {
                      onCancel();
                    }
                  }}
                />
              </div>
            ) : (
              <input
                value={name}
              onChange={e => setName(e.target.value)}
              className="bg-bg-base border border-border-main text-sm font-mono p-2 rounded text-text-main focus:outline-none focus:border-blue-500 w-full mb-6"
              placeholder={t('name', lang)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) {
                  onConfirm(name.trim(), showContentField ? content : undefined);
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
            />
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-bg-input hover:bg-border-main text-text-dim text-[11px] font-mono rounded transition-colors"
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={() => {
                  if (name.trim()) onConfirm(name.trim(), showContentField ? content : undefined);
                }}
                disabled={!name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold rounded transition-colors disabled:opacity-50"
              >
                {t('confirm', lang)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
