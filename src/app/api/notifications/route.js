import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';
import '@/models/User'; // Ensure User model is loaded for populate

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const notifications = await Notification.find({ userId: user.userId })
      .populate('senderId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


