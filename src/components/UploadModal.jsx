'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-brand-dark">Our New Memory</h2>
            <button onClick={handleClose} className="p-2 bg-brand-light rounded-full text-brand-dark hover:bg-brand-pink hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${preview ? 'border-brand-pink bg-brand-light/50' : 'border-gray-300 hover:border-brand-dark hover:bg-brand-light'}`}
            >
              {preview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden">
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <div className="p-4 bg-brand-light rounded-full text-brand-dark">
                    <ImageIcon size={32} />
                  </div>
                  <p className="font-medium text-gray-600">Click to choose a photo</p>
                  <p className="text-sm text-gray-400">JPG, PNG, WEBP max 5MB</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sweet text (optional)</label>
              <textarea 
                rows="3" 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)} 
                className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent resize-none"
                placeholder="What a beautiful day..."
              />
            </div>

            <button 
              type="submit" 
              disabled={!file || uploading} 
              className="w-full flex items-center justify-center space-x-2 bg-brand-dark text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span>Uploading frame...</span>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Save Memory</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
