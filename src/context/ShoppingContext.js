'use client'
import React, { createContext, useContext, useState } from 'react';

const ShoppingContext = createContext();

export function ShoppingProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const toggleFavorite = (product) => {
    setFavoriteItems(prev => 
      prev.some(item => item.id === product.id)
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product]
    );
  };

  // Calculate total price
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <ShoppingContext.Provider value={{
      cartItems,
      favoriteItems,
      showFavorites,
      showCart,
      cartTotal,
      setShowFavorites,
      setShowCart,
      addToCart,
      removeFromCart,
      toggleFavorite,
    }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
}