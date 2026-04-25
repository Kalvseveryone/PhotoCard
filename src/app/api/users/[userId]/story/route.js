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

    const now = new Date();

    // Ambil story yang belum expired
    const stories = await Photo.find({ 
      userId: targetUserId,
      type: 'story',
      expiredAt: { $gt: now } 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, stories }, { status: 200 });
  } catch (error) {
    console.error('Get User Story Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}
