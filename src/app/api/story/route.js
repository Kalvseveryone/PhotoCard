import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();

    // 1. ============ LAZY CLEANUP ============
    // Temukan semua story yang waktunya sudah melebihi 24 jam
    const expiredStories = await Photo.find({ 
      type: 'story', 
      expiredAt: { $lte: now } 
    });
    
    // Hapus dari cloud storage (Cloudinary) dan Database secara loop diam-diam
    if (expiredStories.length > 0) {
      for (const story of expiredStories) {
        if (story.public_id) {
          // Fire and forget (tidak pause system walau error)
          await cloudinary.uploader.destroy(story.public_id).catch(console.error);
        }
      }
      
      // Bulk Delete Document MongoDB
      const expiredIds = expiredStories.map(s => s._id);
      await Photo.deleteMany({ _id: { $in: expiredIds } });
    }

    // 2. ============ FETCH FRESH STORIES ============
    // Ambil data yang tersisa dan masih hidup
    const activeStories = await Photo.find({ 
      type: 'story', 
      expiredAt: { $gt: now } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, stories: activeStories }, { status: 200 });
  } catch (error) {
    console.error('Get/Cleanup Stories Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
