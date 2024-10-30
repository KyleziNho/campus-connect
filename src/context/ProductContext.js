'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useUser } from './UserContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const { user } = useUser();

  // Listen to all products
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productData);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user's products
  useEffect(() => {
    if (!user) {
      setUserProducts([]);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserProducts(productData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ProductContext.Provider value={{ products, userProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}