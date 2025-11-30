'use client';

import { useState, useMemo } from 'react';
import { RecipeCategory } from '@/types/recipe';
import { getAllRecipes, getAllCategories, filterRecipes } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<RecipeCategory[]>([]);
  
  const allRecipes = getAllRecipes();
  const allCategories = getAllCategories();
  
  const filteredRecipes = useMemo(() => {
    return filterRecipes(searchQuery, selectedCategories);
  }, [searchQuery, selectedCategories]);
  
  const handleToggleCategory = (category: RecipeCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };
  
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategories.length > 0;
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Rodinný archiv receptů
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Recepty od maminky a babičky
          </p>
        </header>
        
        {/* Vyhledávání a filtry */}
        <div className="mb-8 space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Hledat podle názvu..."
          />
          
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kategorie
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Zrušit filtry
                </button>
              )}
            </div>
            <CategoryFilter
              categories={allCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
            />
          </div>
        </div>
        
        {/* Výsledky */}
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {filteredRecipes.length === 0 ? (
            <p>Žádné recepty nenalezeny.</p>
          ) : (
            <p>
              Nalezeno {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recept' : filteredRecipes.length < 5 ? 'recepty' : 'receptů'}
            </p>
          )}
        </div>
        
        {/* Seznam receptů */}
        {filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
