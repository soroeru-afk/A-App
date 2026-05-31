import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, PlayCircle, Library, Wand2 } from 'lucide-react';
import { TextBlock, Speaker } from '../types';
import { BlockItem } from './BlockItem';

interface PreviewPanelProps {
  blocks: TextBlock[];
  speakers: Speaker[];
  onSpeakerChange: (blockId: string, speakerId: number) => void;
  onGlobalSpeakerChange: (speakerId: number) => void;
  onGenerateSingle: (blockId: string) => void;
  onGenerateAll: () => void;
}

export function PreviewPanel({
  blocks,
  speakers,
  onSpeakerChange,
  onGlobalSpeakerChange,
  onGenerateSingle,
  onGenerateAll
}: PreviewPanelProps) {
  
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);

  const isGeneratingAny = blocks.some((b) => b.status === 'generating');
  const hasBlocks = blocks.length > 0;
  const readyBlocks = blocks.filter((b) => b.status === 'done' && b.audioBlob);
  const someReady = readyBlocks.length > 0;
  const allReady = hasBlocks && readyBlocks.length === blocks.length;

  const flatStyles = speakers.flatMap((s) => 
    s.styles.map((style) => ({
      speakerName: s.name,
      styleName: style.name,
      id: style.id,
    }))
  );

  const handleDownloadZip = async () => {
    if (readyBlocks.length === 0) return;
    
    const zip = new JSZip();
    blocks.forEach((block, index) => {
      // Only add those with blobs to ZIP
      if (block.audioBlob && block.status === 'done') {
        const numStr = String(index + 1).padStart(3, '0');
        zip.file(`${numStr}_synthesis.wav`, block.audioBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'voicevox_audio.zip');
  };

  const handleContinuousPlay = () => {
    if (readyBlocks.length > 0) {
      setPlayingIndex(0);
    }
  };

  const handleAudioEnded = () => {
    if (playingIndex !== null) {
      // Find the next ready block
      let nextIndex = playingIndex + 1;
      while (nextIndex < blocks.length && blocks[nextIndex].status !== 'done') {
        nextIndex++;
      }
      if (nextIndex < blocks.length) {
        setPlayingIndex(nextIndex);
      } else {
        setPlayingIndex(null); // Finished
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161616]">
      <div className="flex items-center justify-between p-6 border-b border-[#333]">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Blocks ({blocks.length})</h2>
          {hasBlocks && flatStyles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">全体の話者:</span>
              <select
                onChange={(e) => onGlobalSpeakerChange(parseInt(e.target.value, 10))}
                className="bg-[#1e1e1e] border border-[#444] text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-gray-500 appearance-none"
              >
                <option value="">(選択して一括変更)</option>
                {flatStyles.map((item) => (
                  <option key={`global-${item.id}`} value={item.id}>
                    {item.speakerName} ({item.styleName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleContinuousPlay}
            disabled={!someReady || playingIndex !== null}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:bg-[#333] disabled:text-gray-500"
            title={!someReady ? "生成済みの音声がありません" : ""}
          >
            <PlayCircle className="w-4 h-4" />
            連続再生
          </button>
          
          <button
            onClick={onGenerateAll}
            disabled={!hasBlocks || isGeneratingAny}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-[#333] disabled:text-gray-500"
          >
            <Wand2 className="w-4 h-4" />
            一括生成
          </button>
          
          <button
            onClick={handleDownloadZip}
            disabled={!someReady || isGeneratingAny}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-900 rounded text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:bg-[#333] disabled:text-gray-500"
          >
            <Download className="w-4 h-4" />
            ZIPダウンロード
          </button>
        </div>
      </div>

      {playingIndex !== null && blocks[playingIndex]?.audioUrl && (
        <audio 
          autoPlay 
          src={blocks[playingIndex].audioUrl} 
          onEnded={handleAudioEnded} 
          className="hidden" 
        />
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Library className="w-12 h-12 mb-4 opacity-50" />
            <p>左側のエディタで「解析して分割」を押すと、<br/>ここにブロックが表示されます。</p>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              speakers={speakers}
              onSpeakerChange={onSpeakerChange}
              onGenerate={onGenerateSingle}
            />
          ))
        )}
      </div>
    </div>
  );
}
