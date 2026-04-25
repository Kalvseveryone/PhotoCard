import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { photoId } = await params;
    
    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    const comments = await Comment.find({ photoId })
                                  .sort({ createdAt: 1 }); // Terlama hingga terbaru
                                  
    return NextResponse.json({ success: true, comments }, { status: 200 });
  } catch (error) {
    console.error('Get Comments Error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
