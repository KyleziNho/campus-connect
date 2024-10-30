'use client'
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';

const DarkModeButton = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors ${
        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-white" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default DarkModeButton;