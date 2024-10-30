'use client'
import React from 'react';
import { Grid, LayoutGrid } from 'lucide-react';

const GridToggleButton = ({ isDarkMode, isLargeGrid, toggleGrid }) => {
  return (
    <button
      onClick={toggleGrid}
      className={`p-2 rounded-lg transition-colors ${
        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      title={isLargeGrid ? "Switch to 2-column layout" : "Switch to 4-column layout"}
    >
      {isLargeGrid ? (
        <LayoutGrid className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
      ) : (
        <Grid className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
      )}
    </button>
  );
};

export default GridToggleButton;