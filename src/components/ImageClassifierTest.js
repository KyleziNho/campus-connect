'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HfInference } from '@huggingface/inference';

const MONTHLY_LIMIT = 30000; // Free tier limit

export default function ImageClassifierTest() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    console.log('API Key loaded:', key ? `${key.substring(0, 8)}...` : 'not found');
    setApiKey(key);

    // Get current usage on load
    const currentMonth = new Date().getMonth();
    const storedMonth = localStorage.getItem('hfRequestMonth');
    const usage = storedMonth === currentMonth.toString()
      ? parseInt(localStorage.getItem('hfMonthlyRequests') || '0')
      : 0;
    setMonthlyUsage(usage);
  }, []);

  const updateUsageCounter = () => {
    const currentMonth = new Date().getMonth();
    const storedMonth = localStorage.getItem('hfRequestMonth');
    const monthlyRequests = storedMonth === currentMonth.toString()
      ? parseInt(localStorage.getItem('hfMonthlyRequests') || '0')
      : 0;

    const newCount = monthlyRequests + 1;
    localStorage.setItem('hfRequestMonth', currentMonth.toString());
    localStorage.setItem('hfMonthlyRequests', newCount.toString());
    setMonthlyUsage(newCount);
    return newCount;
  };

  const testImage = async (url) => {
    setLoading(true);
    setError(null);
    try {
      // Get current month's usage
      const currentMonth = new Date().getMonth();
      const storedMonth = localStorage.getItem('hfRequestMonth');
      const monthlyRequests = storedMonth === currentMonth.toString()
        ? parseInt(localStorage.getItem('hfMonthlyRequests') || '0')
        : 0;

      if (monthlyRequests >= MONTHLY_LIMIT) {
        throw new Error('Monthly request limit reached');
      }

      console.log('Starting image classification...');
      
      if (!apiKey) {
        throw new Error('Hugging Face API key not found');
      }

      // Initialize Hugging Face client
      const hf = new HfInference(apiKey);

      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('Image fetched and converted, sending to Hugging Face API...');

      // Use the Hugging Face client to classify
      const classification = await hf.imageClassification({
        model: 'google/vit-base-patch16-224',
        data: uint8Array,
      });

      // Update usage counter after successful classification
      updateUsageCounter();

      console.log('Classification result:', classification);
      setResult(classification);
    } catch (err) {
      console.error('Full error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      if (monthlyUsage >= MONTHLY_LIMIT) {
        throw new Error('Monthly request limit reached');
      }

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const hf = new HfInference(apiKey);
      const classification = await hf.imageClassification({
        model: 'google/vit-base-patch16-224',
        data: uint8Array,
      });

      // Update usage counter after successful classification
      updateUsageCounter();

      console.log('Classification result:', classification);
      setResult(classification);
      setImageUrl(URL.createObjectURL(file));
    } catch (err) {
      console.error('Error classifying file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sample test images
  const testImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', // Nike shoes
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', // Watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', // Headphones
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Image Classification Test</h1>
      
      {/* Usage Counter */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-bold text-black mb-2">Monthly Usage:</h2>
        <div className="flex items-center justify-between">
          <p className="text-black">
            {monthlyUsage.toLocaleString()} / {MONTHLY_LIMIT.toLocaleString()} predictions used
          </p>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(monthlyUsage / MONTHLY_LIMIT) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {Math.max(0, MONTHLY_LIMIT - monthlyUsage).toLocaleString()} predictions remaining
        </p>
      </div>
      
      {/* API Key Status */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-bold">API Configuration:</h2>
        <p>API Key Status: {apiKey ? '✅ Loaded' : '❌ Not found'}</p>
        <p className="text-sm text-gray-600">Key Preview: {apiKey ? `${apiKey.substring(0, 8)}...` : 'N/A'}</p>
      </div>
      
      {/* Custom URL Input */}
      <div className="mb-6">
        <label className="block text-black font-medium mb-2">
          Test an image from the web:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste an image URL from Google Images or any website"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => testImage(imageUrl)}
            disabled={!imageUrl || loading}
            className="px-4 py-2 bg-blue-500 text-black rounded disabled:opacity-50 whitespace-nowrap hover:bg-blue-600 transition-colors"
          >
            {loading ? 'Testing...' : 'Test URL'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Tip: In Google Images, right-click an image and select "Copy image address"
        </p>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-black font-medium mb-2">
          Upload an image from your device:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Sample Images */}
      <div className="mb-6">
        <label className="block text-black font-medium mb-2">
          Try our sample images:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {testImages.map((url, index) => (
            <div key={index} className="relative">
              <Image
                src={url}
                alt={`Test image ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => {
                  setImageUrl(url);
                  testImage(url);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected Image Preview */}
      {imageUrl && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Selected Image:</h3>
          <div className="relative w-full h-64">
            <Image
              src={imageUrl}
              alt="Selected image"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-black">Processing image...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-bold mb-2 text-black">Results:</h2>
          <pre className="whitespace-pre-wrap text-black">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 