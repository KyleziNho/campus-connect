import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face with API key
const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

/**
 * Direct color detection using a reliable model
 * @param {File|String} input - Image file or URL
 * @returns {Promise<Object>} Color detection results
 */
export async function detectColor(input) {
  try {
    console.log("Starting direct color detection with input type:", typeof input);
    
    // Prepare image data based on input type
    let imageData;
    
    if (typeof input === 'string') {
      // If input is a URL, just use it directly - Hugging Face API can handle URLs
      if (input.startsWith('http') || input.startsWith('https') || input.startsWith('data:image')) {
        imageData = input;
        console.log("Using direct URL for color detection:", imageData.substring(0, 50) + "...");
      } else {
        throw new Error('Invalid image URL format');
      }
    } else if (input instanceof File) {
      // For file uploads, convert to array buffer
      console.log("Processing file for color detection:", input.name, input.type, input.size);
      try {
        const buffer = await input.arrayBuffer();
        imageData = new Uint8Array(buffer);
        console.log("File converted to ArrayBuffer successfully, length:", imageData.length);
      } catch (fileError) {
        console.error("Error reading file:", fileError);
        throw new Error(`File reading error: ${fileError.message}`);
      }
    } else {
      console.error("Invalid input type:", input);
      throw new Error(`Unsupported input type for color detection: ${typeof input}`);
    }
    
    // Use a single reliable vision model
    const model = "google/vit-base-patch16-224"; // Reliable general image classifier
    
    console.log("Calling Hugging Face API with model:", model);
    const results = await hf.imageClassification({
      model: model,
      data: imageData,
    });
    
    console.log("Raw model results:", results);
    
    // Extract color information from results
    const colors = extractColors(results);
    console.log("Extracted colors:", colors);
    
    // Ensure we always return an array of colors
    const formattedColors = colors.length > 0 ? colors : [
      { name: 'unknown', confidence: 0.5, source: 'fallback', rgb: [128, 128, 128] }
    ];
    
    return {
      dominantColor: formattedColors[0].name,
      confidence: formattedColors[0].confidence,
      allColors: formattedColors,
      success: true
    };
  } catch (error) {
    console.error("Color detection error:", error);
    // Always return a valid structure even on error
    return {
      dominantColor: 'unknown',
      confidence: 0,
      allColors: [
        { name: 'unknown', confidence: 0, source: 'error', rgb: [128, 128, 128] }
      ],
      error: error.message,
      success: false
    };
  }
}

/**
 * Extract color information from classification results
 */
function extractColors(results) {
  // List of common colors to detect - expanded list
  const colorTerms = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
    'pink', 'brown', 'black', 'white', 'gray', 'beige',
    'maroon', 'navy', 'teal', 'olive', 'silver', 'gold',
    'crimson', 'magenta', 'cyan', 'lime', 'indigo', 'violet'
  ];
  
  // Map variant colors to standard colors
  const colorVariants = {
    'crimson': 'red',
    'scarlet': 'red',
    'ruby': 'red',
    'maroon': 'red',
    'navy': 'blue',
    'azure': 'blue',
    'cobalt': 'blue',
    'teal': 'blue',
    'lime': 'green',
    'olive': 'green',
    'emerald': 'green',
    'ivory': 'white',
    'silver': 'gray',
    'charcoal': 'black',
    'peach': 'orange',
    'salmon': 'pink',
    'hot pink': 'pink',
    'magenta': 'pink',
    'violet': 'purple',
    'indigo': 'purple',
    'lavender': 'purple',
    'gold': 'yellow',
    'khaki': 'beige',
    'tan': 'beige'
  };
  
  // Collect all color matches
  const colorMatches = [];
  
  // First, check for explicit color mentions in the results
  for (const result of results) {
    const label = result.label.toLowerCase();
    
    // 1. Check direct color mentions
    for (const color of colorTerms) {
      if (label.includes(color)) {
        colorMatches.push({
          name: color,
          confidence: result.score,
          source: label,
          rgb: getColorRGB(color)
        });
        break; // Only count one color per result
      }
    }
    
    // 2. Check for color variants
    for (const [variant, standardColor] of Object.entries(colorVariants)) {
      if (label.includes(variant)) {
        colorMatches.push({
          name: standardColor,
          confidence: result.score * 0.9, // Slightly lower confidence for variants
          source: `${label} (${variant} → ${standardColor})`,
          rgb: getColorRGB(standardColor)
        });
        break;
      }
    }
  }
  
  // 3. Check for special patterns like "red dress" or "blue shoes"
  // Extract colors from common product descriptions
  for (const result of results) {
    const label = result.label.toLowerCase();
    for (const color of colorTerms) {
      const pattern = new RegExp(`${color}\\s+(shirt|dress|shoe|hat|coat|jacket|pants|skirt|bag|boots)`, 'i');
      if (pattern.test(label)) {
        colorMatches.push({
          name: color,
          confidence: result.score * 1.1, // Boost confidence for specific product mentions
          source: `${label} (product pattern)`,
          rgb: getColorRGB(color)
        });
        break;
      }
    }
  }
  
  // If we have no color matches, look for any other clues
  if (colorMatches.length === 0) {
    // Try to find color-adjacent terms
    for (const result of results) {
      const label = result.label.toLowerCase();
      
      // Check for colored materials
      if (label.includes('denim') || label.includes('jeans')) {
        colorMatches.push({
          name: 'blue',
          confidence: result.score * 0.7,
          source: `${label} (material → blue)`,
          rgb: getColorRGB('blue')
        });
      } else if (label.includes('leather')) {
        colorMatches.push({
          name: 'brown',
          confidence: result.score * 0.7,
          source: `${label} (material → brown)`,
          rgb: getColorRGB('brown')
        });
      }
    }
  }
  
  // Combine duplicate colors by taking the highest confidence
  const colorMap = {};
  for (const match of colorMatches) {
    if (!colorMap[match.name] || colorMap[match.name].confidence < match.confidence) {
      colorMap[match.name] = match;
    }
  }
  
  // Convert back to array and sort by confidence
  const sortedColors = Object.values(colorMap).sort((a, b) => b.confidence - a.confidence);
  
  // Add at least one fallback color if we didn't find any
  if (sortedColors.length === 0) {
    sortedColors.push({
      name: 'unknown',
      confidence: 0.5,
      source: 'default fallback',
      rgb: [128, 128, 128]
    });
  }
  
  return sortedColors;
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
    'beige': [245, 245, 220]
  };
  
  return colorMap[colorName] || [128, 128, 128];
} 