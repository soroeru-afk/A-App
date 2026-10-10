import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  value: string;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  minHeight = 44,
  className = '',
  onChange,
  onWheel,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    // Set to 0 to get the exact unconstrained scrollHeight
    el.style.height = '0px';
    const computedHeight = Math.max(minHeight, el.scrollHeight);
    el.style.height = `${computedHeight}px`;
  };

  useEffect(() => {
    // Run adjustHeight immediately and on the next animation frame to ensure layout is ready
    adjustHeight();
    const frameId = requestAnimationFrame(adjustHeight);
    return () => cancelAnimationFrame(frameId);
  }, [value, minHeight]);

  const handleWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (el) {
      const isAtTop = el.scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
      const cannotScroll = el.scrollHeight <= el.clientHeight + 1;

      // If textarea itself cannot scroll further or is already fully expanded,
      // propagate the scroll up to the parent scrollable container
      if (cannotScroll || isAtTop || isAtBottom) {
        let parent: HTMLElement | null = el.parentElement;
        while (parent && parent !== document.body) {
          const overflowY = window.getComputedStyle(parent).overflowY;
          if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
            parent.scrollTop += e.deltaY;
            break;
          }
          parent = parent.parentElement;
        }
      }
    }
    if (onWheel) onWheel(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        adjustHeight();
        if (onChange) onChange(e);
      }}
      onWheel={handleWheel}
      className={className}
      {...props}
    />
  );
};
