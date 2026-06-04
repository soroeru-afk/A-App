import React from 'react';

interface EditorPanelProps {
  text: string;
  setText: (text: string) => void;
  onAnalyze: () => void;
}

export function EditorPanel({ text, setText, onAnalyze }: EditorPanelProps) {
  const charCount = text.length;

  return (
    <div className="flex flex-col h-full bg-[#121212] border-r border-[#222] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">エディタ</h2>
          <span className="text-xs text-gray-500 font-mono">{charCount} 文字</span>
        </div>
        <button
          onClick={onAnalyze}
          disabled={!text.trim()}
          className="sq-btn sq-btn-accent h-7 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          解析して分割
        </button>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none text-gray-200 text-base md:text-lg leading-relaxed placeholder-gray-600 font-sans"
        placeholder="ここに長文を貼り付けてください。&#13;&#10;読点（、）や句点（。）、改行で自動的に分割されます。&#13;&#10;プレミアムかつ快適な執筆環境の静寂から、新しい音声が生み出されます。"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
