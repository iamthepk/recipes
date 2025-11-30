'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Recipe } from '@/types/recipe';
import { getRecipeImage } from '@/lib/image-utils';
import { getRecipeVariants, hasVariants, getBaseTitle, getRecipeById } from '@/lib/recipes';
import { getIngredientGroups } from '@/lib/recipe-utils';
import RecipeVariants from '@/components/RecipeVariants';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onVariantChange?: (variantId: string) => void;
}

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

export default function RecipeModal({ recipe, onClose, onVariantChange }: RecipeModalProps) {
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (recipe) {
      document.body.style.overflow = 'hidden';
      setImageError(false); // Resetovat chybu obrázku při změně receptu
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [recipe]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && recipe) {
        onClose();
      }
    };

    if (recipe) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [recipe, onClose]);

  if (!recipe) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const imageSrc = getRecipeImage(recipe.image);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-zinc-900">
        {/* Zavírací tlačítko */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700"
          aria-label="Zavřít"
        >
          <svg
            className="h-6 w-6 text-zinc-900 dark:text-zinc-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {/* Obrázek */}
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

          {/* Varianty */}
          {hasVariants(recipe) && (
            <div className="mb-8">
              <RecipeVariants 
                variants={getRecipeVariants(recipe)} 
                currentId={recipe.id}
                onVariantChange={(variantId) => {
                  if (onVariantChange) {
                    onVariantChange(variantId);
                  }
                }}
              />
            </div>
          )}

          {/* Hlavní informace */}
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              {hasVariants(recipe) ? getBaseTitle(recipe.title) : recipe.title}
              {hasVariants(recipe) && (
                <span className="ml-3 text-2xl text-zinc-500 dark:text-zinc-400">
                  {recipe.title.match(/varianta\s*(\d+)/i)?.[0]}
                </span>
              )}
            </h1>

            {recipe.description && (
              <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
                {recipe.description}
              </p>
            )}

            {/* Kategorie */}
            {recipe.categories && recipe.categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {recipe.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              {typeof recipe.prepTime === 'number' && recipe.prepTime > 0 ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Příprava: {recipe.prepTime} min</span>
                </div>
              ) : null}
              {typeof recipe.cookTime === 'number' && recipe.cookTime > 0 ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pečení: {recipe.cookTime} min</span>
                </div>
              ) : null}
              {typeof recipe.servings === 'number' && recipe.servings > 0 ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{recipe.servings} porcí</span>
                </div>
              ) : null}
              {recipe.author ? (
                <div className="flex items-center gap-2">
                  <span>od {getAuthorDisplayName(recipe.author)}</span>
                </div>
              ) : null}
            </div>
          </header>

          {/* Ingredience */}
          {(() => {
            const ingredientGroups = getIngredientGroups(recipe);
            if (ingredientGroups.length === 0) return null;
            
            return (
              <section className="mb-12">
                <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Ingredience
                </h2>
                <div className="space-y-6">
                  {ingredientGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {group.name && (
                        <h3 className="mb-2 text-lg font-medium text-zinc-800 dark:text-zinc-200">
                          {group.name}
                        </h3>
                      )}
                      <ul className="space-y-2">
                        {group.items.map((ingredient, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Postup */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Postup
              </h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-4 text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {index + 1}
                    </span>
                    <span className="pt-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

