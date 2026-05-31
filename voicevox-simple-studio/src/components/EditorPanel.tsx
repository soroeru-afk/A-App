import React from 'react';

interface EditorPanelProps {
  text: string;
  setText: (text: string) => void;
  onAnalyze: () => void;
}

export function EditorPanel({ text, setText, onAnalyze }: EditorPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Editor</h2>
        <button
          onClick={onAnalyze}
          disabled={!text.trim()}
          className="px-4 py-1.5 bg-gray-100 text-gray-900 rounded text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          解析して分割
        </button>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none text-gray-200 text-lg leading-relaxed placeholder-gray-600"
        placeholder="ここに長文を貼り付けてください。&#13;&#10;読点（、）や句点（。）、改行で自動的に分割されます。"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
