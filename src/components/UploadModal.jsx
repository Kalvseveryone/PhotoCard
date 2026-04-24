'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, LayoutGrid, Clock } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploadType, setUploadType] = useState('gallery'); // 'gallery' | 'story'
  const [albumName, setAlbumName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [albums, setAlbums] = useState([]);
  const [showAlbumList, setShowAlbumList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/albums')
        .then(res => res.json())
        .then(data => {
            if(data.success) setAlbums(data.albums);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Max dimension 1920px untuk galeri kualitas tinggi namun tetap ringan
          const MAX = 1920;
          let width = img.width;
          let height = img.height;
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.round((height *= MAX / width));
              width = MAX;
            } else {
              width = Math.round((width *= MAX / height));
              height = MAX;
            }
          }
          canvas.width = width;
          canvas.height = height;
          // Menggambar ke canvas 2D otomatis membuang gain-map HDR (menormalisasikan iPhone HDR dsb ke SDR)
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve({ processedFile: newFile, previewUrl: canvas.toDataURL('image/jpeg', 0.8) });
          }, 'image/jpeg', 0.85); // 85% JPEG Quality
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Tampilkan state loading atau langsung proses jika HP cepat
      const { processedFile, previewUrl } = await compressImage(selected);
      setFile(processedFile);
      setPreview(previewUrl);
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
        formData.append('album', albumName.trim() || 'Tanpa Album');
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
    setFile(null); setPreview(null); setCaption('');
    setUploadType('gallery'); setAlbumName(''); setShowAlbumList(false);
    onClose();
  };

  // Filter datalist dropdown purely visual logic
  const filteredAlbums = albums.filter(a => a.name.toLowerCase().includes(albumName.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight text-black">New Upload</h2>
            <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full text-black hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button type="button" onClick={() => setUploadType('gallery')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === 'gallery' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}>
                <LayoutGrid size={16} /> Gallery
              </button>
              <button type="button" onClick={() => setUploadType('story')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${uploadType === 'story' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}>
                <Clock size={16} /> 24h Story
              </button>
            </div>

            <div onClick={() => fileInputRef.current.click()} className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${preview ? 'border-gray-800 bg-gray-50' : 'border-gray-300 hover:border-black hover:bg-gray-50'}`}>
              {preview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden flex items-center justify-center bg-black">
                  <img src={preview} alt="Preview" className="object-cover h-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="p-3 bg-gray-100 rounded-full text-black">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Select an image</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            {uploadType === 'gallery' && (
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Album Classification</label>
                <input 
                  type="text" 
                  value={albumName} 
                  onChange={(e) => {
                    setAlbumName(e.target.value);
                    setShowAlbumList(true);
                  }}
                  onFocus={() => setShowAlbumList(true)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="Type to search or create new album..."
                />
                {showAlbumList && albumName !== '' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredAlbums.length > 0 ? (
                       filteredAlbums.map(alb => (
                         <div key={alb._id} className="p-3 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => { setAlbumName(alb.name); setShowAlbumList(false); }}>
                           {alb.name}
                         </div>
                       ))
                    ) : (
                       <div className="p-3 text-sm text-gray-500 italic">
                         Press upload to create new album "{albumName}"
                       </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Caption (Optional)</label>
              <textarea rows="2" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none" placeholder="Write something..." />
            </div>

            <button type="submit" disabled={!file || uploading} className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 py-3 rounded-lg text-sm font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? <span>Uploading...</span> : <><Upload size={16} /> <span>{uploadType === 'story' ? 'Post to Story' : 'Upload File'}</span></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
