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

    // Save to DB
    const newPhoto = await Photo.create({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      caption: caption,
    });

    return NextResponse.json({ success: true, photo: newPhoto }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
