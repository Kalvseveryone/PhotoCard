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
    const photo = await Photo.findById(id);
    if (!photo) {
      return NextResponse.json({ message: 'Photo not found' }, { status: 404 });
    }

    const userId = user.userId;
    const isLiked = photo.likes.includes(userId);

    if (isLiked) {
      // Unlike
      photo.likes = photo.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      photo.likes.push(userId);
      
      // Create notification if not own photo
      if (photo.userId.toString() !== userId) {
        await Notification.create({
          userId: photo.userId,
          senderId: userId,
          type: 'like_photo',
          referenceId: photo._id,
        });
      }
    }

    await photo.save();

    return NextResponse.json({ 
      message: isLiked ? 'Unliked' : 'Liked',
      likes: photo.likes,
      isLiked: !isLiked 
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
