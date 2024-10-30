'use client'
import dynamic from 'next/dynamic';

const SellingHub = dynamic(() => import('@/components/SellingHub.js'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function SellingHubPage() {
  return <SellingHub />;
}