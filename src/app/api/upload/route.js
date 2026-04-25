import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import Album from '@/models/Album';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Auth Check
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const caption = formData.get('caption') || '';
    const type = formData.get('type') || 'gallery';
    const rawAlbumName = formData.get('album') || 'Tanpa Album';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to base64 string
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'romantic_album',
    });

    // Handle 24 Hour Expiry Logic
    let expiredAt = undefined;
    if (type === 'story') {
      expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours later
    }

    // Resolusi Relasi DB Album (Otomatis Buat Baru Bila Tidak Ditemukan)
    let resolvedAlbumId = undefined;
    if (type === 'gallery') {
      const cleanName = rawAlbumName.trim() || 'Tanpa Album';
      // Case insensitive check
      let albumDoc = await Album.findOne({ name: { $regex: new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } });
      if (!albumDoc) {
        albumDoc = await Album.create({ name: cleanName });
      }
      resolvedAlbumId = albumDoc._id;
    }

    // Save to DB
    const newPhotoObj = await Photo.create({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      caption: caption,
      type: type,
      albumId: resolvedAlbumId,
      userId: decoded.userId,
      username: decoded.username,
      expiredAt: expiredAt,
    });

    const populatedPhoto = await Photo.findById(newPhotoObj._id).populate('albumId');

    return NextResponse.json({ success: true, photo: populatedPhoto || newPhotoObj }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload photo' }, { status: 500 });
  }
}
