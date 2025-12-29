'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DemoFood {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  image_url: string;
}

const DEMO_FOODS: DemoFood[] = [
  {
    id: 1,
    name: 'Phở',
    description: 'The quintessential Vietnamese soup, phở is a fragrant beef or chicken broth served with rice noodles, fresh herbs, and your choice of protein. What makes it special is the complex, aromatic broth that simmers for hours with star anise, cinnamon, and charred ginger.',
    ingredients: 'Rice noodles, beef or chicken, broth, herbs (basil, cilantro), bean sprouts, lime, chili',
    image_url: 'https://images.unsplash.com/photo-1562835155-a7c9909ee3a2?w=800&h=800&fit=crop',
  },
  {
    id: 2,
    name: 'Bánh Mì',
    description: 'A Vietnamese baguette sandwich that perfectly blends French colonial influence with Vietnamese flavors. This iconic street food features a crispy baguette filled with savory proteins, pickled vegetables, fresh herbs, and pâté, creating a harmony of textures and tastes.',
    ingredients: 'Baguette, pâté, pork, pickled carrots and daikon, cucumber, cilantro, chili, mayonnaise',
    image_url: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=800&h=800&fit=crop',
  },
  {
    id: 3,
    name: 'Bún Chả',
    description: 'A Hanoi specialty featuring grilled pork served over rice vermicelli noodles with a sweet and tangy fish sauce dressing. Famous for being enjoyed by President Obama during his visit to Vietnam, this dish exemplifies the balanced flavors of Northern Vietnamese cuisine.',
    ingredients: 'Rice vermicelli, grilled pork patties, pork belly, fish sauce, herbs, pickled vegetables',
    image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=800&fit=crop',
  },
  {
    id: 4,
    name: 'Gỏi Cuốn (Spring Rolls)',
    description: 'Fresh summer rolls wrapped in translucent rice paper, showcasing Vietnam\'s emphasis on fresh, healthy ingredients. Unlike fried spring rolls, these are served fresh and cool, making them a refreshing appetizer perfect for Vietnam\'s tropical climate.',
    ingredients: 'Rice paper, shrimp or pork, rice vermicelli, lettuce, mint, cilantro, peanut sauce',
    image_url: 'https://images.unsplash.com/photo-1594241962937-a04945b0cf04?w=800&h=800&fit=crop',
  },
  {
    id: 5,
    name: 'Cà Phê Sữa Đá',
    description: 'Vietnamese iced coffee made with strong dark-roast coffee and sweetened condensed milk. This beloved beverage reflects Vietnam\'s status as one of the world\'s largest coffee producers and its unique café culture where people gather to slowly enjoy their drinks.',
    ingredients: 'Dark roast coffee, sweetened condensed milk, ice',
    image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=800&fit=crop',
  },
  {
    id: 6,
    name: 'Cao Lầu',
    description: 'A regional specialty from Hoi An, this noodle dish can only be authentically made with water from a specific local well. The thick rice noodles are topped with pork, fresh greens, and crispy rice crackers, representing the unique culinary traditions of Central Vietnam.',
    ingredients: 'Thick rice noodles, pork, greens, fried pork rinds, herbs, soy-based sauce',
    image_url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=800&fit=crop',
  },
];

export default function DemoPage() {
  const [selectedFood, setSelectedFood] = useState<DemoFood | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Food Identifier - Demo</h1>
          <Link
            href="/sign-in"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Sign In to Use Full App
          </Link>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> This is a preview showing sample Vietnamese dishes.
                To identify your own food photos and save them to your account,{' '}
                <Link href="/sign-up" className="font-semibold underline">
                  create a free account
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Discover Vietnamese Cuisine
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            This app helps you identify, capture, and remember the amazing foods you encounter
            during your travels in Vietnam. Using AI-powered image recognition, it can identify
            dishes, list key ingredients, and explain what makes each dish special.
          </p>
          <p className="text-gray-600">
            Below are some iconic Vietnamese dishes to give you a taste of what you can discover!
          </p>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_FOODS.map((food) => (
            <div
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="cursor-pointer group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200"
            >
              <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                <Image
                  src={food.image_url}
                  alt={food.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{food.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{food.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Explore Vietnam&apos;s Food Scene?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Sign up now to start identifying foods from your own photos, save your discoveries,
            and build your personal Vietnamese food journal. It&apos;s free to get started!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square">
              <Image
                src={selectedFood.image_url}
                alt={selectedFood.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedFood.name}</h2>
              {selectedFood.ingredients && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Ingredients:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.ingredients.split(',').map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {ingredient.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-gray-600 mb-4">{selectedFood.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFood(null)}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/sign-up"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-center"
                >
                  Sign Up to Identify Your Own
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          Powered by Anthropic Claude AI • Built with Next.js and Vercel
        </p>
      </div>
    </div>
  );
}
