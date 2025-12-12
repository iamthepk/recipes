'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { getRecipeImage } from '@/lib/image-utils';

interface RecipeImageProps {
  recipe: Recipe;
}

export default function RecipeImage({ recipe }: RecipeImageProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = getRecipeImage(recipe.image);
  
  return (
    <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
      {!imageError ? (
        <Image
          src={`/${imageSrc}`}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 896px"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <svg
            className="h-16 w-16 text-zinc-400 dark:text-zinc-600"
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
  );
}





