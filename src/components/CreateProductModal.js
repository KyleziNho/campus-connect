'use client'
import React, { useState } from 'react';
import { X, Package, Ticket, Laptop, Store } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import imageCompression from 'browser-image-compression';
import { classifyImage } from '@/utils/imageClassification';
import Image from 'next/image';

const defaultCategories = [
  { id: 'clothes', icon: Package, label: 'Clothes' },
  { id: 'tickets', icon: Ticket, label: 'Tickets' },
  { id: 'electronics', icon: Laptop, label: 'Electronics' },
  { id: 'kitchen', icon: Store, label: 'Kitchen' },
  { id: 'other', icon: Package, label: 'Other' }
];

// More detailed clothing categories
const clothingCategories = [
  { id: 'shirt', label: 'Shirt/Top' },
  { id: 'tshirt', label: 'T-Shirt' },
  { id: 'blouse', label: 'Blouse' },
  { id: 'hoodie', label: 'Hoodie/Sweater' },
  { id: 'sweatshirt', label: 'Sweatshirt' },
  { id: 'jacket', label: 'Jacket/Coat' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'pants', label: 'Pants/Trousers' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'skirt', label: 'Skirt' },
  { id: 'dress', label: 'Dress' },
  { id: 'shoes', label: 'Shoes/Footwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'bag', label: 'Bag/Backpack' },
  { id: 'hat', label: 'Hat/Cap' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'scarf', label: 'Scarf/Gloves' }
];

// Color options
const colorOptions = [
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' },
  { id: 'green', label: 'Green' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'orange', label: 'Orange' },
  { id: 'purple', label: 'Purple' },
  { id: 'pink', label: 'Pink' },
  { id: 'brown', label: 'Brown' },
  { id: 'black', label: 'Black' },
  { id: 'white', label: 'White' },
  { id: 'gray', label: 'Gray' },
  { id: 'beige', label: 'Beige' },
  { id: 'multicolor', label: 'Multicolor' },
  { id: 'patterned', label: 'Patterned' },
  { id: 'unknown', label: 'Unknown' }
];

const CreateProductModal = ({
  isDarkMode,
  onClose,
  onSubmit,
  newProduct,
  setNewProduct,
  handleImageChange,
  isUploading,
  categories = defaultCategories,
  handleImageUrl
}) => {
  const [compressionStatus, setCompressionStatus] = useState('');
  const [classificationResult, setClassificationResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showDetailedCategories, setShowDetailedCategories] = useState(false);
  const [urlInputMode, setUrlInputMode] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChangeWithCompression = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      setCompressionStatus('Compressing image...');
      setIsClassifying(true);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };

      const compressedFile = await imageCompression(file, options);
      
      // Classify the image
      const classification = await classifyImage(compressedFile);
      setClassificationResult(classification);
      
      // Auto-set the category if confidence is high enough
      if (classification.confidence > 0.7) {
        // If it's a clothing item, show detailed categories
        if (['shirt', 'hoodie', 'jacket', 'pants', 'dress', 'shoes', 'accessories'].includes(classification.category)) {
          setShowDetailedCategories(true);
          setNewProduct(prev => ({
            ...prev,
            category: classification.category,
            color: classification.color || 'unknown'
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            category: classification.category,
            color: classification.color || 'unknown'
          }));
        }
      }
      
      setCompressionStatus('');
      setIsClassifying(false);
      handleImageChange({ target: { files: [compressedFile] } });
    } catch (error) {
      console.error('Error processing image:', error);
      setCompressionStatus('Error processing image. Please try again.');
      setIsClassifying(false);
    }
  };

  const handleUrlClassification = async () => {
    if (!imageUrl.trim()) return;

    try {
      setCompressionStatus('Processing URL...');
      setIsClassifying(true);
      
      // Check if it's a Vinted URL and extract the image URL
      let urlToClassify = imageUrl;
      
      if (imageUrl.includes('vinted.co.uk/items/')) {
        try {
          const response = await fetch(`/api/extract-image?url=${encodeURIComponent(imageUrl)}`);
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          urlToClassify = data.imageUrl;
          setImagePreview(urlToClassify);
        } catch (extractError) {
          setCompressionStatus('Error: Could not extract image from Vinted URL');
          setIsClassifying(false);
          return;
        }
      } else {
        setImagePreview(urlToClassify);
      }

      // Classify the image
      const classification = await classifyImage(urlToClassify, true);
      setClassificationResult(classification);
      
      // Auto-set the category if confidence is high enough
      if (classification.confidence > 0.7) {
        if (['shirt', 'hoodie', 'jacket', 'pants', 'dress', 'shoes', 'accessories'].includes(classification.category)) {
          setShowDetailedCategories(true);
          setNewProduct(prev => ({
            ...prev,
            category: classification.category,
            color: classification.color || 'unknown'
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            category: classification.category,
            color: classification.color || 'unknown'
          }));
        }
      }
      
      setCompressionStatus('');
      setIsClassifying(false);
      
      // Pass the URL to the parent component
      handleImageUrl(urlToClassify);
    } catch (error) {
      console.error('Error processing URL:', error);
      setCompressionStatus('Error processing URL. Please try again.');
      setIsClassifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-md p-6 rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <X className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        
        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          List a New Item
        </h2>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setUrlInputMode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                !urlInputMode ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Upload Image
            </button>
            <button 
              onClick={() => setUrlInputMode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                urlInputMode ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Use URL
            </button>
          </div>
          
          {!urlInputMode ? (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChangeWithCompression}
                className={`w-full rounded-lg p-2 border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required={!urlInputMode}
              />
              {compressionStatus && (
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {compressionStatus}
                </p>
              )}
              {isClassifying && (
                <div className="flex items-center mt-2">
                  <LoadingSpinner size="sm" />
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Analyzing image...
                  </span>
                </div>
              )}
              {classificationResult && (
                <div className={`mt-2 p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                    Detected: {classificationResult.category} 
                    {classificationResult.color !== 'unknown' && ` (${classificationResult.color})`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Image URL or Vinted Product URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL or Vinted product URL"
                  className={`flex-1 rounded-lg p-2 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required={urlInputMode}
                />
                <button
                  type="button"
                  onClick={handleUrlClassification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  disabled={isClassifying}
                >
                  Analyze
                </button>
              </div>
              {imagePreview && (
                <div className="mt-2 relative w-full h-40">
                  <Image 
                    src={imagePreview}
                    alt="Image preview"
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              {classificationResult && (
                <div className={`mt-2 p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={isDarkMode ? 'text-green-400' : 'text-green-600'}>
                    Detected: {classificationResult.category} 
                    {classificationResult.color !== 'unknown' && ` (${classificationResult.color})`}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={newProduct.category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setNewProduct({...newProduct, category: newCategory});
                setShowDetailedCategories(['shirt', 'hoodie', 'jacket', 'pants', 'dress', 'shoes', 'accessories'].includes(newCategory));
              }}
              className={`w-full rounded-lg p-2 border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            >
              {showDetailedCategories ? 
                clothingCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                )) :
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* Color selection - show for clothing items */}
          {(showDetailedCategories || ['shirt', 'hoodie', 'jacket', 'pants', 'dress', 'shoes', 'accessories'].includes(newProduct.category)) && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setNewProduct({...newProduct, color: color.id})}
                    className={`py-2 px-1 rounded-lg text-xs font-medium flex items-center justify-center ${
                      newProduct.color === color.id 
                        ? 'ring-2 ring-blue-500 ring-offset-1' 
                        : 'border border-gray-300'
                    } ${
                      color.id === 'red' ? 'bg-red-100 text-red-800' :
                      color.id === 'blue' ? 'bg-blue-100 text-blue-800' :
                      color.id === 'green' ? 'bg-green-100 text-green-800' :
                      color.id === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      color.id === 'orange' ? 'bg-orange-100 text-orange-800' :
                      color.id === 'purple' ? 'bg-purple-100 text-purple-800' :
                      color.id === 'pink' ? 'bg-pink-100 text-pink-800' :
                      color.id === 'brown' ? 'bg-amber-700 text-white' :
                      color.id === 'black' ? 'bg-gray-800 text-white' :
                      color.id === 'white' ? 'bg-white text-gray-800' :
                      color.id === 'gray' ? 'bg-gray-200 text-gray-800' :
                      color.id === 'beige' ? 'bg-amber-100 text-amber-800' :
                      color.id === 'multicolor' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white' :
                      color.id === 'patterned' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
          
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`mr-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                'List Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;