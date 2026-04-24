'use client';

import { Heart, Trash2 } from 'lucide-react';

export default function PhotoCard({ photo, onToggleFavorite, onDelete }) {
  return (
    <div className="group relative bg-white p-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in break-inside-avoid mb-6">
      <div className="relative rounded-lg overflow-hidden flex justify-center bg-gray-50 aspect-square sm:aspect-auto">
        <img 
          src={photo.url} 
          alt={photo.caption || 'Romantic memory'} 
          className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500 max-h-[500px]"
          loading="lazy"
        />
        
        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onToggleFavorite(photo._id, photo.isFavorite)}
            className={`p-2 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 ${photo.isFavorite ? 'bg-white text-red-500' : 'bg-black/50 text-white hover:bg-white hover:text-red-500'}`}
          >
            <Heart size={20} className={photo.isFavorite ? 'fill-current animate-heartbeat' : ''} />
          </button>
          <button 
            onClick={() => onDelete(photo._id)}
            className="p-2 rounded-full bg-black/50 text-white shadow-md hover:bg-red-500 transition-transform hover:scale-110 active:scale-95"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {(photo.caption || photo.createdAt) && (
        <div className="mt-4 px-2 pb-2">
          {photo.caption && (
            <p className="text-gray-800 font-serif text-lg leading-relaxed">{photo.caption}</p>
          )}
          <p className="text-xs text-gray-400 mt-2 font-mono">
            {new Date(photo.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
