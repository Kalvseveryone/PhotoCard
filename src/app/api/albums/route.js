import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const albums = await Album.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, albums }, { status: 200 });
  } catch (error) {
    console.error('Get Albums Error:', error);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}
