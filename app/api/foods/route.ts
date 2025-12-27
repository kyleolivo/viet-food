import { NextRequest, NextResponse } from 'next/server';
import { getFoodEntries, addFoodEntry } from '@/lib/db';

export async function GET() {
  try {
    const entries = await getFoodEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, imageUrl } = await request.json();

    if (!name || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const entry = await addFoodEntry(name, description, imageUrl);
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error saving food entry:', error);
    return NextResponse.json(
      { error: 'Failed to save food entry' },
      { status: 500 }
    );
  }
}
