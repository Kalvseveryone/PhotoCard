'use client';

import { useState, useEffect } from 'react';
import { User, ImagePlus, ChevronLeft, ChevronRight, X, Trash2, MessageSquare, Download, MessageCircle } from 'lucide-react';
import PhotoCard from './PhotoCard';
import { useRouter } from 'next/navigation';

function TimeAgo({ createdAt }) {
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const calculate = () => {
      if (!createdAt) return '';
      const diff = new Date() - new Date(createdAt);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) return `${hours} jam lalu`;
      if (minutes > 0) return `${minutes} mnt lalu`;
      return 'Baru saja';
    };
    setTimeStr(calculate());
    const intv = setInterval(() => setTimeStr(calculate()), 60000);
    return () => clearInterval(intv);
  }, [createdAt]);
  return <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{timeStr}</span>;
}

export default function ProfileClient({ userId }) {
  const [userProfile, setUserProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);
  const router = useRouter();

  // Untuk Modal PhotoCard Viewer (bisa di-refactor jika perlu, disini pakai state sederhana)
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const headers = {};
        if (userId === 'me') {
          headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        const [userRes, photosRes, storiesRes] = await Promise.all([
          fetch(`/api/users/${userId}`, { headers }),
          fetch(`/api/users/${userId}/photos`, { headers }),
          fetch(`/api/users/${userId}/story`, { headers })
        ]);

        const userData = await userRes.json();
        const photosData = await photosRes.json();
        const storiesData = await storiesRes.json();

        if (userData.success) {
          setUserProfile(userData.user);
          setPhotos(photosData.photos || []);
          setStories(storiesData.stories || []);
        } else {
          setError(userData.error || 'User tidak ditemukan');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan koneksi');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleStartChat = async () => {
    setIsStartingChat(true);
    try {
      const res = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId: userId })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/chat?conversationId=${data.conversationId}`);
      } else {
        alert(data.error || 'Gagal memulai chat');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsStartingChat(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center py-32 text-gray-400 font-mono text-sm uppercase tracking-widest animate-pulse">Memuat Profil...</div>;
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <User size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">{error}</h2>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-black text-white rounded-lg font-bold text-sm">Kembali</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative min-h-screen">
      {/* HEADER PROFILE */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mb-4 bg-gray-50 flex items-center justify-center">
          {userProfile.profileImage ? (
            <img src={userProfile.profileImage} alt={userProfile.name || userProfile.username} className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-gray-400" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {userProfile.name || userProfile.username}
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">@{userProfile.username}</p>
        {userProfile.email && (
          <p className="text-xs text-gray-400 mt-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{userProfile.email}</p>
        )}
        
        {userId !== 'me' && (
          <button 
            onClick={handleStartChat}
            disabled={isStartingChat}
            className="mt-4 flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full font-bold text-sm shadow-md hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100"
          >
            {isStartingChat ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <MessageCircle size={16} />
                Mulai Chat
              </>
            )}
          </button>
        )}
      </div>

      {/* STORY SECTION */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Active Stories
        </h2>
        {stories.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">Belum ada story aktif.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {stories.map((story) => (
              <div key={story._id} className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-gray-900 via-gray-600 to-black hover:scale-105 transition-transform shadow-md cursor-pointer">
                  <img src={story.url} className="w-full h-full object-cover rounded-full border-2 border-white" />
                </div>
                <TimeAgo createdAt={story.createdAt} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PHOTO GALLERY SECTION */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Gallery ({photos.length})</h2>
        {photos.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <ImagePlus size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm">Belum ada foto yang diunggah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {photos.map((photo, idx) => (
              <PhotoCard 
                key={photo._id} 
                photo={photo} 
                onToggleFavorite={() => {}} // Disabled di profile view unless implemented
                onDelete={() => {}} // Disabled di profile view
                onClick={() => setActivePhotoIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SIMPLE PHOTO VIEWER MODAL */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
          <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
            <button onClick={() => setActivePhotoIndex(null)} className="p-3 text-white hover:text-black transition-colors bg-black/40 hover:bg-white rounded-full border border-white/10 backdrop-blur-sm">
              <X size={20} />
            </button>
          </div>
          {activePhotoIndex > 0 && (
            <button onClick={() => setActivePhotoIndex(activePhotoIndex - 1)} className="absolute left-4 p-3 rounded-full bg-black/40 text-white hover:bg-black/80 z-50">
              <ChevronLeft size={24} />
            </button>
          )}
          {activePhotoIndex < photos.length - 1 && (
            <button onClick={() => setActivePhotoIndex(activePhotoIndex + 1)} className="absolute right-4 p-3 rounded-full bg-black/40 text-white hover:bg-black/80 z-50">
              <ChevronRight size={24} />
            </button>
          )}
          <img src={photos[activePhotoIndex].url} className="max-w-full max-h-[85vh] object-contain rounded-md" />
          {photos[activePhotoIndex].caption && (
            <div className="absolute bottom-10 w-full px-6 flex justify-center z-40">
              <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white text-center sm:max-w-xl">
                <p className="text-sm font-medium">{photos[activePhotoIndex].caption}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
