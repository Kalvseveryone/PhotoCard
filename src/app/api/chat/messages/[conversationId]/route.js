import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Ambil semua pesan dalam conversation + set status delivered
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set 'delivered' untuk pesan yang 'sent' dan bukan milik kita
    // Ini mensimulasikan bahwa device penerima sudah 'menerima' pesan saat request ini terjadi
    await Message.updateMany({
      conversationId,
      senderId: { $ne: decoded.userId },
      status: 'sent'
    }, {
      $set: { status: 'delivered', deliveredAt: new Date() }
    });

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

// POST: Kirim pesan baru
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { conversationId } = await params;
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const newMessage = await Message.create({
      conversationId,
      senderId: decoded.userId,
      text: text.trim(),
      status: 'sent'
    });

    // Update lastMessage and updatedAt di Conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
