'use client'
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';
import { useUser } from '@/context/UserContext';
import { db } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { Calendar, Clock, MapPin, MessageCircle, Package } from 'lucide-react';

export default function PurchasesPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.uid) return;

      try {
        // Get purchases
        const purchasesQuery = query(
          collection(db, 'purchases'),
          where('buyerId', '==', user.uid)
        );
        const purchasesSnap = await getDocs(purchasesQuery);
        const purchasesData = purchasesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get product details for each purchase
        const enrichedPurchases = await Promise.all(purchasesData.map(async (purchase) => {
          const productDoc = await getDocs(doc(db, 'products', purchase.productId));
          return {
            ...purchase,
            product: { id: productDoc.id, ...productDoc.data() }
          };
        }));

        setPurchases(enrichedPurchases);
        setLoading(false);

        // Update product status to 'sold'
        enrichedPurchases.forEach(async (purchase) => {
          const productRef = doc(db, 'products', purchase.productId);
          await updateDoc(productRef, { status: 'sold' });
        });
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const groupPurchasesByDate = () => {
    return purchases.reduce((groups, purchase) => {
      const date = new Date(purchase.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(purchase);
      return groups;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedPurchases = groupPurchasesByDate();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>

        {Object.entries(groupedPurchases).map(([date, datePurchases]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{date}</h2>
            <div className="space-y-4">
              {datePurchases.map((purchase) => (
                <div 
                  key={purchase.id}
                  className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <Image
                        src={purchase.product.imageUrl || '/placeholder-image.jpg'}
                        alt={purchase.product.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                        unoptimized
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">{purchase.product.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{purchase.collectionDetails.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{purchase.collectionDetails.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{purchase.collectionDetails.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>£{purchase.product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Seller: </span>
                          <span className="font-medium">{purchase.product.userName}</span>
                        </div>
                        <button 
                          onClick={() => window.open(`/messages/${purchase.product.userId}`, '_blank')}
                          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message Seller
                        </button>
                      </div>
                      {purchase.collectionDetails.notes && (
                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Notes: {purchase.collectionDetails.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {purchases.length === 0 && (
          <div className={`rounded-lg p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Items you purchase will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}