'use client'
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useShopping } from '@/context/ShoppingContext';
import { useDarkMode } from '@/context/DarkModeContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CartDropdown = () => {
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const { cartItems, showCart, setShowCart, removeFromCart, cartTotal } = useShopping();

  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
      <div className={`relative w-full max-w-sm p-4 overflow-auto max-h-[80vh] ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Shopping Cart ({cartItems.length})</h2>
          <button onClick={() => setShowCart(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center py-4">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {cartItems.map(item => (
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
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">£{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  router.push('/checkout');
                  setShowCart(false);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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