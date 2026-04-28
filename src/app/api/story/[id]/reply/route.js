import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { text } = await req.json();
    const user = verifyToken(req);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const story = await Photo.findOne({ _id: id, type: 'story' });
    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    const senderId = user.userId;
    const receiverId = story.userId;

    if (senderId === receiverId.toString()) {
      return NextResponse.json({ message: 'Cannot reply to own story' }, { status: 400 });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: senderId,
      text: text || "Membalas story anda",
      type: 'story_reply',
      storyPreview: story.url
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Story reply error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
