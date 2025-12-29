import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFoodEntries, addFoodEntry } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import {
  checkRateLimit,
  isUserLocked,
  incrementBlockedCount,
  detectAbuse,
  lockUser,
  sendAbuseAlert,
} from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { entries, total } = await getFoodEntries(userId, limit, offset);

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    await logAudit({
      userId,
      action: 'list_foods',
      resourceType: 'food',
      details: `Retrieved ${entries.length} entries`,
      ipAddress,
      userAgent,
      status: 'success',
    });

    return NextResponse.json({ entries, total, limit, offset });
  } catch (error) {
    console.error('Error fetching food entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;

  try {
    const { userId: authUserId } = await auth();
    userId = authUserId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Check if user is locked
    const locked = await isUserLocked(userId);
    if (locked) {
      await logAudit({
        userId,
        action: 'save_food',
        resourceType: 'food',
        details: 'Blocked: Account locked',
        ipAddress,
        userAgent,
        status: 'blocked',
      });

      return NextResponse.json(
        { error: 'Account locked. Please contact support.' },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(userId, 'save_food');
    if (!rateLimit.allowed) {
      await logAudit({
        userId,
        action: 'save_food',
        resourceType: 'food',
        details: 'Blocked: Rate limit exceeded',
        ipAddress,
        userAgent,
        status: 'blocked',
      });

      await incrementBlockedCount(userId);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const { name, description, ingredients, imageUrl, userContext } = await request.json();

    if (!name || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const entry = await addFoodEntry(
      userId,
      name,
      description,
      ingredients || [],
      imageUrl,
      userContext || null
    );

    await logAudit({
      userId,
      action: 'save_food',
      resourceType: 'food',
      resourceId: entry.id.toString(),
      details: `Saved: ${name}`,
      ipAddress,
      userAgent,
      status: 'success',
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error saving food entry:', error);

    if (userId) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
      const userAgent = request.headers.get('user-agent') || null;

      await logAudit({
        userId,
        action: 'save_food',
        resourceType: 'food',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
        status: 'failure',
      });
    }

    return NextResponse.json(
      { error: 'Failed to save food entry' },
      { status: 500 }
    );
  }
}
