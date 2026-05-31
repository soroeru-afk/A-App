import React, { useState, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { fetchSpeakers, synthesizeAudio } from './lib/voicevox';
import { Speaker, TextBlock } from './types';

// ずんだもん（ノーマル）のデフォルトID（通常は3）
const DEFAULT_SPEAKER_ID = 3; 

export default function App() {
  const [engineUrlInput, setEngineUrlInput] = useState('/api/voicevox');
  const [engineUrl, setEngineUrl] = useState('/api/voicevox');

  const [text, setText] = useState('');
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isApiError, setIsApiError] = useState(false);
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(true);

  useEffect(() => {
    // 話者一覧を取得
    const loadSpeakers = async () => {
      setIsLoadingSpeakers(true);
      try {
        const data = await fetchSpeakers(engineUrl);
        setSpeakers(data);
        setIsApiError(false);
      } catch (err) {
        console.error('Failed to load speakers', err);
        setIsApiError(true);
      } finally {
        setIsLoadingSpeakers(false);
      }
    };
    loadSpeakers();
  }, [engineUrl]);

  const handleAnalyze = () => {
    // 改行、句読点で分割。空文字は除外。
    const lines = text
      .split(/(?<=[。、\n])/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newBlocks: TextBlock[] = lines.map((line, index) => ({
      id: crypto.randomUUID(),
      text: line,
      // 話者リストがあればズンダモン(3)を優先、なければ先頭、そもそもなければDEFAULT_SPEAKER_ID
      speakerId: speakers?.find(s => s.styles.some(style => style.id === DEFAULT_SPEAKER_ID)) 
          ? DEFAULT_SPEAKER_ID 
          : (speakers?.[0]?.styles?.[0]?.id ?? DEFAULT_SPEAKER_ID),
      status: 'idle',
    }));

    setBlocks(newBlocks);
  };

  const handleSpeakerChange = (blockId: string, speakerId: number) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, speakerId } : b))
    );
  };

  const handleGlobalSpeakerChange = (speakerId: number) => {
    setBlocks((prev) =>
      prev.map((b) => ({ ...b, speakerId }))
    );
  };

  const generateSingle = async (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, status: 'generating', errorMessage: undefined } : b))
    );

    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    try {
      const blob = await synthesizeAudio(targetBlock.text, targetBlock.speakerId, engineUrl);
      const url = URL.createObjectURL(blob);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, status: 'done', audioBlob: blob, audioUrl: url }
            : b
        )
      );
    } catch (err) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, status: 'error', errorMessage: String(err) }
            : b
        )
      );
    }
  };

  const handleGenerateAll = async () => {
    // 順番に生成（並列で叩くとローカルPCに負荷がかかる可能性があるため直列）
    for (const block of blocks) {
      if (block.status !== 'done') {
        await generateSingle(block.id);
      }
    }
  };

  if (isLoadingSpeakers) {
    return (
      <div className="min-h-screen bg-[#111] text-gray-200 flex items-center justify-center">
        <p className="animate-pulse">Loading VOICEVOX Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 font-sans flex flex-col h-screen overflow-hidden">
      {/* Header / Error Banner */}
      <div className="flex flex-col border-b border-[#333]">
        {isApiError && (
          <div className="bg-red-900/50 text-red-200 px-4 py-2 text-xs md:text-sm text-center border-b border-red-800">
            VOICEVOXエンジンに接続できません。VOICEVOXを起動しているか、ポート指定が正しいか確認してください。<br className="hidden md:block" />
            <span className="text-red-300/80 text-xs">※クラウド上のプレビュー(https)からローカル(http)へアクセスするため、ブラウザにブロックされている可能性があります。「新しいタブ」で開くか、localhostに変更してみてください。</span>
          </div>
        )}
        <div className="flex justify-between items-center px-4 py-2 bg-[#1a1a1a]">
          <h1 className="text-sm font-semibold tracking-wide text-gray-300">Voicevox Simple Studio</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">API Endpoint:</span>
            <input
              type="text"
              className="bg-[#111] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-gray-500 transition-colors w-44"
              value={engineUrlInput}
              onChange={(e) => setEngineUrlInput(e.target.value)}
              onBlur={() => setEngineUrl(engineUrlInput)}
              onKeyDown={(e) => e.key === 'Enter' && setEngineUrl(engineUrlInput)}
              placeholder="http://127.0.0.1:50021"
            />
            {!isApiError && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 ml-2" title="Connected"></span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 min-w-[400px]">
          <EditorPanel
            text={text}
            setText={setText}
            onAnalyze={handleAnalyze}
          />
        </div>
        <div className="w-1/2 min-w-[400px]">
          <PreviewPanel
            blocks={blocks}
            speakers={speakers}
            onSpeakerChange={handleSpeakerChange}
            onGlobalSpeakerChange={handleGlobalSpeakerChange}
            onGenerateSingle={generateSingle}
            onGenerateAll={handleGenerateAll}
          />
        </div>
      </div>
    </div>
  );
}

