import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, PlayCircle, Library, Wand2, Trash2, Square, Play, Loader2, Music, Settings, XCircle } from 'lucide-react';
import { TextBlock, Speaker } from '../types';
import { BlockItem } from './BlockItem';
import { synthesizeAudio } from '../lib/voicevox';

interface PreviewPanelProps {
  blocks: TextBlock[];
  speakers: Speaker[];
  engineUrl: string;
  globalSpeed: number;
  setGlobalSpeed: (val: number) => void;
  globalPitch: number;
  setGlobalPitch: (val: number) => void;
  globalIntonation: number;
  setGlobalIntonation: (val: number) => void;
  onSpeakerChange: (blockId: string, speakerId: number) => void;
  onBlockParamChange: (blockId: string, param: 'speedScale' | 'pitchScale' | 'intonationScale', value: number) => void;
  onGlobalSpeakerChange: (speakerId: number) => void;
  onGenerateSingle: (blockId: string) => void;
  onGenerateAll: () => void;
  onClearBlocks: () => void;
}

const PRESET_SAMPLES = [
  { label: 'こんにちは', text: 'こんにちは' },
  { label: 'よろしくお願いします。', text: 'よろしくお願いします。' },
  { label: '今日の天気はとても良いですね。', text: '今日の天気はとても良いですね。' },
  { label: '私の声は、うまく聞こえていますでしょうか？', text: '私の声は、うまく聞こえていますでしょうか？' },
  { label: 'エラーが発生しました。システムを確認してください。', text: 'エラーが発生しました。システムを確認してください。' },
];

