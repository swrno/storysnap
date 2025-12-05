import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';

// GET all stories (with optional status filter) - Trigger Rebuild
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');

    await connectDB();

    let query: any = {};
    if (status) query.status = status;
    if (authorId) query.authorId = authorId;

    const stories = await Story.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

// POST create new story
export async function POST(request: Request) {
  try {
    const data = await request.json();

    await connectDB();

    const story = await Story.create({
      ...data,
      status: 'pending',
    });

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
