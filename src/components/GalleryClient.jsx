'use client';

import { useState, useEffect } from 'react';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import { ImagePlus, ZoomIn, ZoomOut, X, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function GalleryClient({ pageType = 'home' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('Semua'); 
  const [zoomLevel, setZoomLevel] = useState(3);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Set initial zoom based on screen size
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
    if (activePhotoIndex !== null) setActivePhotoIndex(null);

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

  const handleDownload = async (url, caption) => {
    try {
      // Create a filename based on caption or timestamp
      const filename = caption 
        ? caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() 
        : `KalUpdateApp_Memory_${Date.now()}`;
        
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Gagal mengunduh gambar:", err);
      alert("Maaf, terjadi kesalahan saat mencoba mengunduh gambar.");
    }
  };

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
                  ? 'bg-black text-white shadow-sm border border-black' 
                  : 'bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {album}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between xl:justify-end gap-3 shrink-0 w-full xl:w-auto">
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
              onClick={handleZoomIn} disabled={zoomLevel <= 1}
              className="p-1 sm:p-1.5 rounded text-gray-600 hover:bg-white hover:text-black hover:shadow-sm transition-all disabled:opacity-30"
              title="Perbesar"
            >
              <ZoomIn size={16} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-black border-x border-gray-200 mx-1">{zoomLevel}</span>
            <button 
              onClick={handleZoomOut} disabled={zoomLevel >= 5}
              className="p-1 sm:p-1.5 rounded text-gray-600 hover:bg-white hover:text-black hover:shadow-sm transition-all disabled:opacity-30"
              title="Perkecil"
            >
              <ZoomOut size={16} />
            </button>
          </div>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
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
              className="grid gap-3 sm:gap-4 transition-all duration-700 ease-in-out items-start" 
              style={{ gridTemplateColumns: `repeat(${zoomLevel}, minmax(0, 1fr))` }}
            >
              {displayedPhotos.map((photo, idx) => (
                <PhotoCard 
                  key={photo._id} 
                  photo={photo} 
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                  onClick={() => setActivePhotoIndex(idx)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* FULL SCREEN PHOTO MODAL */}
      {activePhotoIndex !== null && displayedPhotos[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
          {/* Header Actions */}
          <div className="absolute top-4 w-full px-4 sm:px-6 flex justify-between items-start z-50">
            <div className="text-left bg-black/40 backdrop-blur px-4 py-2 rounded-lg border border-white/10 shadow-lg max-w-[60%]">
              <p className="text-white font-bold text-sm tracking-wide uppercase">
                {displayedPhotos[activePhotoIndex].albumId?.name || displayedPhotos[activePhotoIndex].album || 'Gallery'}
              </p>
              <span className="text-[10px] text-gray-300 font-medium">
                {new Date(displayedPhotos[activePhotoIndex].createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(displayedPhotos[activePhotoIndex].url, displayedPhotos[activePhotoIndex].caption);
                }} 
                className="p-3 text-white/70 hover:text-green-400 transition-colors bg-white/10 hover:bg-white/20 rounded-full border border-white/5 backdrop-blur-sm shadow-xl"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(displayedPhotos[activePhotoIndex]._id);
                }} 
                className="p-3 text-white/70 hover:text-red-400 transition-colors bg-white/10 hover:bg-white/20 rounded-full border border-white/5 backdrop-blur-sm shadow-xl"
                title="Hapus"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={() => setActivePhotoIndex(null)} 
                className="p-3 text-white hover:text-black transition-colors bg-white/20 hover:bg-white rounded-full border border-white/10 backdrop-blur-sm shadow-xl"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav Buttons */}
          {activePhotoIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex - 1); }}
              className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/30 border border-white/10 transition-all z-50 backdrop-blur-md shadow-2xl"
            >
               <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {activePhotoIndex < displayedPhotos.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex + 1); }}
              className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-white/10 text-white hover:bg-white/30 border border-white/10 transition-all z-50 backdrop-blur-md shadow-2xl"
            >
               <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Photo View */}
          <div className="relative w-full h-[85vh] sm:h-[80vh] flex flex-col items-center justify-center mt-12 sm:mt-10 px-4 sm:px-16" onClick={() => setActivePhotoIndex(null)}>
            <img 
              src={displayedPhotos[activePhotoIndex].url} 
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            {displayedPhotos[activePhotoIndex].caption && (
               <div className="absolute bottom-6 sm:bottom-10 w-full px-6 flex justify-center z-50 pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white text-center sm:max-w-xl shadow-2xl">
                    <p className="text-sm font-medium leading-relaxed">{displayedPhotos[activePhotoIndex].caption}</p>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />
    </div>
  );
}
