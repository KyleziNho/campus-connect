'use client'
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Message, Package, Heart } from 'lucide-react';

const ProductPage = ({ params }) => {
  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode } = useDarkMode();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) {
        router.push('/');
        return;
      }

      try {
        const productRef = doc(db, 'products', params.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() });
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const isOwner = user && product.userId === user.uid;

  const handleEditClick = () => {
    if (isOwner) {
      router.push(`/edit/${product.id}`);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || '/placeholder-image.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Product Details */}
        <div className="mt-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.name}
          </h1>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            £{product.price.toFixed(2)}
          </p>

          {/* Category and Collection */}
          <div className="flex gap-4 mt-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <Package className="w-4 h-4 mr-2" />
              {product.category}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <MapPin className="w-4 h-4 mr-2" />
              {product.collection}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Description
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {product.description}
            </p>
          </div>

          {/* Seller Info */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center space-x-4">
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
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {isOwner ? (
              <>
                <button
                  onClick={handleEditClick}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  Edit Listing
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Message className="w-5 h-5" />
                  Message Seller
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg shadow hover:bg-gray-300 transition-colors">
                  Save for Later
                </button>
              </>
            )}
          </div>

          {/* Product Status */}
          <div className="mt-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              product.status === 'active' ? 'bg-green-100 text-green-800' :
              product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </div>
          </div>

          {/* Views */}
          <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {product.views} views
          </div>
        </div>
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
};

export default ProductPage;