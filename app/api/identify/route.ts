import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { put } from '@vercel/blob';
import { logAudit } from '@/lib/audit';
import { moderateText, moderateImage } from '@/lib/moderation';
import {
  checkRateLimit,
  isUserLocked,
  incrementBlockedCount,
  detectAbuse,
  lockUser,
  sendAbuseAlert,
} from '@/lib/security';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
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
        action: 'identify',
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
    const rateLimit = await checkRateLimit(userId, 'identify');
    if (!rateLimit.allowed) {
      await logAudit({
        userId,
        action: 'identify',
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

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const userContext = formData.get('context') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Moderate user context text if provided
    if (userContext && userContext.trim()) {
      const textModeration = await moderateText(userContext);
      if (!textModeration.isAppropriate) {
        await logAudit({
          userId,
          action: 'identify',
          resourceType: 'food',
          details: `Blocked: Inappropriate text - ${textModeration.reason}`,
          ipAddress,
          userAgent,
          status: 'blocked',
        });

        await incrementBlockedCount(userId);

        // Check for abuse
        const abuseCheck = await detectAbuse(userId);
        if (abuseCheck.shouldLock) {
          await lockUser(userId, abuseCheck.reason!);
          await sendAbuseAlert(userId, abuseCheck.reason!);
        }

        return NextResponse.json(
          { error: 'Inappropriate content detected in text' },
          { status: 400 }
        );
      }
    }

    // Convert image to base64 for moderation and Anthropic API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Determine media type
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // Moderate image content
    const imageModeration = await moderateImage(base64Image, mediaType);
    if (!imageModeration.isAppropriate) {
      await logAudit({
        userId,
        action: 'identify',
        resourceType: 'food',
        details: `Blocked: Inappropriate image - ${imageModeration.reason}`,
        ipAddress,
        userAgent,
        status: 'blocked',
      });

      await incrementBlockedCount(userId);

      // Check for abuse
      const abuseCheck = await detectAbuse(userId);
      if (abuseCheck.shouldLock) {
        await lockUser(userId, abuseCheck.reason!);
        await sendAbuseAlert(userId, abuseCheck.reason!);
      }

      return NextResponse.json(
        { error: 'Inappropriate content detected in image' },
        { status: 400 }
      );
    }

    // Upload image to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Use Anthropic's vision API to identify the food
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-0-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Please identify this food or dish${userContext ? `. Additional context: ${userContext}` : ''}. Provide: 1) The name of the dish, 2) The key ingredients (as an array), 3) A brief description (2-3 sentences) explaining what makes the dish special or significant in the region. Format your response as JSON with keys "name", "ingredients", and "description".`,
            },
          ],
        },
      ],
    });

    // Parse the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Extract JSON from response (Claude might wrap it in markdown)
    let identification;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        identification = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        identification = JSON.parse(responseText);
      }
    } catch {
      // If JSON parsing fails, create a structured response from the text
      identification = {
        name: 'Unknown Dish',
        description: responseText,
        ingredients: [],
      };
    }

    // Log successful identification
    await logAudit({
      userId,
      action: 'identify',
      resourceType: 'food',
      details: `Success: ${identification.name}`,
      ipAddress,
      userAgent,
      status: 'success',
    });

    return NextResponse.json({
      ...identification,
      imageUrl: blob.url,
    });
  } catch (error) {
    console.error('Identification error:', error);

    // Log error if we have userId
    if (userId) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
      const userAgent = request.headers.get('user-agent') || null;

      await logAudit({
        userId,
        action: 'identify',
        resourceType: 'food',
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
        status: 'failure',
      });
    }

    return NextResponse.json(
      { error: 'Failed to identify food' },
      { status: 500 }
    );
  }
}
