'use client'
import React, { useState } from 'react';
import { X, Package, Ticket, Laptop, Store } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import imageCompression from 'browser-image-compression';

const defaultCategories = [
  { id: 'clothes', icon: Package, label: 'Clothes' },
  { id: 'tickets', icon: Ticket, label: 'Tickets' },
  { id: 'electronics', icon: Laptop, label: 'Electronics' },
  { id: 'kitchen', icon: Store, label: 'Kitchen' },
  { id: 'other', icon: Package, label: 'Other' }
];

const CreateProductModal = ({
  isDarkMode,
  onClose,
  onSubmit,
  newProduct,
  setNewProduct,
  handleImageChange,
  isUploading,
  categories = defaultCategories
}) => {
  const [compressionStatus, setCompressionStatus] = useState('');

  const handleImageChangeWithCompression = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      setCompressionStatus('Compressing image...');

      const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1024, // Max width/height in pixels
        useWebWorker: true,
        fileType: 'image/jpeg' // Convert all images to JPEG
      };

      const compressedFile = await imageCompression(file, options);
      
      // Log compression results
      console.log('Original file size:', file.size / 1024 / 1024, 'MB');
      console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');
      
      setCompressionStatus('');
      handleImageChange({ target: { files: [compressedFile] } });
    } catch (error) {
      console.error('Error compressing image:', error);
      setCompressionStatus('Error compressing image. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Listing
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChangeWithCompression}
              className={`w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              required
            />
            {compressionStatus && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {compressionStatus}
              </p>
            )}
          </div>

          {/* Rest of the form remains the same */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category *
            </label>
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Name
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Price (£)
            </label>
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Collection Point
            </label>
            <select
              value={newProduct.collection}
              onChange={(e) => setNewProduct({...newProduct, collection: e.target.value})}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              <option value="Campus">Campus</option>
              <option value="City">City</option>
              <option value="Oldfield Park">Oldfield Park</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? <LoadingSpinner className="w-6 h-6" /> : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;