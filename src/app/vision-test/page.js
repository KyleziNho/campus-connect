'use client'
import { useState } from 'react';
import Image from 'next/image';

export default function VisionTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const testUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
  
  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: testUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vision API Test</h1>
      
      <div className="mb-4">
        <Image 
          src={testUrl}
          alt="Test image"
          width={300}
          height={300}
          className="rounded-lg"
        />
      </div>
      
      <button
        onClick={runTest}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Vision API'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <h2 className="font-bold">Result:</h2>
          <pre className="mt-2 whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 