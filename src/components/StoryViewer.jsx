'use client';
import { useState, useEffect } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

function CountdownTimer({ expiredAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(expiredAt) - new Date();
      if (diff <= 0) {
        onExpire();
        return 'Expired';
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Habis dalam ${h} jam ${m} mnt`;
    };

    setTimeLeft(calculateTime());
    const intv = setInterval(() => setTimeLeft(calculateTime()), 60000); 
    return () => clearInterval(intv);
  }, [expiredAt, onExpire]);

  return <span className="text-xs px-3 py-1 bg-black/60 text-white rounded-full backdrop-blur-sm">{timeLeft}</span>;
}

export default function StoryViewer() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/story');
        const data = await res.json();
        if (data.success) {
          setStories(data.stories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus story ini sekarang?')) return;
    
    // optimistic
    setStories(stories.filter(s => s._id !== id));
    setActiveIndex(null); 

    try {
      await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const activeStory = activeIndex !== null ? stories[activeIndex] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 gap-4">
         <h1 className="text-3xl font-serif text-black flex items-center gap-3 font-bold">
           <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
           Our Stories (24 Jam)
         </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 font-mono text-sm tracking-widest uppercase animate-pulse">Memuat Stories...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-32 text-gray-400 text-sm uppercase tracking-widest font-medium">
           Belum ada Story 24 Jam yang aktif saat ini.
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar items-start">
          {stories.map((story, idx) => (
            <div key={story._id} className="flex flex-col items-center gap-3 shrink-0 group">
              <button 
                onClick={() => setActiveIndex(idx)}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-gray-900 via-gray-600 to-black hover:scale-105 transition-transform shadow-md"
              >
                <img 
                  src={story.url} 
                  alt="Story thumbnail" 
                  className="w-full h-full object-cover rounded-full border-2 border-white"
                />
              </button>
              <CountdownTimer 
                expiredAt={story.expiredAt} 
                onExpire={() => setStories(prev => prev.filter(s => s._id !== story._id))} 
              />
            </div>
          ))}
        </div>
      )}

      {/* FULL SCREEN MODAL VIEW */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in">
          {/* Header Actions */}
          <div className="absolute top-4 w-full px-4 sm:px-6 flex justify-between items-center z-50">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={activeStory.url} className="w-10 h-10 rounded-full object-cover border border-white/50" />
              <div className="text-white">
                <p className="font-medium text-sm">Story Kita</p>
                <CountdownTimer expiredAt={activeStory.expiredAt} onExpire={() => setActiveIndex(null)} />
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => handleDelete(activeStory._id)} className="p-2 text-white/70 hover:text-red-400 transition-colors bg-black/30 rounded-full">
                <Trash2 size={20} />
              </button>
              <button onClick={() => setActiveIndex(null)} className="p-2 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Nav Buttons */}
          {activeIndex > 0 && (
            <button 
              onClick={() => setActiveIndex(activeIndex - 1)}
              className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all z-50"
            >
               <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {activeIndex < stories.length - 1 && (
            <button 
              onClick={() => setActiveIndex(activeIndex + 1)}
              className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all z-50"
            >
               <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Story Content */}
          <div className="relative max-w-lg w-full h-[85vh] sm:h-[80vh] bg-gray-900 rounded-xl sm:rounded-3xl overflow-hidden mt-10">
            <img src={activeStory.url} className="w-full h-full object-contain" />
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-lg font-serif text-center">{activeStory.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
