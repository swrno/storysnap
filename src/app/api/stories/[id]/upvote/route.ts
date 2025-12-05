import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Initialize upvotedBy if it doesn't exist (for old records)
    if (!story.upvotedBy) {
      story.upvotedBy = [];
    }

    const isUpvoted = story.upvotedBy.includes(userId);
    let updatedStory;

    if (isUpvoted) {
      // Remove upvote
      updatedStory = await Story.findByIdAndUpdate(
        id,
        {
          $pull: { upvotedBy: userId },
          $inc: { upvotes: -1 }
        },
        { new: true }
      );
    } else {
      // Add upvote
      updatedStory = await Story.findByIdAndUpdate(
        id,
        {
          $addToSet: { upvotedBy: userId },
          $inc: { upvotes: 1 }
        },
        { new: true }
      );
    }

    if (!updatedStory) {
       return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }

    return NextResponse.json({
      upvotes: updatedStory.upvotes,
      hasUpvoted: !isUpvoted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}
