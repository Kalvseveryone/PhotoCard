import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';
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
    const story = await Photo.findOne({ _id: id, type: 'story' });
    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    const userId = user.userId;
    const isLiked = story.likes.includes(userId);

    if (isLiked) {
      story.likes = story.likes.filter(id => id.toString() !== userId);
    } else {
      story.likes.push(userId);
      
      if (story.userId.toString() !== userId) {
        await Notification.create({
          userId: story.userId,
          senderId: userId,
          type: 'like_story',
          referenceId: story._id,
        });
      }
    }

    await story.save();

    return NextResponse.json({ 
      message: isLiked ? 'Unliked' : 'Liked',
      likes: story.likes,
      isLiked: !isLiked 
    });
  } catch (error) {
    console.error('Like story error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
