'use client';

import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import { ImagePlus, Heart, Home, Clock } from 'lucide-react';
import Link from 'next/link';

export default function GalleryClient({ pageType = 'home' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('Semua'); // Default view

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
    if (!confirm('Hapus kenangan ini?')) return;
    
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
    // Jika type = story, tidak perlu masuk ke grid gallery kita
    if (newPhoto.type === 'story') {
       alert("Story berhasil dipublikasikan! Silakan buka halaman Story.");
       return;
    }
    setPhotos([newPhoto, ...photos]);
  };

  // Derive unique albums
  const uniqueAlbums = [...new Set(photos.filter(p => p.album).map(p => p.album))];
  const albumTabs = ['Semua', ...uniqueAlbums];

  // Filter based on pageType & Album
  const displayedPhotos = photos.filter(p => {
    if (pageType === 'favorites' && !p.isFavorite) return false;
    if (selectedAlbum !== 'Semua' && p.album !== selectedAlbum) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-2">
            {pageType === 'favorites' ? 'Our Favorites' : 'Infinite Memories'}
          </h1>
          <p className="text-brand-dark/70 text-lg">Every picture tells a story of us.</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/story" className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 via-red-400 to-brand-dark text-white rounded-full shadow-md hover:shadow-lg transition-transform hover:scale-105">
            <Clock size={18} />
            <span>Story 24 Jam</span>
          </Link>

          {pageType === 'home' ? (
            <Link href="/favorites" className="flex items-center gap-2 px-5 py-3 bg-white text-brand-dark rounded-full shadow-sm hover:shadow-md hover:bg-brand-light transition-all">
              <Heart size={18} />
              <span>Favorites</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 px-5 py-3 bg-white text-brand-dark rounded-full shadow-sm hover:shadow-md hover:bg-brand-light transition-all">
              <Home size={18} />
              <span>Home Gallery</span>
            </Link>
          )}

          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-full shadow-md hover:bg-opacity-90 transition-all hover:-translate-y-1"
          >
            <ImagePlus size={18} />
            <span>Upload Info</span>
          </button>
        </div>
      </div>

      {/* Album Navigation - Hide on Favorites to keep it simple, or keep it depending on preference. Keeping it is nice. */}
      {photos.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {albumTabs.map(album => (
            <button
              key={album}
              onClick={() => setSelectedAlbum(album)}
              className={`px-5 py-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ${
                selectedAlbum === album 
                  ? 'bg-brand-dark text-white shadow-md' 
                  : 'bg-white/60 text-brand-dark/70 hover:bg-white hover:text-brand-dark hover:shadow'
              }`}
            >
              {album}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
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
              <p>Belum ada memori di album ini.</p>
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
