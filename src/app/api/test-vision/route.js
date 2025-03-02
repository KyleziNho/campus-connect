import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET() {
  try {
    // Use a reliable test image URL
    const testImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image? Describe it briefly." },
            {
              type: "image_url",
              image_url: {
                url: testImageUrl,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });
    
    return NextResponse.json({ 
      success: true, 
      description: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Vision test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    }, { status: 500 });
  }
} 