import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Fetch the HTML content of the Vinted page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extract image URLs using regex
    // This is a simplified approach - in production you'd want to use a proper HTML parser
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const matches = [...html.matchAll(imageRegex)];
    
    // Filter for Vinted image URLs
    const vintedImages = matches
      .map(match => match[1])
      .filter(src => src.includes('vinted.net/t/') && !src.includes('avatar'));
    
    if (vintedImages.length === 0) {
      return NextResponse.json({ error: 'No product images found on the page' }, { status: 404 });
    }
    
    // Return the first product image
    return NextResponse.json({ imageUrl: vintedImages[0] });
    
  } catch (error) {
    console.error('Error extracting image from URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 