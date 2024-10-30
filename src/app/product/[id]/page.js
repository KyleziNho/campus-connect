'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDarkMode } from '@/context/DarkModeContext';
import { useUser } from '@/context/UserContext';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Message, Heart, Package, Ticket, Laptop, Store } from 'lucide-react';

export default function ProductPage({ params }) {
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Categories configuration for icons
  const categoryIcons = {
    clothes: Package,
    tickets: Ticket,
    electronics: Laptop,
    kitchen: Store,
    other: Package
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params?.id) return;
        
        const productDoc = await getDoc(doc(db, 'products', params.id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

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

  const CategoryIcon = categoryIcons[product.category] || Package;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {/* Future image gallery placeholder */}
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
                £{product.price.toFixed(2)}
              </p>
            </div>

            {/* Category and Collection */}
            <div className="flex gap-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <CategoryIcon className="w-4 h-4 mr-2" />
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <MapPin className="w-4 h-4 mr-2" />
                {product.collection}
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
              <div className="flex items-center space-x-4">
                {/* Seller Avatar Placeholder */}
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} flex items-center justify-center`}>
                  <span className="text-lg font-bold">
                    {product.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{product.userName}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Message Button */}
              {user && user.uid !== product.userId && (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Message className="w-5 h-5" />
                  Message Seller
                </button>
              )}
            </div>

            {/* Views */}
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {product.views} views
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal Placeholder */}
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