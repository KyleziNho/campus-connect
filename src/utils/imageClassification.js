import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

// Simplified category mapping
const categoryMapping = {
  'clothing': 'clothes',
  'dress': 'clothes',
  'shirt': 'clothes',
  'pants': 'clothes',
  'jacket': 'clothes',
  'cap': 'clothes',
  'hat': 'clothes',
  'electronics': 'electronics',
  'laptop': 'electronics',
  'phone': 'electronics',
  'computer': 'electronics',
  'kitchen': 'kitchen',
  'appliance': 'kitchen',
  'cookware': 'kitchen',
  'ticket': 'tickets',
  'pass': 'tickets',
};

export async function classifyImage(imageFile) {
  try {
    // First, let's log what we're working with
    console.log('Starting classification for file:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });

    // Convert image to array buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    
    // Create Uint8Array from array buffer
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('Image processed, making API call...');

    // Make the API call
    const result = await hf.imageClassification({
      model: 'google/vit-base-patch16-224',  // Using a different model
      data: uint8Array,
    });

    console.log('API Response:', result);

    // Process results
    if (!Array.isArray(result)) {
      throw new Error('Unexpected API response format');
    }

    const topPrediction = result[0];
    const label = topPrediction.label.toLowerCase();

    // Find matching category
    let category = 'other';
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (label.includes(key)) {
        category = value;
        break;
      }
    }

    return {
      category,
      confidence: topPrediction.score,
      allPredictions: result.slice(0, 3),
      rawResponse: result
    };

  } catch (error) {
    console.error('Full error:', error);
    throw new Error(
      error.message.includes('token') 
        ? 'Please check your Hugging Face API key configuration.'
        : 'Failed to process image. Please try a different image or try again later.'
    );
  }
} 