'use client'
import React, { useState } from 'react';
import { classifyImage } from '@/utils/imageClassification';
import Image from 'next/image';

export default function TestImageClassification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

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
      setRawResponse(classification.allPredictions);

    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Image Classification Test Tool</h2>
      
      {/* Image Upload Section */}
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-blue-600 font-bold animate-pulse">
          🔄 Analyzing image with Hugging Face API...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          ❌ Error: {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-4">
          {/* Main Classification Result */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800">✅ Classification Complete!</h3>
            <p className="text-lg mt-2">
              <span className="font-bold">Detected Category:</span>{' '}
              <span className="text-green-600">{result.category}</span>
            </p>
            <p>
              <span className="font-bold">Confidence:</span>{' '}
              <span className="text-green-600">{Math.round(result.confidence * 100)}%</span>
            </p>
          </div>

          {/* Raw Predictions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">All Model Predictions:</h4>
            <ul className="space-y-1">
              {result.allPredictions?.map((pred, i) => (
                <li key={i} className="flex justify-between">
                  <span>{pred.label}</span>
                  <span className="font-mono">{(pred.score * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 