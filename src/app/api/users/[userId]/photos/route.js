import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    let targetUserId = userId;

    if (targetUserId === 'me') {
      const decoded = verifyToken(request);
      if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      targetUserId = decoded.userId;
    }

    // Ambil foto non-story
    const photos = await Photo.find({ 
      userId: targetUserId,
      type: { $ne: 'story' } 
    })
    .populate('albumId')
    .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, photos }, { status: 200 });
  } catch (error) {
    console.error('Get User Photos Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}
