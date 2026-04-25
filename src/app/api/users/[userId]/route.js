import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    let targetUserId = userId;

    // Jika /me, ambil dari token
    if (targetUserId === 'me') {
      const decoded = verifyToken(request);
      if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      targetUserId = decoded.userId;
    }

    const user = await User.findById(targetUserId).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Jika mengakses profile orang lain (bukan /me), sembunyikan email untuk keamanan
    let userData = user.toObject();
    if (params.userId !== 'me') {
      delete userData.email;
    }

    return NextResponse.json({ success: true, user: userData }, { status: 200 });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}
