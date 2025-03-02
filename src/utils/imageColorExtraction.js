// Remove browser-incompatible code, we'll use a server API instead
export async function extractDominantColor(data, bbox = null) {
  try {
    // Instead of processing directly, we'll send to the server
    // Create a form with the image data and box coordinates
    const formData = new FormData();
    
    // Convert Uint8Array to Blob for sending
    const imageBlob = new Blob([data], { type: 'application/octet-stream' });
    formData.append('image', imageBlob);
    
    // Add bounding box info if available
    if (bbox) {
      formData.append('bbox', JSON.stringify(bbox));
    }
    
    // Send to our new API endpoint
    const response = await fetch('/api/analyze-color', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Color analysis API failed');
    }
    
    const result = await response.json();
    return result.color;
    
  } catch (error) {
    console.error('Color extraction error:', error);
    return null;
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