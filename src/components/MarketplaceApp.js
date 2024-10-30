'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Heart, Package, Store, Ticket, Laptop, MapPin } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';
import { useShopping } from '@/context/ShoppingContext';
import { useUser } from '@/context/UserContext';
import { auth, db } from '@/config/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import LoginModal from './LoginModal';

const MarketplaceApp = () => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const { addToCart, toggleFavorite, favoriteItems, cartItems, removeFromCart } = useShopping();
  const { user } = useUser();
  
  // Local states
  const [isLargeGrid, setIsLargeGrid] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Categories definition
  const categories = [
    { id: 'all', icon: Package, label: 'All Items' },
    { id: 'clothes', icon: Package, label: 'Clothes' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'electronics', icon: Laptop, label: 'Electronics' },
    { id: 'kitchen', icon: Store, label: 'Kitchen' },
    { id: 'other', icon: Package, label: 'Other' }
  ];

  // Fetch products from Firebase
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter products based on active category and search query
  const filteredProducts = products
    .filter(product => 
      activeCategory === 'all' || product.category.toLowerCase() === activeCategory.toLowerCase()
    )
    .filter(product => 
      searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Categories */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 mt-4 lg:mt-0 overflow-x-auto lg:overflow-x-visible py-2 lg:py-0 scrollbar-hide">
              {categories.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center p-2 rounded-lg transition-all duration-300 ${
                    activeCategory === id 
                      ? 'bg-blue-600 text-white scale-105' 
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium ml-2 md:inline hidden">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Product Grid */}
        {!loading && (
          <div className={`grid gap-4 transition-all duration-300 ${
            isLargeGrid
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredProducts.map((product) => {
              const isInCart = cartItems.some(item => item.id === product.id);

              return (
                <Link href={`/product/${product.id}`} key={product.id}>
                  <div className="transform transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className={`h-full rounded-lg shadow-sm transition-all overflow-hidden ${
                      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    } hover:shadow-lg`}>
                      <div className="relative">
                        <Image 
                          src={product.imageUrl || '/placeholder-image.jpg'}
                          alt={product.name}
                          width={500}
                          height={300}
                          className="w-full h-48 object-cover"
                          unoptimized
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product);
                          }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow-md transition-colors ${
                            isDarkMode ? 'bg-gray-800/90 hover:bg-gray-700' : 'bg-white/90 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${
                            favoriteItems.some(item => item.id === product.id) ? 'text-red-500 fill-current' : ''
                          }`} />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <h3 className="font-medium text-sm mb-1.5">{product.name}</h3>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${
                          product.collection === 'Campus' ? 'bg-blue-100 text-blue-800' :
                          product.collection === 'City' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          <MapPin className="w-3 h-3 mr-1" />
                          {product.collection}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-base font-semibold">
                            £{product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isInCart ? removeFromCart(product.id) : addToCart(product);
                            }}
                            className={`px-2.5 py-1 text-sm rounded-lg transition-colors ${
                              isInCart 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isInCart ? 'In basket' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Sell Button */}
        <button 
          onClick={() => {
            if (user) {
              router.push('/selling-hub');
            } else {
              setShowLoginModal(true);
            }
          }}
          className="fixed bottom-6 right-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          Sell Something
        </button>

        {/* Login Modal */}
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    </div>
  );
};

export default MarketplaceApp;