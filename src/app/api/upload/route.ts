import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const result = await uploadImage(image, 'storysnap/stories');

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
