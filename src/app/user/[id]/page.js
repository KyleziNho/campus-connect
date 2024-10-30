'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { db } from '@/config/firebaseConfig';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Star, Package, School } from 'lucide-react';

export default function UserProfilePage({ params }) {
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const userId = React.use(params).id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchProfileAndListings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({ id: userDoc.id, ...userData });
        }

        const listingsQuery = query(
          collection(db, 'products'),
          where('userId', '==', userId)
        );
        const listingsSnap = await getDocs(listingsQuery);
        const listingsData = listingsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      setLoading(false);
    };

    fetchProfileAndListings();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-8`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative w-32 h-32">
              <Image
                src={profile?.photoURL || '/placeholder-avatar.jpg'}
                alt="Profile"
                width={128}
                height={128}
                className="rounded-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {profile?.displayName}
              </h1>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  <span>{profile?.university || 'University not specified'}</span>
                </div>

                {profile?.instagram && (
                  <Link
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-500 hover:text-pink-600"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>@{profile.instagram}</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="w-5 h-5" />
                  <span>
                    {profile?.rating || '0'} ({profile?.ratingCount || '0'} ratings)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-2xl font-bold mb-4">Listed Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {listings.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}>
                <div className="relative w-full h-48">
                  <Image
                    src={product.imageUrl || '/placeholder-image.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>£{product.price.toFixed(2)}</span>
                    <span>{product.views} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';