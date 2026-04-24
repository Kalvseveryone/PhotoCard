import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';

export async function POST(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const file = formData.get('file');
    const caption = formData.get('caption') || '';
    const type = formData.get('type') || 'gallery';
    const album = formData.get('album') || 'All Memories';

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

    // Save to DB
    const newPhoto = await Photo.create({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      caption: caption,
      type: type,
      album: type === 'story' ? undefined : album, // Story doesn't need album categorization
      expiredAt: expiredAt,
    });

    return NextResponse.json({ success: true, photo: newPhoto }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
