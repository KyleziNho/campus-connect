'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { Star, Edit, Camera, Package } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useUser();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  // Local state for profile editing
  const [bio, setBio] = useState("This is your bio. You can edit it to tell others more about you.");
  const [editing, setEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio);
  const [profilePicture, setProfilePicture] = useState(user?.photoURL || "/default-profile-pic.jpg"); // Use a default if no profile pic

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = () => {
    setBio(newBio);
    setEditing(false);
  };

  const handleProfilePictureChange = (e) => {
    // Logic to upload and change profile picture
    const newProfilePictureUrl = URL.createObjectURL(e.target.files[0]);
    setProfilePicture(newProfilePictureUrl);
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg mt-8`}>
      {/* Profile Picture Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full cursor-pointer">
              <Camera className="text-white w-4 h-4" />
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePictureChange}
              />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || user?.email}</h2>
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 w-5 h-5" />
              <span>4.8 (150 reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Bio</h3>
        {editing ? (
          <div className="mt-2">
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              rows="4"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-gray-500">{bio}</p>
        )}
        {!editing && (
          <button
            onClick={handleEditClick}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Bio
          </button>
        )}
      </div>

      {/* Link to Selling Hub */}
      <button
        onClick={() => router.push('/selling-hub')}
        className="mt-6 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
      >
        <Package className="w-5 h-5" />
        Go to Selling Hub
      </button>
    </div>
  );
};

export default ProfilePage;
