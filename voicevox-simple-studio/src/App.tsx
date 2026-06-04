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

  // Global defaults for new blocks
  const [globalSpeed, setGlobalSpeed] = useState<number>(1.0);
  const [globalPitch, setGlobalPitch] = useState<number>(0.0);
  const [globalIntonation, setGlobalIntonation] = useState<number>(1.0);

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
    const lines = text
      .split(/(?<=[。、\n])/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newBlocks: TextBlock[] = lines.map((line) => ({
      id: crypto.randomUUID(),
      text: line,
      speakerId: speakers?.find((s) => s.styles.some((style) => style.id === DEFAULT_SPEAKER_ID))
        ? DEFAULT_SPEAKER_ID
        : speakers?.[0]?.styles?.[0]?.id ?? DEFAULT_SPEAKER_ID,
      status: 'idle',
      speedScale: globalSpeed,
      pitchScale: globalPitch,
      intonationScale: globalIntonation,
    }));

    setBlocks(newBlocks);
  };

  const handleSpeakerChange = (blockId: string, speakerId: number) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, speakerId } : b)));
  };

  const handleBlockParamChange = (
    blockId: string,
    param: 'speedScale' | 'pitchScale' | 'intonationScale',
    value: number
  ) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, [param]: value } : b)));
  };

  const handleGlobalSpeakerChange = (speakerId: number) => {
    setBlocks((prev) => prev.map((b) => ({ ...b, speakerId })));
  };

  const handleClearBlocks = () => {
    setBlocks([]);
  };

  const generateSingle = async (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, status: 'generating', errorMessage: undefined } : b))
    );

    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    try {
      const blob = await synthesizeAudio(targetBlock.text, targetBlock.speakerId, engineUrl, {
        speedScale: targetBlock.speedScale,
        pitchScale: targetBlock.pitchScale,
        intonationScale: targetBlock.intonationScale,
      });
      const url = URL.createObjectURL(blob);
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, status: 'done', audioBlob: blob, audioUrl: url } : b))
      );
    } catch (err) {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, status: 'error', errorMessage: String(err) } : b))
      );
    }
  };

  const handleGenerateAll = async () => {
    for (const block of blocks) {
      if (block.status !== 'done') {
        await generateSingle(block.id);
      }
    }
  };

  if (isLoadingSpeakers) {
    return (
      <div className="min-h-screen bg-[#121212] text-gray-400 flex flex-col items-center justify-center font-mono gap-4">
        <p className="animate-pulse tracking-widest text-xs">LOADING VOICEVOX ENGINE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans flex flex-col h-screen overflow-hidden">
      {/* Header / Error Banner */}
      <div className="flex flex-col border-b border-[#222]">
        {isApiError && (
          <div className="bg-red-950/20 text-red-400 px-4 py-2 text-xs text-center border-b border-red-900/30 font-mono">
            VOICEVOXエンジンに接続できません。VOICEVOXを起動しているか確認してください。
          </div>
        )}
        <div className="flex justify-between items-center px-6 py-3 bg-[#121212]">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold tracking-widest text-gray-400 uppercase font-mono">Voicevox Studio</h1>
            <span className="text-[10px] text-gray-600 font-mono">v1.2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-mono">API:</span>
            <input
              type="text"
              className="bg-[#1b1b1b] border border-[#2c2c2c] rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-600 transition-colors w-40 font-mono"
              value={engineUrlInput}
              onChange={(e) => setEngineUrlInput(e.target.value)}
              onBlur={() => setEngineUrl(engineUrlInput)}
              onKeyDown={(e) => e.key === 'Enter' && setEngineUrl(engineUrlInput)}
              placeholder="/api/voicevox"
            />
            {!isApiError && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Connected"></span>}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 min-w-[400px]">
          <EditorPanel text={text} setText={setText} onAnalyze={handleAnalyze} />
        </div>
        <div className="w-1/2 min-w-[400px]">
          <PreviewPanel
            blocks={blocks}
            speakers={speakers}
            engineUrl={engineUrl}
            globalSpeed={globalSpeed}
            setGlobalSpeed={setGlobalSpeed}
            globalPitch={globalPitch}
            setGlobalPitch={setGlobalPitch}
            globalIntonation={globalIntonation}
            setGlobalIntonation={setGlobalIntonation}
            onSpeakerChange={handleSpeakerChange}
            onBlockParamChange={handleBlockParamChange}
            onGlobalSpeakerChange={handleGlobalSpeakerChange}
            onGenerateSingle={generateSingle}
            onGenerateAll={handleGenerateAll}
            onClearBlocks={handleClearBlocks}
          />
        </div>
      </div>
    </div>
  );
}
