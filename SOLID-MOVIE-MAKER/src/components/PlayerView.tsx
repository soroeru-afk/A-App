import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize, Settings2 } from 'lucide-react';
import { VideoInfo, Language } from '../types';
import { t } from '../translations';

interface PlayerViewProps {
  video: VideoInfo | null;
  onClose: () => void;
  lang: Language;
}

export default function PlayerView({ video, onClose, lang }: PlayerViewProps) {
  const txt = t(lang).player;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  const [activeTextIndex, setActiveTextIndex] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
        const v = videoRef.current;
        v.load();
        v.play().catch(e => {
            console.log("Auto-play prevented or codec issue", e);
            setErrorMsg(txt.errorMsg);
        });
        
        const updateTracks = () => {
            // Audio tracks (Note: experimental feature in browsers, may be undefined)
            const aTracks = (v as any).audioTracks;
            if (aTracks) {
                const arr = [];
                for(let i=0; i<aTracks.length; i++) {
                    arr.push(aTracks[i]);
                    if (aTracks[i].enabled) setActiveAudioIndex(i);
                }
                setAudioTracks(arr);
            }
            
            // Text tracks
            const tTracks = v.textTracks;
            if (tTracks) {
                const arr = [];
                let activeIdx = -1;
                for(let i=0; i<tTracks.length; i++) {
                    arr.push(tTracks[i]);
                    if (tTracks[i].mode === 'showing') activeIdx = i;
                }
                setTextTracks(arr);
                setActiveTextIndex(activeIdx);
            }
        };

        v.addEventListener('loadedmetadata', updateTracks);
        return () => v.removeEventListener('loadedmetadata', updateTracks);
    }
  }, [video]);

  const selectAudioTrack = (index: number) => {
    if (videoRef.current && (videoRef.current as any).audioTracks) {
        const tracks = (videoRef.current as any).audioTracks;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].enabled = (i === index);
        }
        setActiveAudioIndex(index);
    }
  };

  const selectTextTrack = (index: number) => {
    if (videoRef.current && videoRef.current.textTracks) {
        const tracks = videoRef.current.textTracks;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = (i === index) ? 'showing' : 'hidden'; // hidden instead of disabled to keep it loaded
        }
        setActiveTextIndex(index);
    }
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
      <div className="w-full max-w-6xl bg-panel-bg border border-border-main flex flex-col shadow-2xl h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-main bg-accent-bg text-accent-text">
          <div className="flex items-center gap-2 truncate pr-4">
            <div className="text-sm font-bold truncate">{video.title}</div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-1 hover:text-text-dim transition-colors relative" 
                title="Tracks Settings"
            >
              <Settings2 size={16} />
              {(audioTracks.length > 1 || textTracks.length > 0) && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
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
                <div className="absolute top-8 right-16 w-64 bg-panel-bg border border-border-main shadow-lg rounded p-3 z-50 text-text-normal text-xs flex flex-col gap-3">
                    <div className="font-bold border-b border-border-main pb-1">{txt.tracksSetting}</div>
                    
                    {/* Audio */}
                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] text-text-dim">{txt.audioTrack}</div>
                        {audioTracks.length === 0 ? (
                            <div className="text-[10px] text-text-dim italic">{txt.notAvailable}</div>
                        ) : (
                            audioTracks.map((t, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => selectAudioTrack(idx)}
                                    className={`text-left px-2 py-1 rounded hover:bg-base-bg ${activeAudioIndex === idx ? 'bg-border-main font-bold text-text-bright' : ''}`}
                                >
                                    {t.language || `Track ${idx + 1}`} {t.label ? `(${t.label})` : ''}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Subtitles */}
                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] text-text-dim">{txt.textTrack}</div>
                        {textTracks.length === 0 ? (
                            <div className="text-[10px] text-text-dim italic">{txt.none}</div>
                        ) : (
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                                <button 
                                    onClick={() => selectTextTrack(-1)}
                                    className={`text-left px-2 py-1 rounded hover:bg-base-bg ${activeTextIndex === -1 ? 'bg-border-main font-bold text-text-bright' : ''}`}
                                >
                                    {txt.off}
                                </button>
                                {textTracks.map((t, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => selectTextTrack(idx)}
                                        className={`text-left px-2 py-1 rounded hover:bg-base-bg ${activeTextIndex === idx ? 'bg-border-main font-bold text-text-bright' : ''}`}
                                    >
                                        {t.label || t.language || `Subtitle ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-2" onClick={() => setShowSettings(false)}>
            <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-contain"
                controls
                crossOrigin="anonymous"
                controlsList="nodownload"
                onError={() => setErrorMsg(txt.loadFail)}
            >
                <p>{txt.notAvailable}</p>
            </video>
        </div>
      </div>
    </div>
  );
}
