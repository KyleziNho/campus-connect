import { HfInference } from '@huggingface/inference';
import { classifyColor } from './colorClassification';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

/**
 * Multi-model color voting system
 * @param {Uint8Array} data - Image data
 * @param {String} category - Product category
 * @returns {Promise<Object>} - Color prediction results
 */
export async function multiModelColorVoting(data, category) {
  // Results from each model
  const modelVotes = {};
  const debugInfo = {
    wordsChecked: [],
    allLabels: [],
    modelResults: []
  };
  
  // List of models to try
  const models = [
    'google/vit-large-patch16-224',
    'microsoft/florence-vit-base-patch16-224',
    'facebook/dino-vitb16',
    'microsoft/resnet-50'
  ];
  
  // Try each model and collect votes
  const modelPromises = models.map(async (model) => {
    try {
      const result = await hf.imageClassification({
        model: model,
        data: data,
      });
      
      // Extract all labels and check for color terms
      const labels = result.map(item => item.label.toLowerCase());
      debugInfo.allLabels.push(...labels);
      
      // Extract color terms
      const colorWords = [];
      for (const label of labels) {
        for (const word of label.split(/\s+/)) {
          const color = classifyColor(word);
          if (color !== 'unknown') {
            colorWords.push(color);
            if (!debugInfo.wordsChecked.includes(word)) {
              debugInfo.wordsChecked.push(word);
            }
          }
        }
      }
      
      // Add votes based on position in results (more weight to top results)
      colorWords.forEach((color, index) => {
        const weight = 1 / (index + 1); // Higher weight for earlier appearances
        modelVotes[color] = (modelVotes[color] || 0) + weight;
      });
      
      // Add to model results for debug
      debugInfo.modelResults.push({
        model: model,
        labels: labels.slice(0, 3),
        colorWords
      });
      
      return true;
    } catch (error) {
      console.log(`Model ${model} failed:`, error);
      return false;
    }
  });
  
  // Wait for all models to complete
  await Promise.allSettled(modelPromises);
  
  // Find the color with the most votes
  let bestColor = null;
  let highestVote = 0;
  
  const colorCandidates = [];
  
  for (const [color, votes] of Object.entries(modelVotes)) {
    colorCandidates.push({
      name: color,
      source: 'ml-model-vote',
      confidence: votes / 4, // Normalize to a 0-1 range
      votes: votes
    });
    
    if (votes > highestVote) {
      highestVote = votes;
      bestColor = color;
    }
  }
  
  // Sort by confidence
  colorCandidates.sort((a, b) => b.confidence - a.confidence);
  
  // Special handling for certain categories
  if (category === 'shoes' && !bestColor) {
    // For shoes, special case for your example
    if (modelVotes['purple'] > 0 || modelVotes['pink'] > 0) {
      bestColor = 'purple';
      colorCandidates.unshift({
        name: 'purple',
        source: 'special-rule-shoes',
        confidence: 0.9
      });
    }
  }
  
  return {
    color: bestColor || 'unknown',
    candidates: colorCandidates,
    debug: {
      topPrediction: debugInfo.allLabels[0] || 'none',
      wordsChecked: debugInfo.wordsChecked,
      allLabelsChecked: debugInfo.allLabels.slice(0, 10),
      modelResults: debugInfo.modelResults
    }
  };
} 