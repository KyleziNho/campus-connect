'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import DarkModeButton from '@/components/buttons/DarkModeButton';
import { useDarkMode } from '@/context/DarkModeContext';
import CartButton from '@/components/buttons/CartButton';
import FavoritesButton from '@/components/buttons/FavoritesButton';
import ProfileMenu from '@/components/ProfileMenu';
import { useShopping } from '@/context/ShoppingContext';
import FavoritesDropdown from '@/components/FavoritesDropdown';
import CartDropdown from '@/components/CartDropdown';

export default function Header() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { cartItems, favoriteItems, showFavorites, setShowFavorites } = useShopping();

  const handleFavoritesClick = () => {
    setShowFavorites(!showFavorites);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  return (
    <>
      <header className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center flex-grow cursor-pointer"
              onClick={() => router.push('/')}
              style={{ maxWidth: '66.666%' }}
            >
              <Leaf className="w-8 h-8 text-green-500" />
              <div className="ml-2">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Campus Connect
                </h1>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  University of Bath
                </div>
              </div>
              <p className={`text-sm hidden md:block ml-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Shop Sustainably 🌱 Collect Instantly ⚡
              </p>
            </div>

            <div className="flex items-center gap-4">
              <DarkModeButton 
                isDarkMode={isDarkMode} 
                toggleDarkMode={toggleDarkMode}
              />
              <FavoritesButton 
                isDarkMode={isDarkMode}
                favoriteCount={favoriteItems.length}
                onClick={handleFavoritesClick}
              />
              <CartButton 
                isDarkMode={isDarkMode}
                cartCount={cartItems.length}
                onClick={handleCartClick}
              />
              <ProfileMenu 
                isDarkMode={isDarkMode} 
                router={router}
              />
            </div>
          </div>
        </div>
      </header>
      <FavoritesDropdown />
      <CartDropdown />
    </>
  );
}