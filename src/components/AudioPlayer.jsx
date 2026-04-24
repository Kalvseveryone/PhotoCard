'use client';
import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Attempt autoplay if you want, but browsers block it unless muted or user interacts first
    // We just set volume
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // soft background volume
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-fade-in group">
      <audio 
        ref={audioRef} 
        src="/bgm.mp3" 
        loop
        autoPlay={false}
      />
      <button 
        onClick={togglePlay}
        className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg text-brand-dark hover:scale-110 active:scale-95 transition-all overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-brand-pink/20 rounded-full scale-0 group-hover:scale-100 transition-transform origin-center"></div>
        {isPlaying ? <Pause size={20} className="relative z-10" /> : <Music size={20} className="relative z-10" />}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-14 left-0 w-32 bg-white text-xs px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-brand-dark">
        {isPlaying ? 'Pause music' : 'Play our song'}
      </div>
    </div>
  );
}
