'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';
import { useShopping } from '@/context/ShoppingContext';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore';

const RecommendedProducts = ({ currentProductId = null }) => {
  const { isDarkMode } = useDarkMode();
  const { toggleFavorite, favoriteItems, addToCart, cartItems, removeFromCart } = useShopping();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // If we're on a product page, use that product as the reference
        let referenceProductId = currentProductId;
        
        // If we're not on a product page, get the most recently viewed product
        if (!referenceProductId) {
          const recentViewsQuery = query(collection(db, 'products'));
          const snapshot = await getDocs(recentViewsQuery);
          if (!snapshot.empty) {
            referenceProductId = snapshot.docs[0].id;
          }
        }

        if (!referenceProductId) {
          setLoading(false);
          return;
        }

        // Get the reference product
        const productDoc = await getDoc(doc(db, 'products', referenceProductId));
        if (!productDoc.exists()) {
          setLoading(false);
          return;
        }

        const referenceProduct = { id: productDoc.id, ...productDoc.data() };

        // Get all products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== referenceProductId);

        // Calculate similarity scores
        const recommendedProducts = products.map(product => {
          // Simple metadata-based similarity
          const categoryScore = product.category === referenceProduct.category ? 1 : 0;
          const collectionScore = product.collection === referenceProduct.collection ? 1 : 0;
          const similarityScore = (categoryScore + collectionScore) / 2;

          return {
            ...product,
            similarityScore
          };
        });

        // Sort and get top 5 recommendations
        const topRecommendations = recommendedProducts
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 5);

        setRecommendations(topRecommendations);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Recommended For You
      </h2>
      <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recommendations.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <div className={`${
                isDarkMode ? 'bg-gray-700' : 'bg-white'
              } rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
                <div className="relative">
                  <div className="relative w-full pt-[100%]">
                    <Image
                      src={product.imageUrl || '/placeholder-image.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full ${
                      isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'
                    } backdrop-blur-sm`}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${
                      favoriteItems.some(item => item.id === product.id) ? 'text-red-500 fill-current' : 'text-white'
                    }`} />
                  </button>
                </div>
                <div className="p-2.5">
                  <h3 className={`font-medium text-sm mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </h3>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${
                    product.collection === 'Campus' ? 'bg-blue-100 text-blue-800' :
                    product.collection === 'City' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.collection}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      £{product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isInCart = cartItems.some(item => item.id === product.id);
                        isInCart ? removeFromCart(product.id) : addToCart(product);
                      }}
                      className={`px-2.5 py-1 text-sm rounded-lg transition-colors ${
                        cartItems.some(item => item.id === product.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {cartItems.some(item => item.id === product.id) ? 'In basket' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts; 