'use client';
import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Keep it subtle
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log("Autoplay blocked or audio error:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <audio 
        ref={audioRef} 
        src="/bgm.mp3" 
        loop
      />
      
      <div className="relative group">
        {/* Pulsing ring animation when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-black/10 animate-ping duration-[3000ms]"></div>
        )}
        
        <button 
          onClick={togglePlay}
          className={`
            relative flex items-center justify-center w-14 h-14 
            rounded-full shadow-2xl transition-all duration-500
            backdrop-blur-md border border-white/20
            ${isPlaying 
              ? 'bg-black text-white scale-110' 
              : 'bg-white/80 text-black hover:bg-white hover:scale-105'}
            active:scale-90 group-hover:shadow-black/20
          `}
          aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <Pause size={24} className="animate-in zoom-in duration-300" />
          ) : (
            <Music size={24} className="animate-in zoom-in duration-300" />
          )}
          
          {/* Animated bars when playing */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 flex gap-0.5 h-4 items-end pb-1">
              <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]"></div>
              <div className="w-0.5 bg-white animate-[music-bar_1.2s_ease-in-out_infinite]"></div>
              <div className="w-0.5 bg-white animate-[music-bar_1.0s_ease-in-out_infinite]"></div>
            </div>
          )}
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-black/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0 shadow-xl whitespace-nowrap border border-white/10">
          {isPlaying ? 'Now Playing: Our Memories' : 'Play Background Music'}
        </div>
      </div>

      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
