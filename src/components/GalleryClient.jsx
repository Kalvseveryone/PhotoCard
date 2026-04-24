'use client';

import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import { ImagePlus, ZoomIn, ZoomOut } from 'lucide-react';

export default function GalleryClient({ pageType = 'home' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('Semua'); 
  const [zoomLevel, setZoomLevel] = useState(3);

  // Set initial zoom based on screen size so mobile isn't clamped
  useEffect(() => {
    if (window.innerWidth < 640) {
      setZoomLevel(1);
    } else if (window.innerWidth < 1024) {
      setZoomLevel(2);
    }
  }, []);

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
    setPhotos(photos.map(p => p._id === id ? { ...p, isFavorite: !currentStatus } : p));
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus })
      });
    } catch (err) {
      setPhotos(photos.map(p => p._id === id ? { ...p, isFavorite: currentStatus } : p));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kenangan ini secara permanen?')) return;
    const prev = [...photos];
    setPhotos(photos.filter(p => p._id !== id));
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch (err) {
      setPhotos(prev);
    }
  };

  const handleUploadSuccess = (newPhoto) => {
    if (newPhoto.type === 'story') {
       alert("Story berhasil dipublikasikan! Silakan buka halaman Story.");
       return;
    }
    setPhotos([newPhoto, ...photos]);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.max(1, prev - 1));
  const handleZoomOut = () => setZoomLevel(prev => Math.min(5, prev + 1));

  const uniqueAlbums = [...new Set(photos.map(p => {
    if (p.albumId && p.albumId.name) return p.albumId.name;
    if (p.album) return p.album;
    return 'Tanpa Album';
  }))];
  
  const albumTabs = ['Semua', ...uniqueAlbums.filter(Boolean)];

  const displayedPhotos = photos.filter(p => {
    const pAlbumName = p.albumId && p.albumId.name ? p.albumId.name : (p.album || 'Tanpa Album');
    if (pageType === 'favorites' && !p.isFavorite) return false;
    if (selectedAlbum !== 'Semua' && pAlbumName !== selectedAlbum) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col xl:flex-row justify-between xl:items-end mb-6 gap-6 border-b border-gray-100 pb-4">
        {/* Album Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-2 xl:pb-0">
          {albumTabs.map(album => (
            <button
              key={album}
              onClick={() => setSelectedAlbum(album)}
              className={`px-4 py-2 whitespace-nowrap rounded-md text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                selectedAlbum === album 
                  ? 'bg-black text-white shadow-sm' 
                  : 'bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              {album}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between xl:justify-end gap-4 shrink-0 w-full xl:w-auto">
          <div className="flex items-center bg-gray-50 rounded-lg p-1.5 border border-gray-100">
            <button 
              onClick={handleZoomIn} disabled={zoomLevel <= 1}
              className="p-1 sm:p-1.5 rounded text-gray-500 hover:bg-white hover:text-black hover:shadow-sm transition-all disabled:opacity-30"
              title="Perbesar"
            >
              <ZoomIn size={16} />
            </button>
            <span className="w-6 sm:w-8 text-center text-xs font-bold text-black">{zoomLevel}</span>
            <button 
              onClick={handleZoomOut} disabled={zoomLevel >= 5}
              className="p-1 sm:p-1.5 rounded text-gray-500 hover:bg-white hover:text-black hover:shadow-sm transition-all disabled:opacity-30"
              title="Perkecil"
            >
              <ZoomOut size={16} />
            </button>
          </div>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-black text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors"
          >
            <ImagePlus size={16} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32 text-gray-400 font-mono text-xs sm:text-sm uppercase tracking-widest animate-pulse">
          Loading Data...
        </div>
      ) : (
        <>
          {displayedPhotos.length === 0 ? (
            <div className="text-center py-32 text-gray-400 font-medium">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
                <ImagePlus size={20} className="text-gray-300" />
              </div>
              <p className="text-xs sm:text-sm uppercase tracking-wide">No Photos Found</p>
            </div>
          ) : (
            <div 
              className="gap-4 space-y-4 transition-all duration-700 ease-in-out" 
              style={{ columnCount: zoomLevel }}
            >
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
