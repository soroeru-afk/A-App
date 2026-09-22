import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: number;
  maxHeight?: number;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  minHeight = 40,
  maxHeight = 400,
  className = '',
  onChange,
  onWheel,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${minHeight}px`;
    const scrollHeight = el.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    el.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value, minHeight, maxHeight]);

  const handleWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (onWheel) {
      onWheel(e);
    }
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const delta = e.deltaY;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) {
      // Not scrollable (fully expanded or no overflow), pass scroll through
      return;
    }

    const isAtTop = scrollTop <= 0 && delta < 0;
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1 && delta > 0;

    if (!isAtTop && !isAtBottom) {
      // Normal inner scroll
      e.stopPropagation();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      onWheel={handleWheel}
      className={className}
      {...props}
    />
  );
};
