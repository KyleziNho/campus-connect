'use client'
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useShopping } from '@/context/ShoppingContext';
import { useDarkMode } from '@/context/DarkModeContext';

const CartDropdown = () => {
  const { isDarkMode } = useDarkMode();
  const { 
    cartItems, 
    showCart, 
    setShowCart, 
    removeFromCart,
    cartTotal 
  } = useShopping();

  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setShowCart(false)}
      />
      <div className={`absolute right-0 top-0 h-full w-96 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Shopping Cart ({cartItems.length})
          </h2>
          <button onClick={() => setShowCart(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {cartItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <Image
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
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Total:
                </span>
                <span className="text-lg font-bold text-blue-500">
                  £{cartTotal.toFixed(2)}
                </span>
              </div>
              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  console.log('Proceeding to checkout...');
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;