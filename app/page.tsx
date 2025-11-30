'use client';

import { useState, useMemo, useEffect } from 'react';
import { RecipeCategory, Recipe } from '@/types/recipe';
import { getAllCategories, filterRecipes, getBaseTitle, getRecipeById } from '@/lib/recipes';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import RecipeModal from '@/components/RecipeModal';
import AddRecipeModal from '@/components/AddRecipeModal';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<RecipeCategory[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const allCategories = getAllCategories();

  // Načíst recept z URL parametru při načtení stránky
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const recipeId = params.get('recipe');
      if (recipeId) {
        const recipe = getRecipeById(recipeId);
        if (recipe) {
          setSelectedRecipe(recipe);
        }
      }
    }
  }, []);
  
  const filteredRecipes = useMemo(() => {
    let results = filterRecipes(searchQuery, selectedCategories);
    
    // Pokud není vyhledávání, seskupit varianty
    if (!searchQuery.trim() && selectedCategories.length === 0) {
      // Seskupit podle základního názvu
      const grouped = new Map<string, typeof results[0]>();
      results.forEach(recipe => {
        const baseTitle = getBaseTitle(recipe.title);
        if (!grouped.has(baseTitle)) {
          grouped.set(baseTitle, recipe);
        }
      });
      results = Array.from(grouped.values());
    }
    
    return results;
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
  
  const handleRecipeClick = (recipeId: string) => {
    const recipe = getRecipeById(recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      // Aktualizovat URL bez reloadu
      window.history.pushState({}, '', `?recipe=${recipeId}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
    // Vyčistit URL parametr
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleVariantChange = (variantId: string) => {
    const variant = getRecipeById(variantId);
    if (variant) {
      setSelectedRecipe(variant);
      // Aktualizovat URL bez reloadu
      window.history.pushState({}, '', `?recipe=${variantId}`);
    }
  };

  const handleRecipeAdded = () => {
    // Refresh stránky pro načtení nových receptů
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1" />
            <h1 className="flex-1 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              Rodinný archiv receptů
            </h1>
            <div className="flex flex-1 justify-end">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                + Přidat recept
              </button>
            </div>
          </div>
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
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={() => handleRecipeClick(recipe.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal s detailem receptu */}
      <RecipeModal 
        recipe={selectedRecipe} 
        onClose={handleCloseModal}
        onVariantChange={handleVariantChange}
      />

      {/* Modal pro přidání receptu */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRecipeAdded}
      />
    </div>
  );
}
