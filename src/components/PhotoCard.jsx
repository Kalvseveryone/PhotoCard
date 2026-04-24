'use client';

import { Heart, Trash2 } from 'lucide-react';

export default function PhotoCard({ photo, onToggleFavorite, onDelete }) {
  // Extract album name gracefully
  const albumName = photo.albumId && photo.albumId.name ? photo.albumId.name : (photo.album || null);

  return (
    <div className="group relative bg-white border border-gray-100 rounded-sm mb-4 break-inside-avoid overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="relative overflow-hidden bg-gray-50 flex justify-center aspect-[4/5]">
        <img 
          src={photo.url} 
          alt={photo.caption || 'Memory'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onToggleFavorite(photo._id, photo.isFavorite)}
            className={`p-2 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 ${photo.isFavorite ? 'bg-black text-red-500' : 'bg-white/90 text-gray-600 hover:text-black'}`}
          >
            <Heart size={16} className={photo.isFavorite ? 'fill-current animate-heartbeat' : ''} />
          </button>
          <button 
            onClick={() => onDelete(photo._id)}
            className="p-2 rounded-full bg-white/90 text-gray-600 shadow-md hover:bg-red-50 hover:text-red-600 transition-all hover:scale-110 active:scale-95"
            title="Hapus Memo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {(photo.caption || albumName || photo.createdAt) && (
        <div className="p-4 bg-white border-t border-gray-50">
          {albumName && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded mb-2">
              {albumName}
            </span>
          )}
          {photo.caption && (
            <p className="text-black text-sm leading-relaxed mb-2">{photo.caption}</p>
          )}
          <p className="text-[11px] text-gray-400">
            {new Date(photo.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
