'use client'
import React from 'react';
import { X, Heart } from 'lucide-react';
import { useShopping } from '@/context/ShoppingContext';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';
import Link from 'next/link';

const FavoritesDropdown = () => {
  const { isDarkMode } = useDarkMode();
  const { favoriteItems, showFavorites, setShowFavorites, toggleFavorite } = useShopping();

  if (!showFavorites) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowFavorites(false)} />
      <div className={`relative w-full max-w-sm p-4 overflow-auto max-h-[80vh] ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Favorites ({favoriteItems.length})</h2>
          <button onClick={() => setShowFavorites(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {favoriteItems.length === 0 ? (
          <p className="text-center py-4">No items in favorites</p>
        ) : (
          <div className="space-y-4">
            {favoriteItems.map(item => (
              <div key={item.id} className={`flex gap-4 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Link href={`/product/${item.id}`} className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.imageUrl || '/placeholder-image.jpg'}
                    alt={item.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-blue-600">£{item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => toggleFavorite(item)} className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}>
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesDropdown;