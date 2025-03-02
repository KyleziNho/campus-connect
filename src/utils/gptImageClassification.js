/**
 * Simple image classification using ChatGPT Vision
 */

/**
 * Classify an image using ChatGPT Vision API
 * @param {File|String} input - Image file or URL
 * @returns {Promise<Object>} Classification results with color and category
 */
export async function classifyImage(input, isUrl = false) {
  try {
    // Convert file to base64 or use URL directly
    let imageData;
    if (isUrl) {
      // For URLs, just pass the URL directly
      imageData = input;
      console.log("Using direct URL:", input.substring(0, 50) + "...");
    } else {
      // For files, convert to base64 with proper formatting
      const base64 = await fileToBase64(input);
      // Make sure it has the correct prefix
      imageData = base64;
      console.log("Converted file to base64, length:", base64.length);
    }

    console.log("Sending image to ChatGPT API for analysis");
    
    // Send to our API endpoint that communicates with OpenAI
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log("ChatGPT analysis result:", result);
    
    return {
      category: result.category,
      color: result.color,
      confidence: 0.95, // ChatGPT is generally very confident
      allPredictions: [], // We don't need this anymore
      objectDetected: result.objectType,
      colorCandidates: result.colorOptions.map((option, index) => ({
        name: option.color,
        confidence: option.confidence,
        rgb: getColorRGB(option.color),
        source: 'chatgpt'
      })),
      resaleDescription: result.resaleDescription || null,
      condition: result.condition || null,
      brand: result.brand || null,
      rawResponse: result.rawDescription
    };
  } catch (error) {
    console.error('Image classification error:', error);
    // Provide a reasonable fallback
    return {
      category: 'other',
      color: 'unknown',
      confidence: 0,
      allPredictions: [],
      objectDetected: null,
      colorCandidates: [
        { name: 'unknown', confidence: 1, rgb: [128, 128, 128], source: 'error-fallback' }
      ],
      error: error.message
    };
  }
}

/**
 * Convert a file to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // This creates a data URL with the correct prefix
    reader.onload = () => {
      const base64 = reader.result;
      console.log("Base64 prefix:", base64.substring(0, 30) + "...");
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Get RGB values for a color name
 */
function getColorRGB(colorName) {
  const colorMap = {
    'red': [255, 0, 0],
    'blue': [0, 0, 255],
    'green': [0, 128, 0],
    'yellow': [255, 255, 0],
    'orange': [255, 165, 0],
    'purple': [128, 0, 128],
    'pink': [255, 192, 203],
    'brown': [139, 69, 19],
    'black': [0, 0, 0],
    'white': [255, 255, 255],
    'gray': [128, 128, 128],
    'beige': [245, 245, 220],
    'multicolor': [128, 128, 128]
  };
  
  const normalizedColor = colorName.toLowerCase();
  return colorMap[normalizedColor] || [128, 128, 128];
} 