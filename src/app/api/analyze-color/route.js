import { NextResponse } from 'next/server';
import Jimp from 'jimp';
import quantize from 'quantize';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    // Get bounding box if provided
    let bbox = null;
    const bboxData = formData.get('bbox');
    if (bboxData) {
      try {
        bbox = JSON.parse(bboxData);
      } catch (e) {
        console.error('Error parsing bbox:', e);
      }
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Process with Jimp (server-side only)
    const image = await Jimp.read(buffer);
    
    // Crop if bbox provided
    if (bbox) {
      const x = Math.max(0, Math.floor(bbox.xmin * image.getWidth()));
      const y = Math.max(0, Math.floor(bbox.ymin * image.getHeight()));
      const width = Math.floor((bbox.xmax - bbox.xmin) * image.getWidth());
      const height = Math.floor((bbox.ymax - bbox.ymin) * image.getHeight());
      
      image.crop(x, y, width, height);
    }
    
    // Resize for faster processing
    image.resize(100, Jimp.AUTO);
    
    // Extract pixels
    const pixelData = [];
    image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
      const r = image.bitmap.data[idx + 0];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // Skip near-white, near-black, and gray pixels
      const isNearWhite = r > 240 && g > 240 && b > 240;
      const isNearBlack = r < 15 && g < 15 && b < 15;
      const isGray = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10;
      
      if (!isNearWhite && !isNearBlack && !isGray) {
        pixelData.push([r, g, b]);
      }
    });
    
    // If no valid pixels found, return unknown
    if (pixelData.length === 0) {
      return NextResponse.json({ color: 'unknown' });
    }
    
    // Apply color quantization
    const colorMap = quantize(pixelData, 5);
    const palette = colorMap.palette();
    
    // Get dominant color
    const dominantRGB = palette[0];
    const color = rgbToColorName(dominantRGB[0], dominantRGB[1], dominantRGB[2]);
    
    return NextResponse.json({ 
      color,
      palette: palette.slice(0, 5) // Return top 5 colors for debugging
    });
    
  } catch (error) {
    console.error('Server color analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Convert RGB values to a color name using HSL conversion
 */
function rgbToColorName(r, g, b) {
  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Map HSL values to color names
  h = h * 360;
  s = s * 100;
  l = l * 100;
  
  // Determine color based on hue
  if (s < 10) {
    // Low saturation means grayscale
    if (l < 20) return 'black';
    if (l > 80) return 'white';
    return 'gray';
  }
  
  // Special case for purple/fuchsia detection
  if (h >= 270 && h < 330 && s > 30) {
    // More accurate purple detection for the loafer example
    return 'purple';
  }
  
  // Determine color based on hue
  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 65) return 'yellow';
  if (h < 170) return 'green';
  if (h < 190) return 'cyan';
  if (h < 260) return 'blue';
  if (h < 290) return 'purple';
  if (h < 345) return 'pink';
  
  return 'unknown';
} 