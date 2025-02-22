require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../campus-connect-c56a9-firebase-adminsdk-q5s6w-215b71dd91.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();

function calculateSimilarity(product1, product2) {
    let score = 0;
    
    // Category match
    if (product1.category === product2.category) {
        score += 1;
    }
    
    // Collection match
    if (product1.collection === product2.collection) {
        score += 1;
    }
    
    // Price similarity (within 20% range)
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    if (priceDiff / avgPrice < 0.2) {
        score += 1;
    }
    
    return score / 3; // Normalize to 0-1 range
}

async function getRecommendations(targetProduct, products, limit = 2) {
    // Filter out the target product
    const otherProducts = products.filter(p => p.id !== targetProduct.id);
    
    // Calculate similarity scores
    const recommendations = otherProducts.map(product => ({
        ...product,
        similarityScore: calculateSimilarity(targetProduct, product)
    }));
    
    // Sort by similarity score and return top recommendations
    return recommendations
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
}

async function main() {
    try {
        // Get all products from Firebase
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Found ${products.length} products in database`);

        // Test with first product as target
        const targetProduct = products[0];
        console.log('\nTarget Product:');
        console.log(`Name: ${targetProduct.name}`);
        console.log(`Category: ${targetProduct.category}`);
        console.log(`Collection: ${targetProduct.collection}`);
        console.log(`Price: £${targetProduct.price}`);
        
        console.log('\nFinding recommendations...');
        const recommendations = await getRecommendations(targetProduct, products, 3);
        
        console.log('\nRecommendations:');
        recommendations.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   Similarity Score: ${product.similarityScore.toFixed(2)}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Collection: ${product.collection}`);
            console.log(`   Price: £${product.price}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await admin.app().delete();
    }
}

main(); 