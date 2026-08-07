import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, message]);

  const content = (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-bg-panel border border-green-500/50 shadow-lg shadow-green-500/10 rounded-full px-4 py-2 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-text-main text-xs font-mono font-bold">{message}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
