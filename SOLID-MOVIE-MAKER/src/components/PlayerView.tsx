import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize, Settings2, Subtitles, UploadCloud, AlertCircle, Volume2, Sparkles, Clock } from 'lucide-react';
import { VideoInfo, Language } from '../types';
import { t } from '../translations';
import { parseSrtOrVtt, ParsedSubtitleCue } from '../utils/subtitleParser';
import { demuxMkvSubtitles, SubtitleCue } from '../utils/mkvDemuxer';
import { VideoAudioEngine } from '../utils/audioEngine';

interface PlayerViewProps {
  video: VideoInfo | null;
  onClose: () => void;
  lang: Language;
}

interface CustomSubtitleTrack {
  id: string;
  name: string;
  cues: (ParsedSubtitleCue | SubtitleCue)[];
}

export default function PlayerView({ video, onClose, lang }: PlayerViewProps) {
  const txt = t(lang).player;
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const audioEngineRef = useRef<VideoAudioEngine | null>(null);
  
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [nativeTextTracks, setNativeTextTracks] = useState<any[]>([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  const [activeNativeTextIndex, setActiveNativeTextIndex] = useState<number>(-1);

  // Custom parsed subtitle tracks
  const [customTracks, setCustomTracks] = useState<CustomSubtitleTrack[]>([]);
  const [activeCustomTrackIndex, setActiveCustomTrackIndex] = useState<number>(-1);
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>('');
  
  // MKV specific states
  const [isScanningMkv, setIsScanningMkv] = useState(false);
  const [mkvScanProgress, setMkvScanProgress] = useState(0);
  const [hasAc3, setHasAc3] = useState(false);
  const [audioBoost, setAudioBoost] = useState<number>(1.5);
  const [subtitleOffset, setSubtitleOffset] = useState<number>(0); // in seconds
  const [subtitleFontSize, setSubtitleFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Initialize Audio Booster Pipeline
  useEffect(() => {
    audioEngineRef.current = new VideoAudioEngine();
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Reset states and parse on video change
  useEffect(() => {
    if (!video) return;

    setErrorMsg(null);
    setInfoNotice(null);
    setCurrentSubtitleText('');
    setCustomTracks([]);
    setActiveCustomTrackIndex(-1);
    setHasAc3(false);
    setSubtitleOffset(0);

    if (videoRef.current) {
      const v = videoRef.current;
      v.load();

      const handlePlay = () => {
        if (audioEngineRef.current && videoRef.current) {
          audioEngineRef.current.init(videoRef.current);
          audioEngineRef.current.resume();
        }
      };

      v.addEventListener('play', handlePlay);

      v.play().catch(e => {
        console.log("Auto-play prevented or codec issue", e);
      });
      
      const updateTracks = () => {
        // Audio tracks
        const aTracks = (v as any).audioTracks;
        if (aTracks) {
          const arr = [];
          for (let i = 0; i < aTracks.length; i++) {
            arr.push(aTracks[i]);
            if (aTracks[i].enabled) setActiveAudioIndex(i);
          }
          setAudioTracks(arr);
        }
        
        // Native Text tracks
        const tTracks = v.textTracks;
        if (tTracks) {
          const arr = [];
          let activeIdx = -1;
          for (let i = 0; i < tTracks.length; i++) {
            arr.push(tTracks[i]);
            if (tTracks[i].mode === 'showing') activeIdx = i;
          }
          setNativeTextTracks(arr);
          setActiveNativeTextIndex(activeIdx);
        }
      };

      v.addEventListener('loadedmetadata', updateTracks);

      // Deep scan MKV file for embedded subtitles and AC3 audio
      const isMkv = video.originalName.toLowerCase().endsWith('.mkv') || video.originalName.toLowerCase().endsWith('.webm');
      if (isMkv) {
        setIsScanningMkv(true);
        setMkvScanProgress(0);

        const getBlob = async (): Promise<Blob> => {
          if (video.file && typeof (video.file as any).slice === 'function') {
            return video.file;
          }
          const resp = await fetch(video.url);
          return await resp.blob();
        };

        getBlob().then(blob => {
          return demuxMkvSubtitles(blob, (progress) => {
            setMkvScanProgress(progress);
          });
        }).then(result => {
          setIsScanningMkv(false);
          if (result.hasAc3) {
            setHasAc3(true);
          }

          if (result.subtitleTracks.length > 0 && result.subtitleTracks[0].cues.length > 0) {
            const parsedList: CustomSubtitleTrack[] = result.subtitleTracks.map((tr, idx) => ({
              id: `mkv_sub_${tr.trackNumber}_${idx}`,
              name: tr.name.toUpperCase(),
              cues: tr.cues
            }));

            setCustomTracks(parsedList);
            setActiveCustomTrackIndex(0);

            setInfoNotice(`${result.subtitleTracks[0].cues.length} CUES LOADED`);
            setTimeout(() => setInfoNotice(null), 4000);
          }
        }).catch(err => {
          console.warn('MKV Demuxing failed:', err);
          setIsScanningMkv(false);
        });
      }

      return () => {
        v.removeEventListener('loadedmetadata', updateTracks);
        v.removeEventListener('play', handlePlay);
      };
    }
  }, [video]);

  // Synchronize subtitle cues with video playback position & manual offset
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTimeUpdate = () => {
      if (activeCustomTrackIndex < 0 || !customTracks[activeCustomTrackIndex]) {
        setCurrentSubtitleText('');
        return;
      }

      const currentTime = v.currentTime + subtitleOffset;
      const cues = customTracks[activeCustomTrackIndex].cues;
      // Search cue matching currentTime
      const activeCue = cues.find(c => currentTime >= c.start && currentTime <= c.end);

      setCurrentSubtitleText(activeCue ? activeCue.text : '');
    };

    v.addEventListener('timeupdate', handleTimeUpdate);
    return () => v.removeEventListener('timeupdate', handleTimeUpdate);
  }, [activeCustomTrackIndex, customTracks, subtitleOffset]);

  const selectAudioTrack = (index: number) => {
    if (videoRef.current && (videoRef.current as any).audioTracks) {
      const tracks = (videoRef.current as any).audioTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].enabled = (i === index);
      }
      setActiveAudioIndex(index);
    }
  };

  const selectNativeTextTrack = (index: number) => {
    if (videoRef.current && videoRef.current.textTracks) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = (i === index) ? 'showing' : 'hidden';
      }
      setActiveNativeTextIndex(index);
      if (index >= 0) {
        setActiveCustomTrackIndex(-1);
      }
    }
  };

  const selectCustomTrack = (index: number) => {
    setActiveCustomTrackIndex(index);
    if (index >= 0 && videoRef.current && videoRef.current.textTracks) {
      // Turn off native tracks to avoid overlapping
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden';
      }
      setActiveNativeTextIndex(-1);
    }
  };

  const handleAudioBoostChange = (val: number) => {
    setAudioBoost(val);
    audioEngineRef.current?.setBoost(val);
  };

  const handleSubtitleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const cues = parseSrtOrVtt(text);
        if (cues.length === 0) {
          setInfoNotice(txt.subtitleFailed);
          setTimeout(() => setInfoNotice(null), 3500);
          return;
        }

        const newTrack: CustomSubtitleTrack = {
          id: `custom_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
          cues
        };

        setCustomTracks(prev => [...prev, newTrack]);
        setActiveCustomTrackIndex(customTracks.length);
        setInfoNotice(`${txt.subtitleLoaded}: ${file.name}`);
        setTimeout(() => setInfoNotice(null), 3500);
      } catch (err) {
        setInfoNotice(txt.subtitleFailed);
        setTimeout(() => setInfoNotice(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 bg-base-bg/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-panel-bg border border-border-main flex flex-col shadow-2xl h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-main bg-accent-bg text-accent-text">
          <div className="flex items-center gap-2 truncate pr-4">
            <div className="text-sm font-bold truncate tracking-wide">{video.title}</div>
            {video.originalName.toLowerCase().endsWith('.mkv') && (
              <span className="text-[10px] px-1.5 py-0.5 bg-border-main text-text-bright rounded font-mono">MKV</span>
            )}
            {hasAc3 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-600/30 text-amber-300 border border-amber-600/50 rounded font-mono" title={txt.ac3Detected}>
                AC-3
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 relative">
            {/* Quick subtitle upload button */}
            <button
              onClick={() => subtitleInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2 py-1 bg-border-main hover:bg-border-light text-text-bright text-[11px] rounded transition-colors"
              title={txt.loadSubtitle}
            >
              <Subtitles size={14} />
              <span className="hidden sm:inline">{txt.loadSubtitle}</span>
            </button>
            <input 
              type="file" 
              ref={subtitleInputRef} 
              accept=".srt,.vtt,.ass,.txt" 
              className="hidden" 
              onChange={handleSubtitleFileUpload} 
            />

            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="p-1 hover:text-text-dim transition-colors relative" 
              title={txt.tracksSetting}
            >
              <Settings2 size={16} />
              {(audioTracks.length > 1 || nativeTextTracks.length > 0 || customTracks.length > 0) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            <button onClick={toggleFullscreen} className="p-1 hover:text-text-dim transition-colors" title="Fullscreen">
              <Maximize size={16} />
            </button>
            <button onClick={onClose} className="p-1 hover:text-red-400 transition-colors">
              <X size={20} />
            </button>

            {/* Track Settings Dropdown */}
            {showSettings && (
              <div className="absolute top-9 right-16 w-84 bg-panel-bg border border-border-main shadow-2xl rounded p-3.5 z-50 text-text-normal text-xs flex flex-col gap-3">
                <div className="font-bold border-b border-border-main pb-1.5 flex justify-between items-center">
                  <span>{txt.tracksSetting}</span>
                </div>

                {/* Cinema Audio Boost */}
                <div className="flex flex-col gap-1.5 bg-base-bg/60 p-2 rounded border border-border-main/50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Volume2 size={13} className="text-blue-400" />
                      {txt.audioBooster}
                    </span>
                    <span className="font-mono text-text-bright font-bold">{Math.round(audioBoost * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3.5"
                    step="0.1"
                    value={audioBoost}
                    onChange={(e) => handleAudioBoostChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-border-main rounded"
                  />
                  {hasAc3 && (
                    <div className="text-[10px] text-amber-400/90 leading-tight">
                      {txt.ac3Detected}
                    </div>
                  )}
                </div>

                {/* Subtitle Sync Offset & Size */}
                {customTracks.length > 0 && activeCustomTrackIndex >= 0 && (
                  <div className="flex flex-col gap-2 bg-base-bg/60 p-2 rounded border border-border-main/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock size={13} className="text-emerald-400" />
                        {txt.subtitleSync}
                      </span>
                      <span className="font-mono text-text-bright">
                        {subtitleOffset >= 0 ? `+${subtitleOffset.toFixed(1)}s` : `${subtitleOffset.toFixed(1)}s`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSubtitleOffset(prev => prev - 0.5)}
                        className="flex-1 py-0.5 bg-border-main hover:bg-border-light text-text-bright rounded text-[10px] font-mono"
                      >
                        -0.5s
                      </button>
                      <button
                        onClick={() => setSubtitleOffset(0)}
                        className="px-2 py-0.5 bg-border-main hover:bg-border-light text-text-bright rounded text-[10px]"
                      >
                        RESET
                      </button>
                      <button
                        onClick={() => setSubtitleOffset(prev => prev + 0.5)}
                        className="flex-1 py-0.5 bg-border-main hover:bg-border-light text-text-bright rounded text-[10px] font-mono"
                      >
                        +0.5s
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border-main/40">
                      <span className="text-[10px] text-text-dim">{txt.subtitleSize}</span>
                      <div className="flex items-center gap-1">
                        {(['normal', 'large', 'huge'] as const).map(size => (
                          <button
                            key={size}
                            onClick={() => setSubtitleFontSize(size)}
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${subtitleFontSize === size ? 'bg-blue-600 text-white font-bold' : 'bg-border-main text-text-dim'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Audio Tracks */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-text-dim uppercase tracking-wider">{txt.audioTrack}</div>
                  {audioTracks.length === 0 ? (
                    <div className="text-[10px] text-text-dim italic">{txt.notAvailable}</div>
                  ) : (
                    audioTracks.map((t, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectAudioTrack(idx)}
                        className={`text-left px-2 py-1 rounded hover:bg-base-bg ${activeAudioIndex === idx ? 'bg-border-main font-bold text-text-bright' : ''}`}
                      >
                        {t.language || `TRACK ${idx + 1}`} {t.label ? `(${t.label})` : ''}
                      </button>
                    ))
                  )}
                </div>

                {/* Subtitles (Embedded MKV + Native + Custom) */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-text-dim uppercase tracking-wider flex justify-between items-center">
                    <span>{txt.textTrack}</span>
                    {customTracks.length > 0 && (
                      <span className="text-blue-400 font-mono text-[9px]">{customTracks.length} TRACKS</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-0.5">
                    <button 
                      onClick={() => {
                        selectNativeTextTrack(-1);
                        selectCustomTrack(-1);
                      }}
                      className={`text-left px-2 py-1 rounded hover:bg-base-bg ${activeNativeTextIndex === -1 && activeCustomTrackIndex === -1 ? 'bg-border-main font-bold text-text-bright' : ''}`}
                    >
                      {txt.off}
                    </button>

                    {/* Embedded MKV & custom parsed tracks */}
                    {customTracks.map((tr, idx) => (
                      <button
                        key={tr.id}
                        onClick={() => selectCustomTrack(idx)}
                        className={`text-left px-2 py-1 rounded hover:bg-base-bg truncate flex items-center justify-between ${activeCustomTrackIndex === idx ? 'bg-border-main font-bold text-text-bright' : ''}`}
                      >
                        <span className="truncate">{tr.name}</span>
                        <span className="text-[9px] px-1 bg-blue-900/60 text-blue-200 border border-blue-700/50 rounded ml-1 font-mono">
                          {tr.cues.length > 0 ? `${tr.cues.length} CUES` : 'MKV'}
                        </span>
                      </button>
                    ))}

                    {/* Native browser tracks */}
                    {nativeTextTracks.map((t, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectNativeTextTrack(idx)}
                        className={`text-left px-2 py-1 rounded hover:bg-base-bg truncate ${activeNativeTextIndex === idx ? 'bg-border-main font-bold text-text-bright' : ''}`}
                      >
                        {t.label || t.language || `SUBTITLE ${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {/* Quick file load within settings */}
                  <button
                    onClick={() => subtitleInputRef.current?.click()}
                    className="mt-1.5 flex items-center justify-center gap-1 py-1 px-2 border border-border-main hover:bg-base-bg text-[10px] text-text-dim rounded transition-colors"
                  >
                    <UploadCloud size={12} />
                    <span>{txt.loadSubtitle}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player Canvas Area */}
        <div 
          className="flex-1 bg-black relative flex items-center justify-center p-2 overflow-hidden select-none" 
          onClick={() => setShowSettings(false)}
        >
          {/* Scanning indicator */}
          {isScanningMkv && (
            <div className="absolute top-4 left-4 z-40 bg-base-bg/85 border border-border-main text-text-normal text-xs py-1.5 px-3 rounded shadow flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400 animate-spin" />
              <span>{txt.mkvScanning} {mkvScanProgress}%</span>
            </div>
          )}

          {errorMsg && (
            <div className="absolute top-4 left-4 right-4 z-40 bg-red-950/80 border border-red-700 text-red-200 text-xs p-3 rounded flex items-start gap-2 shadow-lg">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {infoNotice && (
            <div className="absolute top-4 z-40 bg-blue-950/80 border border-blue-600 text-blue-200 text-xs py-1.5 px-4 rounded shadow-lg animate-fade-in">
              {infoNotice}
            </div>
          )}

          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain relative z-10"
            controls
            crossOrigin="anonymous"
            controlsList="nodownload"
            onError={() => setErrorMsg(txt.loadFail)}
          >
            <p>{txt.notAvailable}</p>
          </video>

          {/* Subtitle Display Overlay Layer */}
          {currentSubtitleText && (
            <div className="absolute bottom-16 inset-x-8 z-30 pointer-events-none flex justify-center text-center">
              <div 
                className={`inline-block px-4 py-2 rounded bg-black/75 text-white font-medium tracking-wide leading-relaxed shadow-2xl max-w-4xl border border-white/10 ${
                  subtitleFontSize === 'normal' ? 'text-base md:text-xl' :
                  subtitleFontSize === 'large' ? 'text-lg md:text-2xl' :
                  'text-xl md:text-3xl'
                }`}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 3px #000, 1.5px 1.5px 2px #000, -1.5px -1.5px 2px #000',
                  whiteSpace: 'pre-line'
                }}
              >
                {currentSubtitleText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
