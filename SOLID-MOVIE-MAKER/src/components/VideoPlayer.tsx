import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Square, MessageSquare, Maximize } from 'lucide-react';
import { VideoInfo } from '../types';

interface VideoPlayerProps {
  video: VideoInfo | null;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  
  useEffect(() => {
    // Reset state when video changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setSubtitlesEnabled(false);
    
    if (videoRef.current) {
        // We load the video and play if necessary
        videoRef.current.load();
    }
  }, [video]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleSubtitles = () => {
    if (videoRef.current) {
      const textTracks = videoRef.current.textTracks;
      let hasSubtitles = false;
      
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].kind === 'subtitles' || textTracks[i].kind === 'captions') {
            hasSubtitles = true;
            textTracks[i].mode = !subtitlesEnabled ? 'showing' : 'hidden';
        }
      }
      
      // If no text tracks but we toggle, just update the UI state
      setSubtitlesEnabled(!subtitlesEnabled);
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

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!video) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-text-dim border-l border-border-main">
        <div className="text-center">
          <div className="text-4xl mb-4">NO VIDEO SELECTED</div>
          <p>Please select a video from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black border-l border-border-main relative">
      <div className="absolute top-4 left-4 z-10 bg-black/60 px-3 py-1 text-sm font-bold text-white border border-border-light">
        {video.title}
      </div>
      
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        >
          <p>Your browser doesn't support HTML video.</p>
        </video>
        
        {/* Mock subtitle overlay if enabled and no real text track is present */}
        {subtitlesEnabled && (
             <div className="absolute bottom-16 w-full text-center pointer-events-none">
                 <span className="bg-black/80 text-white px-2 py-1 text-lg">
                    (Subtitle track enabled - waiting for data)
                 </span>
             </div>
        )}
      </div>

      <div className="bg-panel-bg border-t border-border-main p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dim w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-text-dim w-12">{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-border-main hover:bg-border-light text-text-bright transition-colors"
                title="Play/Pause"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
            </button>
            <button 
                onClick={handleStop}
                className="w-10 h-10 flex items-center justify-center bg-border-main hover:bg-border-light text-text-bright transition-colors"
                title="Stop"
            >
              <Square size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={toggleSubtitles}
                className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors border ${
                    subtitlesEnabled 
                    ? 'bg-text-bright text-panel-bg border-text-bright' 
                    : 'bg-panel-bg text-text-normal border-border-main hover:bg-border-main'
                }`}
            >
                <MessageSquare size={16} />
                <span>CC</span>
            </button>
            <button 
                onClick={toggleFullscreen}
                className="w-10 h-10 flex items-center justify-center bg-border-main hover:bg-border-light text-text-bright transition-colors"
                title="Fullscreen"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
