'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FoodEntry } from '@/lib/types';

export default function FoodGallery() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<FoodEntry | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  const fetchFoods = async (pageNum: number) => {
    try {
      setLoading(true);
      const offset = pageNum * limit;
      const response = await fetch(`/api/foods?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }
      const data = await response.json();
      setFoods(data.entries);
      setTotal(data.total);
      setHasMore(offset + data.entries.length < data.total);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods(page);
  }, [page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No foods yet. Add your first one!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
          {foods.map((food) => (
            <div
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-shadow">
                <Image
                  src={food.image_url}
                  alt={food.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-800 truncate">
                {food.name}
              </h3>
            </div>
          ))}
        </div>

        {total > limit && (
          <div className="flex items-center justify-center gap-4 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page + 1} of {Math.ceil(total / limit)} ({total} total)
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

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
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedFood.name}
              </h2>
              {selectedFood.ingredients && selectedFood.ingredients.trim() && (
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
              {selectedFood.user_context && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Your note:</span> {selectedFood.user_context}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-400">
                Added {new Date(selectedFood.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => setSelectedFood(null)}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
