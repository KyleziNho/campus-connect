'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { auth } from '@/config/firebaseConfig';
import LoginModal from './LoginModal';
import { signOut } from 'firebase/auth';

const ProfileMenu = () => {
  const router = useRouter();
  const { user } = useUser();
  const { isDarkMode } = useDarkMode();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getMenuItems = () => {
    if (!user) {
      return [
        { name: 'Login', action: () => setIsLoginModalOpen(true) }
      ];
    }
  
    return [
      { name: user.displayName || user.email, action: () => router.push('/profile') },
      { name: 'Selling hub', action: () => router.push('/selling-hub') },
      { name: 'Purchases', action: () => router.push('/purchases') },
      { name: 'Settings', action: () => router.push('/settings') },
      { name: 'Resolution Centre', action: () => router.push('/resolution-centre') },
      { name: 'Logout', action: handleLogout }
    ];
  };
  
  const menuItems = getMenuItems();

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
        }`}
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <UserCircle 
          className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`}
          aria-hidden="true"
        />
      </button>

      {/* Profile Menu Dropdown */}
      {showMenu && (
        <div 
          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } overflow-hidden z-50 ring-1 ring-black ring-opacity-5`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action();
                setShowMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                isDarkMode 
                  ? 'text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } transition-colors ${
                item.name === 'Logout' ? 'text-red-500 hover:text-red-600' : ''
              }`}
              role="menuitem"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          console.log('Login successful');
          setIsLoginModalOpen(false);
          setShowMenu(false);
        }}
      />
    </div>
  );
};

export default ProfileMenu;