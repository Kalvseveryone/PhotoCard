import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId } = await request.json();
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    // Hindari chat dengan diri sendiri
    if (decoded.userId === receiverId) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 });
    }

    // Cari conversation yang melibatkan kedua user
    let conversation = await Conversation.findOne({
      participants: { $all: [decoded.userId, receiverId] }
    });

    if (!conversation) {
      // Buat baru
      conversation = await Conversation.create({
        participants: [decoded.userId, receiverId]
      });
    }

    return NextResponse.json({ success: true, conversationId: conversation._id }, { status: 200 });
  } catch (error) {
    console.error('Start Chat Error:', error);
    return NextResponse.json({ error: 'Failed to start chat' }, { status: 500 });
  }
}
