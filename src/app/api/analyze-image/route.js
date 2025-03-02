import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    console.log("API Key available:", !!process.env.OPENAI_API_KEY);
    console.log("Image data type:", typeof image);
    
    // Validate image format
    let imageUrl = image;
    
    // Handle base64 data URLs properly
    if (image.startsWith('data:image')) {
      console.log("Processing base64 image data");
      // Base64 data URLs are fine as-is
    } 
    // Handle HTTP URLs
    else if (image.startsWith('http')) {
      console.log("Processing HTTP image URL");
      // HTTP URLs are fine as-is
    } 
    // Handle other formats - this might be the issue
    else {
      console.log("Unknown image format, assuming base64 without prefix");
      // Try to fix by adding data:image prefix if missing
      imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    }
    
    // Update the prompt to generate more casual, student-like descriptions
    const prompt = `
      Analyze this image and identify:
      1. What is the main object in the image?
      2. What category does it belong to? (Choose one: clothes, shoes, accessories, electronics, kitchen, tickets, other)
      3. What is the dominant color of the main object?
      4. List 3 possible colors the object could be considered, with confidence percentages.
      
      Create a brief, casual product description as if written by a university student selling this item. Keep it under 30 words.
      
      Guidelines for the description:
      - Use general terms (e.g., "Nike shoes" not "Nike Air Zoom Pegasus 37")
      - Use basic color names (e.g., "red" not "crimson" or "scarlet")
      - Focus on condition and basic features (e.g., "good condition, barely worn" or "has a small stain")
      - Sound casual and straightforward (e.g., "Comfy North Face jacket, warm, no damage")
      - Mention brand if visible, but keep it simple
      
      Format your response as JSON like this:
      {
        "objectType": "generic object name (e.g., running shoes, winter jacket)",
        "category": "one of the categories listed above",
        "color": "basic color name",
        "colorOptions": [
          {"color": "primary color", "confidence": 0.8},
          {"color": "secondary color", "confidence": 0.15},
          {"color": "tertiary color", "confidence": 0.05}
        ],
        "resaleDescription": "Casual student-like description",
        "condition": "excellent/good/fair/poor",
        "brand": "brand name if visible or unknown",
        "rawDescription": "brief description of the object"
      }
      
      IMPORTANT: Keep descriptions casual and straightforward, like a student would write on a campus marketplace. Use general terms and basic colors.
    `;
    
    // Call OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    let result;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing GPT response:", parseError);
      console.log("Raw response:", content);
      
      // Create a fallback response
      result = {
        objectType: "unknown",
        category: "other",
        color: "unknown",
        colorOptions: [
          { color: "unknown", confidence: 1.0 }
        ],
        resaleDescription: "No description available",
        condition: "unknown",
        brand: "unknown",
        rawDescription: content.substring(0, 100) + "..."
      };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Detailed error:', error);
    
    // Check for specific OpenAI error types
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.response) {
      // OpenAI API error with response
      console.error('OpenAI API error status:', error.response.status);
      console.error('OpenAI API error data:', error.response.data);
      errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      // Network error
      errorMessage = `Network error: ${error.code}`;
      statusCode = 503; // Service Unavailable
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      objectType: "error",
      category: "other",
      color: "unknown",
      colorOptions: [{ color: "unknown", confidence: 1.0 }],
      resaleDescription: "No description available",
      condition: "unknown",
      brand: "unknown"
    }, { status: statusCode });
  }
} 