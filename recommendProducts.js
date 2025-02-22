require('dotenv').config();
const admin = require('firebase-admin');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const similarity = require('similarity');
const fetch = require('node-fetch');
const serviceAccount = require('../campus-connect-c56a9-firebase-adminsdk-q5s6w-215b71dd91.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();

// Add this at the top of your file after the imports
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

// First, let's add a function to get a sample product ID
async function getSampleProductId() {
  try {
    const snapshot = await db.collection('products').limit(1).get();
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    throw new Error('No products found in database');
  } catch (error) {
    console.error('Error getting sample product:', error);
    throw error;
  }
}

async function loadAndPreprocessImage(imageUrl) {
  try {
    // Download and resize image to consistent dimensions
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const preprocessedBuffer = await sharp(Buffer.from(buffer))
      .resize(224, 224) // ResNet standard input size
      .toBuffer();

    // Convert to tensor and normalize
    const tensor = tf.node.decodeImage(preprocessedBuffer, 3)
      .expandDims()
      .toFloat()
      .div(255.0);

    return tensor;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

async function extractImageFeatures(model, imageUrl) {
  const imageTensor = await loadAndPreprocessImage(imageUrl);
  if (!imageTensor) return null;
  
  // Get features from the second-to-last layer
  const features = model.predict(imageTensor);
  const featureArray = await features.data();
  
  // Cleanup
  imageTensor.dispose();
  features.dispose();
  
  return featureArray;
}

function calculateSimilarity(features1, features2) {
  if (!features1 || !features2) return 0;
  
  // Cosine similarity between feature vectors
  const dotProduct = features1.reduce((sum, a, i) => sum + a * features2[i], 0);
  const magnitude1 = Math.sqrt(features1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(features2.reduce((sum, a) => sum + a * a, 0));
  
  return dotProduct / (magnitude1 * magnitude2);
}

function calculateMetadataSimilarity(product1, product2) {
  const categoryScore = product1.category === product2.category ? 1 : 0;
  const collectionScore = product1.collection === product2.collection ? 1 : 0;
  const nameScore = similarity(product1.name, product2.name);
  
  return (categoryScore + collectionScore + nameScore) / 3;
}

// Add this function to validate image URLs
async function isValidImageUrl(url) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    return contentType.startsWith('image/');
  } catch (error) {
    console.error(`Invalid image URL: ${url}`);
    return false;
  }
}

async function getProductRecommendations(productId, limit = 5) {
  try {
    // Validate product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    const targetProduct = { id: productDoc.id, ...productDoc.data() };
    
    // Validate target product has an image URL
    if (!targetProduct.imageUrl || !(await isValidImageUrl(targetProduct.imageUrl))) {
      throw new Error(`Invalid or missing image URL for product ${productId}`);
    }

    // Load pre-trained MobileNet model
    const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    
    // Get all other products
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.id !== productId);
    
    // Extract features for target product
    const targetFeatures = await extractImageFeatures(model, targetProduct.imageUrl);
    
    // Calculate similarities and rank products
    const recommendations = await Promise.all(products.map(async product => {
      const imageFeatures = await extractImageFeatures(model, product.imageUrl);
      const imageSimilarity = calculateSimilarity(targetFeatures, imageFeatures);
      const metadataSimilarity = calculateMetadataSimilarity(targetProduct, product);
      
      // Combined similarity score (70% image, 30% metadata)
      const similarityScore = (imageSimilarity * 0.7) + (metadataSimilarity * 0.3);
      
      return {
        ...product,
        similarityScore
      };
    }));
    
    // Sort by similarity score and return top recommendations
    return recommendations
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error in getProductRecommendations:', error);
    throw error;
  }
}

// Modified main function for testing
async function main() {
  try {
    // First get all products to verify data
    const productsSnapshot = await db.collection('products').get();
    console.log(`Total products in database: ${productsSnapshot.size}`);
    
    // Get a sample product ID
    const sampleProductId = await getSampleProductId();
    console.log('Testing with product ID:', sampleProductId);
    
    // Get the sample product details
    const sampleProduct = await db.collection('products').doc(sampleProductId).get();
    console.log('Sample product:', {
      id: sampleProduct.id,
      name: sampleProduct.data().name,
      category: sampleProduct.data().category,
      imageUrl: sampleProduct.data().imageUrl
    });

    // Get recommendations for the sample product
    console.log('Fetching recommendations...');
    const recommendations = await getProductRecommendations(sampleProductId);
    
    console.log('\nRecommendations:');
    recommendations.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.name}`);
      console.log(`   Similarity Score: ${product.similarityScore.toFixed(2)}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Collection: ${product.collection}`);
      console.log(`   Image URL: ${product.imageUrl}`);
    });
    
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    // Clean up Firebase connection
    await admin.app().delete();
  }
}

// Run the script
main(); 