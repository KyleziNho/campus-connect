'use client'
import TestImageClassification from '@/components/TestImageClassification';
import { useDarkMode } from '@/context/DarkModeContext';

export default function TestPage() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto py-8">
        <TestImageClassification />
      </div>
    </div>
  );
} 