import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
