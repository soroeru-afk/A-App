import React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { TextBlock, Speaker } from '../types';

interface BlockItemProps {
  key?: string | React.Key;
  block: TextBlock;
  speakers: Speaker[];
  onSpeakerChange: (blockId: string, speakerId: number) => void;
  onGenerate: (blockId: string) => void;
}

export function BlockItem({ block, speakers, onSpeakerChange, onGenerate }: BlockItemProps) {
  // Flatten speakers to make the dropdown simpler
  const flatStyles = speakers.flatMap((s) => 
    s.styles.map((style) => ({
      speakerName: s.name,
      styleName: style.name,
      id: style.id,
    }))
  );

  return (
    <div className="bg-[#252525] p-4 rounded-lg border border-[#333] hover:border-[#444] transition-colors group">
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-gray-200 leading-relaxed break-all">{block.text}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <select
            value={block.speakerId}
            onChange={(e) => onSpeakerChange(block.id, parseInt(e.target.value, 10))}
            className="w-full bg-[#1e1e1e] border border-[#444] text-gray-300 text-sm rounded px-2 py-1.5 outline-none focus:border-gray-500 appearance-none"
          >
            {flatStyles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.speakerName} ({item.styleName})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {block.status === 'error' && (
              <span className="text-red-400 text-xs" title={block.errorMessage}>エラー</span>
            )}
            
            {block.status === 'done' && block.audioUrl ? (
              <audio 
                controls 
                src={block.audioUrl} 
                className="h-8 w-40 opacity-80 custom-audio" 
                controlsList="nodownload noplaybackrate"
              />
            ) : (
              <button
                onClick={() => onGenerate(block.id)}
                disabled={block.status === 'generating'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] text-gray-300 rounded text-sm hover:bg-[#444] transition-colors disabled:opacity-50"
              >
                {block.status === 'generating' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {block.status === 'generating' ? '生成中...' : '生成'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
