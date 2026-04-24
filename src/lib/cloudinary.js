import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary akan otomatis membaca dari environment variable CLOUDINARY_URL
// Format CLOUDINARY_URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config({
  secure: true,
});

export default cloudinary;
