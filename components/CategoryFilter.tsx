'use client';

import { RecipeCategory } from '@/types/recipe';

interface CategoryFilterProps {
  categories: RecipeCategory[];
  selectedCategories: RecipeCategory[];
  onToggleCategory: (category: RecipeCategory) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category);
        return (
          <button
            key={category}
            onClick={() => onToggleCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

