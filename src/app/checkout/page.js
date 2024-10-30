'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/context/DarkModeContext';
import { useShopping } from '@/context/ShoppingContext';
import { db } from '@/config/firebaseConfig';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { MapPin, AlertTriangle, Clock, Calendar, MessageCircle, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { cartItems, cartTotal, clearCart } = useShopping();
  const [expandedItem, setExpandedItem] = useState(null);
  const [collectionDetails, setCollectionDetails] = useState(
    cartItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: {
        location: '',
        date: '',
        time: '',
        notes: '',
        confirmed: false
      }
    }), {})
  );
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your basket is empty</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore our marketplace to find great items
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const allConfirmed = Object.values(collectionDetails)
      .every(details => details.confirmed);
    if (!allConfirmed) {
      alert('Please confirm collection details for all items');
      return;
    }
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = async () => {
    try {
      await Promise.all(cartItems.map(async (item) => {
        // Create purchase record
        await addDoc(collection(db, 'purchases'), {
          productId: item.id,
          buyerId: user.uid,
          sellerId: item.userId,
          createdAt: new Date().toISOString(),
          collectionDetails: collectionDetails[item.id],
          status: 'pending'
        });

        // Update product status
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          status: 'sold'
        });
      }));

      clearCart();
      router.push('/purchases');
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  const updateItemDetails = (itemId, field, value) => {
    setCollectionDetails(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Items List */}
        <div className="space-y-4">
          {cartItems.map(item => (
            <div 
              key={item.id} 
              className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {/* Item Summary */}
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.imageUrl || '/placeholder-image.jpg'}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                    unoptimized
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-blue-500">£{item.price.toFixed(2)}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Seller: {item.userName}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {expandedItem === item.id ? 
                      <ChevronUp className="w-5 h-5" /> : 
                      <ChevronDown className="w-5 h-5" />
                    }
                  </button>
                </div>

                {/* Collection Status */}
                <div className="mt-2 flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    collectionDetails[item.id]?.confirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {collectionDetails[item.id]?.confirmed ? 'Collection Arranged' : 'Needs Arrangement'}
                  </div>
                </div>
              </div>

              {/* Collection Details Form */}
              {expandedItem === item.id && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Collection Location</label>
                      <input
                        type="text"
                        value={collectionDetails[item.id]?.location}
                        onChange={(e) => updateItemDetails(item.id, 'location', e.target.value)}
                        className={`w-full rounded-lg p-2 border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                          type="date"
                          value={collectionDetails[item.id]?.date}
                          onChange={(e) => updateItemDetails(item.id, 'date', e.target.value)}
                          className={`w-full rounded-lg p-2 border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <input
                          type="time"
                          value={collectionDetails[item.id]?.time}
                          onChange={(e) => updateItemDetails(item.id, 'time', e.target.value)}
                          className={`w-full rounded-lg p-2 border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        value={collectionDetails[item.id]?.notes}
                        onChange={(e) => updateItemDetails(item.id, 'notes', e.target.value)}
                        className={`w-full rounded-lg p-2 border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        rows={2}
                      />
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`confirm-${item.id}`}
                        checked={collectionDetails[item.id]?.confirmed}
                        onChange={(e) => updateItemDetails(item.id, 'confirmed', e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor={`confirm-${item.id}`} className="text-sm">
                        I have messaged the seller and confirmed these collection details
                      </label>
                    </div>

                    <button
                      onClick={() => window.open(`/messages/${item.userId}`, '_blank')}
                      className="w-full py-2 mt-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message Seller
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">Total:</span>
            <span className="text-xl font-bold text-blue-500">£{cartTotal.toFixed(2)}</span>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No added fees - This is a student project
          </p>
          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Purchase
          </button>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-bold mb-4">Final Confirmation</h2>
            <p className="mb-6">Have you confirmed all collection details with the sellers?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalConfirm(false)}
                className={`flex-1 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Review Details
              </button>
              <button
                onClick={() => router.push('/purchases')}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}