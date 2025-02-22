'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDarkMode } from '@/context/DarkModeContext';
import { useUser } from '@/context/UserContext';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { MessageSquare, MapPin } from 'lucide-react';
import RecommendedProducts from '@/components/RecommendedProducts';

export default function ProductPage({ params }) {
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      try {
        if (!productId) return;
        
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() };
          setProduct(productData);
          
          const sellerDoc = await getDoc(doc(db, 'users', productData.userId));
          if (sellerDoc.exists()) {
            setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
          } else {
            setSeller({
              id: productData.userId,
              displayName: productData.userName || 'Anonymous User',
              photoURL: '/placeholder-avatar.jpg',
              createdAt: productData.createdAt || new Date().toISOString()
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchProductAndSeller();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  const isOwnProduct = user?.uid === product.userId;
  const profileLink = isOwnProduct ? '/profile' : `/user/${seller?.id}`;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Image gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                £{Number(product.price).toFixed(2)}
              </p>
            </div>

            {/* Collection Location */}
            <div className="flex gap-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <MapPin className="w-4 h-4 mr-2" />
                {product.collection || 'Collection location not specified'}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {product.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Link href={profileLink} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <div className="relative w-12 h-12">
                  <Image
                    src={seller?.photoURL || '/placeholder-avatar.jpg'}
                    alt={seller?.displayName || 'Anonymous User'}
                    fill
                    className="rounded-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{seller?.displayName}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {new Date(seller?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              {/* Message Button */}
              {user && !isOwnProduct && (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Seller
                </button>
              )}
            </div>

            {/* Views */}
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {product.views || 0} views
            </div>
          </div>
        </div>
      </div>

      {/* Add similar products section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendedProducts currentProductId={params.id} />
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-bold mb-4">Message Feature Coming Soon</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              The messaging feature is currently under development.
            </p>
            <button
              onClick={() => setShowMessageModal(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';