import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || text.trim().length === 0) {
    return { isAppropriate: true, confidence: 'high' };
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Analyze this text for inappropriate content including hate speech, explicit content, violence, harassment, or spam. Respond with JSON containing: { "appropriate": true/false, "reason": "brief explanation if inappropriate", "confidence": "high/medium/low" }

Text to analyze: "${text}"`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isAppropriate: result.appropriate !== false,
        reason: result.reason,
        confidence: result.confidence || 'medium',
      };
    }

    // Fallback: if can't parse, assume appropriate
    return { isAppropriate: true, confidence: 'low' };
  } catch (error) {
    console.error('Moderation error:', error);
    // On error, allow content but log the issue
    return { isAppropriate: true, confidence: 'low' };
  }
}

export async function moderateImage(
  base64Image: string,
  mediaType: string
): Promise<ModerationResult> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Analyze this image for inappropriate content including explicit content, violence, gore, or anything not suitable for a food identification app. This is meant to be an image of food. Respond with JSON containing: { "appropriate": true/false, "reason": "brief explanation if inappropriate", "confidence": "high/medium/low" }',
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isAppropriate: result.appropriate !== false,
        reason: result.reason,
        confidence: result.confidence || 'medium',
      };
    }

    // Fallback: if can't parse, assume appropriate
    return { isAppropriate: true, confidence: 'low' };
  } catch (error) {
    console.error('Image moderation error:', error);
    // On error, allow content but log the issue
    return { isAppropriate: true, confidence: 'low' };
  }
}
