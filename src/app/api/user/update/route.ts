import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/lib/firebase';

export async function PUT(request: NextRequest) {
  try {
    const { firebaseUid, name } = await request.json();

    if (!firebaseUid || !name) {
      return NextResponse.json(
        { error: 'Firebase UID and name are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { name },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
