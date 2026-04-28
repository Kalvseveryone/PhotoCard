import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await request.json();
    
    if (typeof body.isFavorite === 'undefined') {
      return NextResponse.json({ error: 'isFavorite field is required' }, { status: 400 });
    }

    const photo = await Photo.findByIdAndUpdate(id, { isFavorite: body.isFavorite }, { returnDocument: 'after' });
    
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, photo }, { status: 200 });
  } catch (error) {
    console.error('Update Photo Error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const photo = await Photo.findById(id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete from cloudinary
    if (photo.public_id) {
       await cloudinary.uploader.destroy(photo.public_id);
    }

    // Delete from DB
    await Photo.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Photo deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete Photo Error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
