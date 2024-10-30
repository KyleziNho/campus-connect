'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { db, storage } from '@/config/firebaseConfig';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Star, Package, School, MapPin, Edit2, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function ProfilePage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    university: '',
    instagram: ''
  });

  useEffect(() => {
    const fetchProfileAndListings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Create user document if it doesn't exist
        const userRef = doc(db, 'users', user.uid);
        const defaultProfile = {
          id: user.uid,
          displayName: user.displayName || 'New User',
          photoURL: user.photoURL || '/placeholder-avatar.jpg',
          university: '',
          instagram: '',
          rating: 0,
          ratingCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(userRef, defaultProfile, { merge: true });
        setProfile(defaultProfile);
        setEditForm({
          displayName: user.displayName || '',
          university: '',
          instagram: ''
        });

        // Fetch listings
        const listingsQuery = query(
          collection(db, 'products'),
          where('userId', '==', user.uid)
        );
        const listingsSnap = await getDocs(listingsQuery);
        const listingsData = listingsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      
      setLoading(false);
    };

    fetchProfileAndListings();
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      let photoURL = profile?.photoURL;

      if (imageFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(imageFile, options);
        
        const imageRef = ref(storage, `profiles/${user.uid}/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, compressedFile);
        photoURL = await getDownloadURL(uploadResult.ref);
      }

      const updateData = {
        ...editForm,
        photoURL,
        updatedAt: new Date().toISOString()
      };

      await setDoc(userRef, updateData, { merge: true });

      setProfile(prev => ({
        ...prev,
        ...updateData
      }));

      setShowEditModal(false);
      setImageFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-8`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture with Edit Button */}
            <div className="relative">
              <div className="relative w-32 h-32">
                <Image
                  src={profile?.photoURL || '/placeholder-avatar.jpg'}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
                {user?.uid === profile?.id && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile?.displayName}</h1>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  <span>{profile?.university || 'Add your university'}</span>
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
                  <span>{profile?.rating || '0'} ({profile?.ratingCount || '0'} ratings)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-2xl font-bold mb-4">Listed Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {listings.map((product) => (
            <div key={product.id} 
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
            >
              <div className="relative">
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image 
                    src={product.imageUrl || '/placeholder-image.jpg'}
                    alt={product.name}
                    width={500}
                    height={300}
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                    unoptimized
                  />
                </div>
                
                {/* Status Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-medium text-sm">{product.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.collection}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Package className="w-3 h-3 mr-1" />
                    {product.category}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-base">
                    £{product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.views} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  className={`w-full rounded-lg p-2 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">University</label>
                <input
                  type="text"
                  value={editForm.university}
                  onChange={(e) => setEditForm({...editForm, university: e.target.value})}
                  className={`w-full rounded-lg p-2 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instagram Username</label>
                <input
                  type="text"
                  value={editForm.instagram}
                  onChange={(e) => setEditForm({...editForm, instagram: e.target.value})}
                  className={`w-full rounded-lg p-2 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}