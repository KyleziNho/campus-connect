import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

/**
 * Specialized color detection using advanced models
 * @param {Uint8Array|String} imageData - Image data or URL
 * @returns {Promise<Object>} - Color classification results with probabilities
 */
export async function detectColorWithProbabilities(imageData) {
  // Validate image data
  if (!imageData || (typeof imageData === 'string' && imageData.startsWith('import'))) {
    console.error('Invalid image data received:', 
      typeof imageData === 'string' ? imageData.substring(0, 50) + '...' : typeof imageData);
    return {
      dominantColor: 'unknown',
      confidence: 0,
      colorProbabilities: [],
      error: 'Invalid image data format'
    };
  }

  // Define models specialized in color detection
  const MODELS = [
    // Fine-tuned model specifically for color detection
    'piyushpankajtechis/color-detection',
    // CNN model dedicated to color classification
    'Rajaram1996/Convolutional_Neural_Network_Color_Classification',
    // Backup models with good color perception
    'google/vit-base-patch16-224',
    'facebook/dinov2-base'
  ];
  
  const results = [];
  const colorProbabilities = {};
  
  try {
    // Try the first dedicated color detection model
    const primaryResult = await hf.imageClassification({
      model: MODELS[0],
      data: imageData,
    });
    
    console.log('Primary color model results:', primaryResult);
    
    // Process and normalize results
    for (const prediction of primaryResult) {
      // Extract color from label (handles formats like "red", "color: red", etc.)
      const colorMatch = prediction.label.match(/(?:color:\s*)?(\w+)/i);
      if (colorMatch) {
        const color = colorMatch[1].toLowerCase();
        
        // Add to normalized color probabilities
        colorProbabilities[color] = (colorProbabilities[color] || 0) + prediction.score;
        
        results.push({
          color,
          probability: prediction.score,
          model: MODELS[0],
          originalLabel: prediction.label
        });
      }
    }
    
    // Also try the CNN color classifier for comparison
    try {
      const secondaryResult = await hf.imageClassification({
        model: MODELS[1],
        data: imageData,
      });
      
      console.log('Secondary color model results:', secondaryResult);
      
      // Process and add these results
      for (const prediction of secondaryResult) {
        const colorMatch = prediction.label.match(/(?:color:\s*)?(\w+)/i);
        if (colorMatch) {
          const color = colorMatch[1].toLowerCase();
          
          // Add to normalized color probabilities with lower weight (0.8)
          colorProbabilities[color] = (colorProbabilities[color] || 0) + (prediction.score * 0.8);
          
          results.push({
            color,
            probability: prediction.score,
            model: MODELS[1],
            originalLabel: prediction.label
          });
        }
      }
    } catch (secondaryError) {
      console.warn('Secondary color model failed:', secondaryError);
    }
    
    // Convert probabilities to sorted array
    const sortedColors = Object.entries(colorProbabilities)
      .map(([color, probability]) => ({ 
        name: color,
        probability,
        rgb: getApproximateRGB(color)
      }))
      .sort((a, b) => b.probability - a.probability);
    
    return {
      dominantColor: sortedColors[0]?.name || 'unknown',
      confidence: sortedColors[0]?.probability || 0,
      colorProbabilities: sortedColors,
      rawResults: results
    };
    
  } catch (error) {
    console.error('Advanced color detection error:', error);
    
    // Fallback to a more general image classifier
    try {
      const fallbackResult = await hf.imageClassification({
        model: MODELS[2],  // Use google/vit as fallback
        data: imageData,
      });
      
      // Extract any color terms from the general classifier
      const colorTerms = extractColorTerms(fallbackResult);
      
      return {
        dominantColor: colorTerms[0]?.name || 'unknown',
        confidence: colorTerms[0]?.probability || 0,
        colorProbabilities: colorTerms,
        rawResults: fallbackResult,
        usingFallback: true
      };
    } catch (fallbackError) {
      console.error('Fallback color detection failed:', fallbackError);
      return {
        dominantColor: 'unknown',
        confidence: 0,
        colorProbabilities: [],
        error: error.message
      };
    }
  }
}

// Helper to extract color terms from general classification results
function extractColorTerms(results) {
  const colorKeywords = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
    'pink', 'brown', 'black', 'white', 'gray', 'grey'
  ];
  
  const colorTerms = [];
  
  for (const result of results) {
    const label = result.label.toLowerCase();
    
    for (const color of colorKeywords) {
      if (label.includes(color)) {
        colorTerms.push({
          name: color,
          probability: result.score,
          rgb: getApproximateRGB(color)
        });
        break;
      }
    }
  }
  
  return colorTerms.sort((a, b) => b.probability - a.probability);
}

// Helper to get approximate RGB values for common colors
function getApproximateRGB(colorName) {
  const colorMap = {
    'red': [255, 0, 0],
    'blue': [0, 0, 255],
    'green': [0, 128, 0],
    'yellow': [255, 255, 0],
    'orange': [255, 165, 0],
    'purple': [128, 0, 128],
    'pink': [255, 192, 203],
    'brown': [165, 42, 42],
    'black': [0, 0, 0],
    'white': [255, 255, 255],
    'gray': [128, 128, 128],
    'grey': [128, 128, 128]
  };
  
  return colorMap[colorName] || [128, 128, 128];
}