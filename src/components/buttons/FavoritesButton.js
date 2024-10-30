'use client'
import React from 'react';
import { Heart } from 'lucide-react';
import { useShopping } from '@/context/ShoppingContext';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';

const FavoritesButton = () => {
  const { isDarkMode } = useDarkMode();
  const { favoriteItems, setShowFavorites } = useShopping();

  return (
    <div className="relative">
      <button
        onClick={() => setShowFavorites(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {favoriteItems.length}
        </span>
      </button>
    </div>
  );
};

export default FavoritesButton;