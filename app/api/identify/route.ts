import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { put } from '@vercel/blob';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Upload image to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Convert image to base64 for Anthropic API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Determine media type
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // Use Anthropic's vision API to identify the food
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
              text: 'Please identify this food or dish. Provide: 1) The name of the dish, 2) A brief description (2-3 sentences) of what it is and why it\'s notable or interesting. Format your response as JSON with keys "name" and "description".',
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
      };
    }

    return NextResponse.json({
      ...identification,
      imageUrl: blob.url,
    });
  } catch (error) {
    console.error('Identification error:', error);
    return NextResponse.json(
      { error: 'Failed to identify food' },
      { status: 500 }
    );
  }
}
