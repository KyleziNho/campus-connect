'use client'
import ImageClassifierTest from '@/components/ImageClassifierTest';
import { useDarkMode } from '@/context/DarkModeContext';

export default function TestPage() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto py-8">
        <ImageClassifierTest />
      </div>
    </div>
  );
} 