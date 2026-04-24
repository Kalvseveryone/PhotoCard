'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, LayoutGrid, Clock } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploadType, setUploadType] = useState('gallery'); // 'gallery' | 'story'
  const [albumName, setAlbumName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption);
      formData.append('type', uploadType);
      
      if (uploadType === 'gallery') {
        formData.append('album', albumName || 'Tanpa Album');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onUploadSuccess(data.photo);
        handleClose();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setUploadType('gallery');
    setAlbumName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-brand-dark">New Memory</h2>
            <button onClick={handleClose} className="p-2 bg-brand-light rounded-full text-brand-dark hover:bg-brand-pink hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-6">
            {/* TABS TYPE SELECTION */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadType('gallery')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === 'gallery' ? 'bg-white shadow relative text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid size={16} /> Album Permanen
              </button>
              <button
                type="button"
                onClick={() => setUploadType('story')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === 'story' ? 'bg-white shadow relative text-brand-dark' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Clock size={16} /> Story (24 Jam)
              </button>
            </div>

            <div 
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${preview ? 'border-brand-pink bg-brand-light/50' : 'border-gray-300 hover:border-brand-dark hover:bg-brand-light'}`}
            >
              {preview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden">
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="p-4 bg-brand-light rounded-full text-brand-dark">
                    <ImageIcon size={32} />
                  </div>
                  <p className="font-medium text-gray-600">Pilih Foto</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />

            {uploadType === 'gallery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Album (Klasifikasi)</label>
                <input 
                  type="text" 
                  value={albumName} 
                  onChange={(e) => setAlbumName(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                  placeholder="Misal: Bali 2026, Anniversary..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan manis (opsional)</label>
              <textarea 
                rows="2" 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent resize-none"
                placeholder="What a beautiful day..."
              />
            </div>

            <button 
              type="submit" 
              disabled={!file || uploading} 
              className="w-full flex items-center justify-center gap-2 bg-brand-dark text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span>Mengirim...</span>
              ) : (
                <>
                  <Upload size={18} />
                  <span>{uploadType === 'story' ? 'Posting ke Story' : 'Simpan ke Galeri'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
