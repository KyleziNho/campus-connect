'use client'
import React from 'react';
import { X, Heart } from 'lucide-react';
import { useShopping } from '@/context/ShoppingContext';
import { useDarkMode } from '@/context/DarkModeContext';

const FavoritesDropdown = () => {
  const { isDarkMode } = useDarkMode();
  const { favoriteItems, showFavorites, setShowFavorites, toggleFavorite } = useShopping();

  if (!showFavorites) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setShowFavorites(false)}
      />
      <div className={`absolute right-0 top-0 h-full w-80 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Favorites ({favoriteItems.length})
          </h2>
          <button onClick={() => setShowFavorites(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {favoriteItems.length === 0 ? (
          <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No items in favorites
          </p>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {favoriteItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h3>
                  <p className="text-blue-500">£{item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => toggleFavorite(item)}>
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
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