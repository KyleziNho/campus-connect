import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "user", "content": "Hello, are you working?"}
      ]
    });
    
    return NextResponse.json({ 
      success: true, 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 