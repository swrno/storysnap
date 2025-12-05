import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story from '@/models/Story';
import User from '@/models/User';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action, adminUid, rejectionReason } = await request.json();
    const { id: storyId } = await params;

    await connectDB();

    // Verify admin
    const admin = await User.findOne({ firebaseUid: adminUid });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {
      approvedBy: adminUid,
      approvedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    const story = await Story.findByIdAndUpdate(storyId, updateData, { new: true });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}
