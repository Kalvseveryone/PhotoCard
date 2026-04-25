import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Mark as read untuk semua pesan yang bukan milik kita dan statusnya belum read
    await Message.updateMany({
      conversationId,
      senderId: { $ne: decoded.userId },
      status: { $ne: 'read' }
    }, {
      $set: { status: 'read', readAt: now, deliveredAt: now } // Pastikan deliveredAt juga diset kalau skip
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Read Receipt Error:', error);
    return NextResponse.json({ error: 'Failed to update read status' }, { status: 500 });
  }
}
