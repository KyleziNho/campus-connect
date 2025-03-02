'use client'
import React, { useState } from 'react';
import { classifyImage } from '@/utils/gptImageClassification';
import Image from 'next/image';

export default function TestImageClassification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [urlInputMode, setUrlInputMode] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Show selected image preview
      setSelectedImage(URL.createObjectURL(file));
      setLoading(true);
      setError(null);

      console.log('Starting classification for file:', file.name);
      const classification = await classifyImage(file);
      console.log('Classification complete:', classification);

      setResult(classification);
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlClassification = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Check if it's a Vinted URL and extract the image URL
      let urlToClassify = imageUrl;
      
      if (imageUrl.includes('vinted.co.uk/items/')) {
        // For Vinted URLs, we need to extract the actual image URL
        setError('Processing Vinted URL...');
        
        try {
          const response = await fetch(`/api/extract-image?url=${encodeURIComponent(imageUrl)}`);
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          urlToClassify = data.imageUrl;
          setSelectedImage(urlToClassify);
        } catch (extractError) {
          throw new Error(`Could not extract image from Vinted URL: ${extractError.message}`);
        }
      } else {
        // For direct image URLs
        setSelectedImage(urlToClassify);
      }

      console.log('Starting classification for URL:', urlToClassify);
      const classification = await classifyImage(urlToClassify, true);
      console.log('Classification complete:', classification);

      setResult(classification);
    } catch (err) {
      console.error('Error in handleUrlClassification:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Campus Connect Image Classifier</h2>
      
      {/* Toggle between file upload and URL input */}
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
      
      {/* Image Upload Section */}
      {!urlInputMode ? (
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL or Vinted product URL"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleUrlClassification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              disabled={loading}
            >
              Analyze
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Supports direct image URLs or Vinted product pages
          </p>
          
          {/* Example URLs */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Example URLs:</p>
            <div className="space-y-2">
              <button 
                onClick={() => setImageUrl('https://www.vinted.co.uk/items/5883670563-oneill-t-shirt')}
                className="text-xs text-blue-600 hover:underline block"
              >
                Vinted: O'Neill T-shirt
              </button>
              <button 
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1542291026-7eec264c27ff')}
                className="text-xs text-blue-600 hover:underline block"
              >
                Direct image: Red Nike Shoe
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="mb-4">
          <p className="font-bold mb-2">Selected Image:</p>
          <div className="relative w-full h-64">
            <Image 
              src={selectedImage}
              alt="Selected image"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-blue-600 font-bold animate-pulse">
          🔄 Analyzing image with OpenAI Vision...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          ❌ Error: {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="mt-4">
          <h3 className="font-bold text-lg mb-2">Classification Results:</h3>
          
          <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="font-bold mb-2">Product Details:</h4>
            
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full mr-2" 
                   style={{backgroundColor: result.color === 'red' ? 'rgb(239, 68, 68)' : 
                                            result.color === 'blue' ? 'rgb(59, 130, 246)' :
                                            result.color === 'green' ? 'rgb(34, 197, 94)' :
                                            result.color === 'yellow' ? 'rgb(234, 179, 8)' :
                                            result.color === 'purple' ? 'rgb(168, 85, 247)' :
                                            result.color === 'pink' ? 'rgb(236, 72, 153)' :
                                            result.color === 'orange' ? 'rgb(249, 115, 22)' :
                                            result.color === 'brown' ? 'rgb(120, 53, 15)' :
                                            result.color === 'black' ? 'rgb(0, 0, 0)' :
                                            result.color === 'white' ? 'rgb(255, 255, 255)' :
                                            result.color === 'gray' ? 'rgb(107, 114, 128)' : 
                                            result.color === 'multicolor' ? 'linear-gradient(45deg, red, blue, green)' : 
                                            'rgb(99, 102, 241)'}}
              />
              <span className="font-bold capitalize text-lg">{result.color} {result.objectDetected}</span>
            </div>
            
            {/* New Resale Information Section */}
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Resale Description</h4>
                {result.brand && result.brand !== "unknown" && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {result.brand}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-2">
                {result.resaleDescription || "No description available"}
              </p>
              
              {result.condition && (
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2">Condition:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    result.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                    result.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                    result.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.condition}
                  </span>
                </div>
              )}
            </div>
            
            {/* Color Candidates */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Color Analysis:</h4>
              <div className="space-y-2">
                {Array.isArray(result.colorCandidates) && result.colorCandidates.map((color, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                      <div 
                        className="h-3 rounded-full" 
                        style={{
                          width: `${Math.round(color.confidence * 100)}%`,
                          backgroundColor: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{backgroundColor: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`}}
                      />
                      <span className="font-medium capitalize">{color.name}</span>
                      <span className="text-sm ml-auto">
                        {Math.round(color.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Category:</h4>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {result.category}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 