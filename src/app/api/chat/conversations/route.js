import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await Conversation.find({
      participants: decoded.userId
    })
    .populate('participants', 'username name profileImage')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format data agar lebih rapi untuk frontend
    const formatted = conversations.map(c => {
      const otherUser = c.participants.find(p => p._id.toString() !== decoded.userId);
      
      // Ambil jumlah unread messages
      // Ini bisa di-query per conversation, tapi untuk performa kita lakukan secara efisien di frontend atau via lookup (untuk sementara di-skip, frontend bisa fetch jika butuh).
      
      return {
        _id: c._id,
        otherUser,
        lastMessage: c.lastMessage,
        updatedAt: c.updatedAt
      };
    });

    return NextResponse.json({ success: true, conversations: formatted }, { status: 200 });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
  }
}
