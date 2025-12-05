import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { firebaseUid } = await request.json();

    await connectDB();

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ isAdmin: user.role === 'admin' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 });
  }
}
