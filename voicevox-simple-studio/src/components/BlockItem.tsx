import React, { useState } from 'react';
import { Loader2, Wand2, Settings, Volume2, Play } from 'lucide-react';
import { TextBlock, Speaker } from '../types';
import { synthesizeAudio } from '../lib/voicevox';

interface BlockItemProps {
  block: TextBlock;
  speakers: Speaker[];
  engineUrl: string;
  onSpeakerChange: (blockId: string, speakerId: number) => void;
  onBlockParamChange: (blockId: string, param: 'speedScale' | 'pitchScale' | 'intonationScale', value: number) => void;
  onGenerate: (blockId: string) => void;
}

export function BlockItem({
  block,
  speakers,
  engineUrl,
  onSpeakerChange,
  onBlockParamChange,
  onGenerate,
}: BlockItemProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

  // Flatten speakers to make the dropdown simpler
  const flatStyles = speakers.flatMap((s) =>
    s.styles.map((style) => ({
      speakerName: s.name,
      styleName: style.name,
      id: style.id,
    }))
  );

  const handlePreviewVoice = async () => {
    if ((window as any)._activeAudio) {
      (window as any)._activeAudio.pause();
      (window as any)._activeAudio = null;
    }
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    try {
      const blob = await synthesizeAudio('こんにちは', block.speakerId, engineUrl, {
        speedScale: block.speedScale ?? 1.0,
        pitchScale: block.pitchScale ?? 0.0,
        intonationScale: block.intonationScale ?? 1.0,
      });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      if ((window as any)._activeAudio) {
        (window as any)._activeAudio.pause();
      }
      (window as any)._activeAudio = audio;
      audio.onended = () => {
        if ((window as any)._activeAudio === audio) {
          (window as any)._activeAudio = null;
        }
      };
      audio.play();
    } catch (err) {
      console.error('Failed to preview voice', err);
    } finally {
      setIsPreviewingVoice(false);
    }
  };

  return (
    <div className="bg-[#1b1b1b] p-4 rounded-xl border border-[#2c2c2c] hover:border-[#3a3a3a] transition-all duration-300 group shadow-md">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1">
          <p className="text-gray-100 leading-relaxed break-all font-sans text-sm md:text-base">{block.text}</p>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-3 min-w-[240px]">
          <div className="flex items-center gap-2 w-full">
            <select
              value={block.speakerId}
              onChange={(e) => onSpeakerChange(block.id, parseInt(e.target.value, 10))}
              className="flex-1 bg-[#121212] border border-[#2c2c2c] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-600 transition-colors"
            >
              {flatStyles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.speakerName} ({item.styleName})
                </option>
              ))}
            </select>
            <button
              onClick={handlePreviewVoice}
              disabled={isPreviewingVoice}
              className="p-2 bg-[#121212] hover:bg-[#252525] border border-[#2c2c2c] text-gray-300 hover:text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
              title="ボイスプレビュー"
            >
              {isPreviewingVoice ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-all ${
                showSettings
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-[#121212] border-[#2c2c2c] text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
              }`}
              title="パラメータ個別設定"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              {block.status === 'error' && (
                <span className="text-red-400 text-xs" title={block.errorMessage}>
                  エラー
                </span>
              )}

              {block.status === 'done' && block.audioUrl ? (
                <audio
                  controls
                  src={block.audioUrl}
                  className="h-8 w-44 opacity-90 custom-audio"
                  controlsList="nodownload noplaybackrate"
                />
              ) : (
                <button
                  onClick={() => onGenerate(block.id)}
                  disabled={block.status === 'generating'}
                  className="flex items-center gap-1.5 px-4.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all disabled:opacity-50"
                >
                  {block.status === 'generating' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  {block.status === 'generating' ? '生成中' : '生成'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="mt-4 pt-4 border-t border-[#2c2c2c] grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#121212] p-3 rounded-lg">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">速度 (Speed)</span>
              <span className="text-indigo-400 font-mono font-medium">{(block.speedScale ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={block.speedScale ?? 1.0}
              onChange={(e) => onBlockParamChange(block.id, 'speedScale', parseFloat(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">ピッチ (Pitch)</span>
              <span className="text-indigo-400 font-mono font-medium">{(block.pitchScale ?? 0.0).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-0.15"
              max="0.15"
              step="0.01"
              value={block.pitchScale ?? 0.0}
              onChange={(e) => onBlockParamChange(block.id, 'pitchScale', parseFloat(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">抑揚 (Intonation)</span>
              <span className="text-indigo-400 font-mono font-medium">{(block.intonationScale ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={block.intonationScale ?? 1.0}
              onChange={(e) => onBlockParamChange(block.id, 'intonationScale', parseFloat(e.target.value))}
              className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
