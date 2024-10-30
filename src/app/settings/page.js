'use client'
import { useDarkMode } from '@/context/DarkModeContext';
import { Settings, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className={`rounded-lg p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-4">Under Development</h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The settings page is currently under development. Check back soon for account management, 
            notification preferences, and privacy settings.
          </p>
        </div>
      </div>
    </div>
  );
}