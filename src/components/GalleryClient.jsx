'use client';

import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import { ImagePlus, Heart, Home } from 'lucide-react';
import Link from 'next/link';

export default function GalleryClient({ pageType = 'home' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos');
        const data = await res.json();
        if (data.success) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const handleToggleFavorite = async (id, currentStatus) => {
    // optimistic update
    setPhotos(photos.map(p => p._id === id ? { ...p, isFavorite: !currentStatus } : p));

    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus })
      });
    } catch (err) {
      console.error(err);
      // fallback
      setPhotos(photos.map(p => p._id === id ? { ...p, isFavorite: currentStatus } : p));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    // optimistic
    const prev = [...photos];
    setPhotos(photos.filter(p => p._id !== id));
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch (err) {
      console.error(err);
      setPhotos(prev);
    }
  };

  const handleUploadSuccess = (newPhoto) => {
    setPhotos([newPhoto, ...photos]);
  };

  // Filter if we're on the favorites page
  const displayedPhotos = pageType === 'favorites' ? photos.filter(p => p.isFavorite) : photos;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section inside client to handle modal */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-2">
            {pageType === 'favorites' ? 'Our Favorites' : 'Our Infinite Memories'}
          </h1>
          <p className="text-brand-dark/70 text-lg">Every picture tells a story of us.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {pageType === 'home' ? (
            <Link href="/favorites" className="flex items-center gap-2 px-6 py-3 bg-white text-brand-dark rounded-full shadow-sm hover:shadow-md hover:bg-brand-light transition-all">
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-white text-brand-dark rounded-full shadow-sm hover:shadow-md hover:bg-brand-light transition-all">
              <Home size={18} />
              <span>Home</span>
            </Link>
          )}

          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full shadow-md hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95"
          >
            <ImagePlus size={18} />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Heart className="text-brand-pink animate-heartbeat" size={48} />
        </div>
      ) : (
        <>
          {displayedPhotos.length === 0 ? (
            <div className="text-center py-32 text-brand-dark/50 font-medium">
              <div className="bg-white/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                <ImagePlus size={32} />
              </div>
              <p>No memories found here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {displayedPhotos.map(photo => (
                <PhotoCard 
                  key={photo._id} 
                  photo={photo} 
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />
    </div>
  );
}
