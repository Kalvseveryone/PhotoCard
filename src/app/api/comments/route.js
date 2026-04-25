import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Auth Check
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { photoId, text } = body;

    if (!photoId || !text || text.trim() === '') {
      return NextResponse.json({ error: 'photoId dan text wajib diisi' }, { status: 400 });
    }

    if (text.length > 200) {
      return NextResponse.json({ error: 'Komentar maksimal 200 karakter' }, { status: 400 });
    }

    const newComment = new Comment({
      photoId,
      text: text.trim(),
      userId: decoded.userId,
      username: decoded.username,
    });

    const savedComment = await newComment.save();

    return NextResponse.json({ success: true, comment: savedComment }, { status: 201 });
  } catch (error) {
    console.error('Post Comment Error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
