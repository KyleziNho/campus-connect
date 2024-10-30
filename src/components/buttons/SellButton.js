'use client'
import React from 'react';
import { Package } from 'lucide-react';

const SellButton = () => {
  return (
    <button className="fixed bottom-6 right-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
      <Package className="w-5 h-5" />
      Sell Something
    </button>
  );
};

export default SellButton;