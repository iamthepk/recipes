'use client';

import { Recipe } from '@/types/recipe';

interface RecipeVariantsProps {
  variants: Recipe[];
  currentId: string;
  onVariantChange: (variantId: string) => void;
}

export default function RecipeVariants({ variants, currentId, onVariantChange }: RecipeVariantsProps) {
  if (variants.length <= 1) return null;
  
  return (
    <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Varianty receptu:
      </h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isActive = variant.id === currentId;
          return (
            <button
              key={variant.id}
              onClick={() => onVariantChange(variant.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {variant.title.match(/varianta\s*(\d+)/i) 
                ? `Varianta ${variant.title.match(/varianta\s*(\d+)/i)?.[1]}`
                : variant.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

