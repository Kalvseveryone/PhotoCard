import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Photo from '@/models/Photo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    // Only return gallery items historically or newly added (skip 'story' items)
    const photos = await Photo.find({ type: { $ne: 'story' } }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, photos }, { status: 200 });
  } catch (error) {
    console.error('Get Photos Error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
