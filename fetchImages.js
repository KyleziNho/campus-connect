require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../campus-connect-c56a9-firebase-adminsdk-q5s6w-215b71dd91.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function fetchProductImages() {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => doc.data());

    for (const product of products) {
      if (product.imageUrl) {
        console.log(`Product: ${product.name}, Image URL: ${product.imageUrl}`);
      } else {
        console.log(`Product: ${product.name} does not have an image URL.`);
      }
    }
  } catch (error) {
    console.error('Error fetching product images:', error);
  }
}

fetchProductImages(); 