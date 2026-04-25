'use client';

import { useState, useEffect, useRef } from 'react';
import PhotoCard from './PhotoCard';
import UploadModal from './UploadModal';
import Link from 'next/link';
import { ImagePlus, ZoomIn, ZoomOut, X, Trash2, ChevronLeft, ChevronRight, Download, MessageSquare, Send, User } from 'lucide-react';

// Helper function for relative time formatting
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  
  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, 'day');
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');
  return rtf.format(-Math.floor(diffInMonths / 12), 'year');
}

export default function GalleryClient({ pageType = 'home' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('Semua'); 
  const [zoomLevel, setZoomLevel] = useState(3);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [isCommentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    setUserToken(localStorage.getItem('token'));
  }, []);

  // Auto scroll to bottom of comments
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Fetch comments when active photo changes
  useEffect(() => {
    if (activePhotoIndex !== null && displayedPhotos[activePhotoIndex]) {
      setIsCommentsExpanded(false); // Reset posisi komentar saat ganti foto
      const fetchComments = async () => {
        setCommentsLoading(true);
        try {
          const res = await fetch(`/api/comments/${displayedPhotos[activePhotoIndex]._id}`);
          const data = await res.json();
          if (data.success) {
            setComments(data.comments);
          }
        } catch (error) {
          console.error("Gagal mengambil komentar", error);
        } finally {
          setCommentsLoading(false);
        }
      };
      fetchComments();
    } else {
      setComments([]);
      setCommentText('');
    }
  }, [activePhotoIndex]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    const photoId = displayedPhotos[activePhotoIndex]._id;
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          photoId,
          text: commentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentText('');
      } else {
         alert(data.error || 'Gagal mengirim komentar');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim komentar');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Set initial zoom based on screen size
  useEffect(() => {
    if (window.innerWidth < 640) {
      setZoomLevel(2);
    } else if (window.innerWidth < 1024) {
      setZoomLevel(3);
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
            onClick={() => {
              if (!userToken) {
                window.location.href = '/login';
              } else {
                setUploadModalOpen(true);
              }
            }}
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
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm md:p-6 lg:p-10">
          
          {/* Main Modal Container */}
          <div className="relative w-full h-full max-w-7xl flex flex-col md:flex-row bg-gray-900 md:rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Header Actions - Floating over photo area */}
            <div className="absolute top-4 left-0 w-full md:w-[calc(100%-350px)] lg:w-[calc(100%-400px)] px-4 sm:px-6 flex justify-between items-start z-50 pointer-events-none">
              <div className="text-left bg-black/40 backdrop-blur px-4 py-2 rounded-lg border border-white/10 shadow-lg max-w-[60%] pointer-events-auto">
                <p className="text-white font-bold text-sm tracking-wide uppercase line-clamp-1">
                  {displayedPhotos[activePhotoIndex].albumId?.name || displayedPhotos[activePhotoIndex].album || 'Gallery'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 pointer-events-auto">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(displayedPhotos[activePhotoIndex].url, displayedPhotos[activePhotoIndex].caption);
                  }} 
                  className="p-3 text-white/70 hover:text-green-400 transition-colors bg-black/40 hover:bg-black/60 rounded-full border border-white/5 backdrop-blur-sm shadow-xl"
                  title="Download"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(displayedPhotos[activePhotoIndex]._id);
                  }} 
                  className="p-3 text-white/70 hover:text-red-400 transition-colors bg-black/40 hover:bg-black/60 rounded-full border border-white/5 backdrop-blur-sm shadow-xl"
                  title="Hapus"
                >
                  <Trash2 size={20} />
                </button>
                {/* Mobile close button (hides on md and up) */}
                <button 
                  onClick={() => setActivePhotoIndex(null)} 
                  className="p-3 text-white hover:text-black transition-colors bg-black/40 hover:bg-white rounded-full border border-white/10 backdrop-blur-sm shadow-xl md:hidden"
                  title="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* LEFT / TOP: Photo View */}
            <div className="flex-1 flex flex-col items-center justify-center relative bg-black p-4 group" onClick={() => setActivePhotoIndex(null)}>
              {/* Desktop Nav Buttons */}
              {activePhotoIndex > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex - 1); }}
                  className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/80 border border-white/10 transition-all z-50 backdrop-blur-md shadow-2xl opacity-100 md:opacity-0 group-hover:opacity-100"
                >
                   <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {activePhotoIndex < displayedPhotos.length - 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setActivePhotoIndex(activePhotoIndex + 1); }}
                  className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/80 border border-white/10 transition-all z-50 backdrop-blur-md shadow-2xl opacity-100 md:opacity-0 group-hover:opacity-100"
                >
                   <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Image */}
              <div className="relative w-full h-[60vh] md:h-full flex items-center justify-center mt-16 md:mt-0 px-2 sm:px-12">
                <img 
                  src={displayedPhotos[activePhotoIndex].url} 
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl" 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>

              {/* Caption Overlay */}
              {displayedPhotos[activePhotoIndex].caption && (
                 <div className="absolute bottom-6 md:bottom-10 w-full px-6 flex justify-center z-40 pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white text-center sm:max-w-xl shadow-2xl pointer-events-auto">
                      <p className="text-sm font-medium leading-relaxed">{displayedPhotos[activePhotoIndex].caption}</p>
                    </div>
                 </div>
              )}
            </div>

            {/* RIGHT / BOTTOM: Comments Section */}
            <div className={`w-full md:w-[350px] lg:w-[400px] ${isCommentsExpanded ? 'h-[80vh]' : 'h-[40vh]'} md:h-full bg-white flex flex-col border-t md:border-t-0 md:border-l border-gray-100 relative z-50 rounded-t-3xl md:rounded-none mt-[-20px] md:mt-0 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-none`}>
               
               {/* Mobile Drag Handle */}
               <div 
                 className="w-full pt-3 pb-1 flex justify-center md:hidden cursor-pointer shrink-0"
                 onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
               >
                 <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
               </div>

               {/* IG Style Post Author Header */}
               <div className="px-4 pb-4 pt-2 md:pt-4 md:pb-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 md:rounded-tr-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                     <User size={14} className="text-gray-500" />
                   </div>
                   <div className="flex flex-col">
                     {displayedPhotos[activePhotoIndex].username && displayedPhotos[activePhotoIndex].userId ? (
                       <Link href={`/profile/${displayedPhotos[activePhotoIndex].userId}`} className="font-bold text-sm text-black hover:underline hover:text-blue-600 transition-colors">
                         {displayedPhotos[activePhotoIndex].username}
                       </Link>
                     ) : (
                       <span className="font-bold text-sm text-black">{displayedPhotos[activePhotoIndex].username || 'User'}</span>
                     )}
                     <span className="text-[10px] text-gray-400">
                       {new Date(displayedPhotos[activePhotoIndex].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </span>
                   </div>
                 </div>
                 
                 {/* Desktop close button */}
                 <button 
                   onClick={() => setActivePhotoIndex(null)} 
                   className="hidden md:flex p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                   title="Tutup"
                 >
                   <X size={20} />
                 </button>
               </div>

               {/* Comments Header */}
               <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
                 <MessageSquare size={14} className="text-gray-500" />
                 <h3 className="font-bold text-xs text-gray-600">Komentar ({comments.length})</h3>
               </div>

               {/* Comments List */}
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {isCommentsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-pulse flex space-x-2 items-center">
                         <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                      <MessageSquare size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">Belum ada komentar.</p>
                      <p className="text-xs opacity-70">Jadilah yang pertama berkomentar!</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment._id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 animate-fade-in flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                           <User size={14} className="text-gray-500" />
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                             <span className="font-bold text-xs text-gray-800">{comment.username}</span>
                             <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                           </div>
                           <p className="text-sm text-gray-600 break-words leading-relaxed">{comment.text}</p>
                         </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
               </div>

               {/* Comment Form */}
               <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe md:pb-4">
                 {userToken ? (
                   <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                     <div className="relative">
                       <textarea
                         placeholder="Tambahkan komentar..."
                         value={commentText}
                         onChange={(e) => setCommentText(e.target.value)}
                         onFocus={() => { if(window.innerWidth < 768) setIsCommentsExpanded(true); }}
                         className="w-full text-[16px] md:text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 pr-12 outline-none focus:border-black focus:bg-white transition-all resize-none h-[80px]"
                         maxLength={200}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSubmitComment(e);
                           }
                         }}
                       />
                       <button 
                         type="submit"
                         disabled={!commentText.trim() || isSubmittingComment}
                         className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
                       >
                         {isSubmittingComment ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <Send size={14} className="ml-px" />
                         )}
                       </button>
                     </div>
                   </form>
                 ) : (
                   <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                     <p className="text-xs text-gray-500 mb-2">Silakan masuk untuk memberikan komentar</p>
                     <button onClick={() => window.location.href = '/login'} className="text-xs font-bold bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:border-black transition-colors">
                       Masuk Sekarang
                     </button>
                   </div>
                 )}
               </div>
            </div>
            
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