export function PreviewPanel({
  blocks,
  speakers,
  engineUrl,
  globalSpeed,
  setGlobalSpeed,
  globalPitch,
  setGlobalPitch,
  globalIntonation,
  setGlobalIntonation,
  onSpeakerChange,
  onBlockParamChange,
  onGlobalSpeakerChange,
  onGenerateSingle,
  onGenerateAll,
  onClearBlocks,
}: PreviewPanelProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [isPreviewingGlobalVoice, setIsPreviewingGlobalVoice] = useState(false);
  const [selectedGlobalSpeakerId, setSelectedGlobalSpeakerId] = useState<number>(3); // Default to Zundamon
  const [isMerging, setIsMerging] = useState(false);
  const [sampleText, setSampleText] = useState('こんにちは');
  const [customSampleText, setCustomSampleText] = useState('');

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const isGeneratingAny = blocks.some((b) => b.status === 'generating');
  const hasBlocks = blocks.length > 0;
  const readyBlocks = blocks.filter((b) => b.status === 'done' && b.audioBlob);
  const someReady = readyBlocks.length > 0;

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
      if (block.audioBlob && block.status === 'done') {
        const numStr = String(index + 1).padStart(3, '0');
        zip.file(`${numStr}_synthesis.wav`, block.audioBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'voicevox_audio.zip');
  };

  const handleMergeDownload = async () => {
    if (readyBlocks.length === 0) return;
    setIsMerging(true);
    try {
      const blobsToMerge = blocks
        .filter((b) => b.status === 'done' && b.audioBlob)
        .map((b) => b.audioBlob as Blob);

      const { mergeWavFiles } = await import('../lib/voicevox');
      const mergedBlob = await mergeWavFiles(blobsToMerge);
      saveAs(mergedBlob, 'voicevox_merged.wav');
    } catch (err) {
      console.error('Failed to merge WAV files', err);
      alert('音声の結合に失敗しました: ' + err);
    } finally {
      setIsMerging(false);
    }
  };

  const handleContinuousPlay = () => {
    // Stop any currently playing preview audio first
    if ((window as any)._activeAudio) {
      (window as any)._activeAudio.pause();
      (window as any)._activeAudio = null;
    }

    if (readyBlocks.length > 0) {
      const firstDoneIndex = blocks.findIndex((b) => b.status === 'done' && b.audioUrl);
      if (firstDoneIndex !== -1) {
        setPlayingIndex(firstDoneIndex);
      }
    }
  };

  const handleStopContinuousPlay = () => {
    setPlayingIndex(null);
    if ((window as any)._activeAudio) {
      (window as any)._activeAudio.pause();
      (window as any)._activeAudio = null;
    }
  };

  const handleAudioEnded = () => {
    if (playingIndex !== null) {
      let nextIndex = playingIndex + 1;
      while (nextIndex < blocks.length && blocks[nextIndex].status !== 'done') {
        nextIndex++;
      }
      if (nextIndex < blocks.length) {
        setPlayingIndex(nextIndex);
      } else {
        setPlayingIndex(null);
      }
    }
  };

  const handlePreviewGlobalVoice = async () => {
    if ((window as any)._activeAudio) {
      (window as any)._activeAudio.pause();
      (window as any)._activeAudio = null;
    }
    if (isPreviewingGlobalVoice) return;
    setIsPreviewingGlobalVoice(true);
    try {
      const textToSynthesize = customSampleText.trim() || sampleText;
      const blob = await synthesizeAudio(textToSynthesize, selectedGlobalSpeakerId, engineUrl, {
        speedScale: globalSpeed,
        pitchScale: globalPitch,
        intonationScale: globalIntonation,
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
      console.error('Failed to preview global voice', err);
    } finally {
      setIsPreviewingGlobalVoice(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161616]">
      <div className="flex flex-col p-6 border-b border-[#222] gap-4 bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Blocks</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">{blocks.length} ブロック</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
              className={`p-2 rounded-lg border transition-all ${
                showGlobalSettings
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-[#1b1b1b] border-[#2c2c2c] text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
              }`}
              title="全体パラメータ設定"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {playingIndex !== null ? (
              <button
                onClick={handleStopContinuousPlay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                停止
              </button>
            ) : (
              <button
                onClick={handleContinuousPlay}
                disabled={!someReady}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:bg-[#1b1b1b] disabled:text-gray-500"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                連続再生
              </button>
            )}

            <button
              onClick={onGenerateAll}
              disabled={!hasBlocks || isGeneratingAny}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors disabled:opacity-40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              一括生成
            </button>

            <button
              onClick={handleMergeDownload}
              disabled={!someReady || isMerging}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b1b1b] border border-[#2c2c2c] text-gray-300 hover:bg-[#252525] rounded-lg text-xs font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:text-gray-500"
            >
              {isMerging ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Music className="w-3.5 h-3.5" />
              )}
              結合WAV
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={!someReady}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b1b1b] border border-[#2c2c2c] text-gray-300 hover:bg-[#252525] rounded-lg text-xs font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:text-gray-500"
            >
              <Download className="w-3.5 h-3.5" />
              ZIP
            </button>

            {hasBlocks && (
              <button
                onClick={onClearBlocks}
                disabled={isGeneratingAny}
                className="p-2 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50"
                title="すべてクリア"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Parameters Drawer */}
        {showGlobalSettings && (
          <div className="p-4 bg-[#1b1b1b] border border-[#222] rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">全体話者一括指定</span>
              <div className="flex gap-2">
                <select
                  value={selectedGlobalSpeakerId}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setSelectedGlobalSpeakerId(id);
                    onGlobalSpeakerChange(id);
                  }}
                  className="flex-1 bg-[#121212] border border-[#2c2c2c] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-600 transition-colors"
                >
                  {flatStyles.map((item) => (
                    <option key={`global-${item.id}`} value={item.id}>
                      {item.speakerName} ({item.styleName})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePreviewGlobalVoice}
                  disabled={isPreviewingGlobalVoice}
                  className="p-2 bg-[#121212] hover:bg-[#252525] border border-[#2c2c2c] text-gray-300 hover:text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
                  title="全体ボイスプレビュー"
                >
                  {isPreviewingGlobalVoice ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
              </div>

              {/* Voice Sample Selection */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">プレビュー用サンプルテキスト</span>
                <select
                  value={sampleText}
                  onChange={(e) => {
                    setSampleText(e.target.value);
                    setCustomSampleText('');
                  }}
                  className="bg-[#121212] border border-[#2c2c2c] text-gray-300 text-[11px] rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-600 transition-colors"
                >
                  {PRESET_SAMPLES.map((s) => (
                    <option key={s.text} value={s.text}>
                      {s.label}
                    </option>
                  ))}
                  <option value="">カスタムテキストを入力...</option>
                </select>
                {(sampleText === '' || customSampleText !== '') && (
                  <input
                    type="text"
                    placeholder="テスト再生させたいセリフを入力してください"
                    value={customSampleText}
                    onChange={(e) => setCustomSampleText(e.target.value)}
                    className="bg-[#121212] border border-[#2c2c2c] text-gray-300 text-[11px] rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-600 transition-colors mt-1"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">新規分割時デフォルト設定</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">速度</span>
                    <span className="text-indigo-400 font-mono">{globalSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={globalSpeed}
                    onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">ピッチ</span>
                    <span className="text-indigo-400 font-mono">{globalPitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.15"
                    max="0.15"
                    step="0.01"
                    value={globalPitch}
                    onChange={(e) => setGlobalPitch(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">抑揚</span>
                    <span className="text-indigo-400 font-mono">{globalIntonation.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.1"
                    value={globalIntonation}
                    onChange={(e) => setGlobalIntonation(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#252525] rounded-full appearance-none accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {playingIndex !== null && blocks[playingIndex]?.audioUrl && (
        <audio
          autoPlay
          src={blocks[playingIndex].audioUrl}
          onEnded={handleAudioEnded}
          ref={(el) => {
            if (el) {
              if ((window as any)._activeAudio && (window as any)._activeAudio !== el) {
                (window as any)._activeAudio.pause();
              }
              (window as any)._activeAudio = el;
            }
          }}
          className="hidden"
        />
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <Library className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-xs font-mono">Waiting for text analysis...</p>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              speakers={speakers}
              engineUrl={engineUrl}
              onSpeakerChange={onSpeakerChange}
              onBlockParamChange={onBlockParamChange}
              onGenerate={onGenerateSingle}
            />
          ))
        )}
      </div>
    </div>
  );
}
