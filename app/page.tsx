'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import PhotoUpload from '@/components/PhotoUpload';
import FoodGallery from '@/components/FoodGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIdentificationComplete = () => {
    setActiveTab('gallery');
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              Food Identifier
            </h1>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Food
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6">
        {activeTab === 'gallery' ? (
          <FoodGallery key={refreshKey} />
        ) : (
          <PhotoUpload onIdentificationComplete={handleIdentificationComplete} />
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          Powered by Anthropic Claude & Vercel
        </div>
      </footer>
    </div>
  );
}
