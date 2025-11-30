'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { getRecipeImage } from '@/lib/image-utils';
import { hasVariants, getRecipeVariants, getBaseTitle } from '@/lib/recipes';

function getAuthorDisplayName(author: string): string {
  switch (author) {
    case 'maminka':
      return 'maminky';
    case 'babička':
      return 'babičky';
    case 'sousedka':
      return 'sousedky';
    default:
      return author;
  }
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = getRecipeImage(recipe.image);
  
  return (
    <button
      onClick={onClick}
      className="group block w-full cursor-pointer text-left"
      type="button"
    >
      <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {!imageError ? (
            <Image
              src={`/${imageSrc}`}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                className="h-12 w-12 text-zinc-400 dark:text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {hasVariants(recipe) ? getBaseTitle(recipe.title) : recipe.title}
          </h2>
          {recipe.description && (
            <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {recipe.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {category}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            {recipe.author && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                od {getAuthorDisplayName(recipe.author)}
              </p>
            )}
            {hasVariants(recipe) && (
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {getRecipeVariants(recipe).length} variant
              </span>
            )}
          </div>
        </div>
      </article>
    </button>
  );
}

