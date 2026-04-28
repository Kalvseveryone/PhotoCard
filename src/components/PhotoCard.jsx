'use client';

import { Heart, Trash2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function PhotoCard({ photo, onLike, onDelete, onClick, currentUserId }) {
  // Extract album name gracefully
  const albumName = photo.albumId && photo.albumId.name ? photo.albumId.name : (photo.album || null);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in flex flex-col h-full">
      <div 
        className="relative overflow-hidden bg-gray-50 flex justify-center aspect-[4/5] cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={photo.url} 
          alt={photo.caption || 'Memory'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {photo.userId !== currentUserId && (
          <button 
            onClick={(e) => { e.stopPropagation(); onLike(photo._id); }}
            className={`p-2 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 ${photo.isLiked ? 'bg-black text-red-500' : 'bg-white/90 text-gray-600 hover:text-black'}`}
            title="Like"
          >
            <Heart size={16} className={photo.isLiked ? 'fill-current animate-heartbeat' : ''} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(photo._id); }}
          className="p-2 rounded-full bg-white/90 text-gray-600 shadow-md hover:bg-red-50 hover:text-red-600 transition-all hover:scale-110 active:scale-95"
          title="Hapus Memo"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {(photo.caption || albumName || photo.createdAt) && (
        <div className="p-3 sm:p-4 bg-white border-t border-gray-50 flex-grow flex flex-col items-start min-h-[85px]">
          {albumName && (
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded mb-1.5 line-clamp-1">
              {albumName}
            </span>
          )}
          {photo.caption && (
            <p className="text-black text-xs sm:text-sm leading-relaxed mb-1.5 line-clamp-2 w-full">{photo.caption}</p>
          )}
          <div className="mt-auto pt-2 w-full border-t border-gray-50 flex flex-col gap-2">
            <button 
              onClick={onClick}
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors py-1"
            >
              <MessageCircle size={12} />
              Lihat Komentar
            </button>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-medium z-20">
                {photo.username && photo.userId ? (
                  <>By <Link href={`/profile/${photo.userId}`} className="hover:text-blue-600 hover:underline transition-colors">{photo.username}</Link></>
                ) : photo.username ? (
                  `By ${photo.username}`
                ) : ''}
              </span>
              <p className="text-[10px] text-gray-400">
                {new Date(photo.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
