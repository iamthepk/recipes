import { Recipe, RecipeCategory } from '@/types/recipe';
// Import všech JSON souborů s recepty
import saltyRecipes from '@/data/saltyRecipes.json';
import sweetRecipes from '@/data/sweetRecipes.json';
import christmasRecipes from '@/data/christmasRecipes.json';
// Pokud existuje původní recipes.json, můžete ho také importovat
// import recipesData from '@/data/recipes.json';

// Načtení všech receptů ze všech souborů
export function getAllRecipes(): Recipe[] {
  const allRecipes: Recipe[] = [];
  
  // Přidat recepty ze všech souborů
  if (Array.isArray(saltyRecipes)) {
    allRecipes.push(...(saltyRecipes as Recipe[]));
  }
  
  if (Array.isArray(sweetRecipes)) {
    allRecipes.push(...(sweetRecipes as Recipe[]));
  }
  
  if (Array.isArray(christmasRecipes)) {
    allRecipes.push(...(christmasRecipes as Recipe[]));
  }
  
  // Pokud chcete zachovat původní recipes.json, odkomentujte:
  // if (Array.isArray(recipesData)) {
  //   allRecipes.push(...(recipesData as Recipe[]));
  // }
  
  return allRecipes;
}

// Načtení jednoho receptu podle ID
export function getRecipeById(id: string): Recipe | undefined {
  return getAllRecipes().find(recipe => recipe.id === id);
}

// Filtrování receptů podle kategorií
export function getRecipesByCategories(categories: RecipeCategory[]): Recipe[] {
  if (categories.length === 0) return getAllRecipes();
  
  return getAllRecipes().filter(recipe =>
    categories.some(category => recipe.categories.includes(category))
  );
}

// Vyhledávání receptů podle názvu
export function searchRecipes(query: string): Recipe[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return getAllRecipes();
  
  return getAllRecipes().filter(recipe =>
    recipe.title.toLowerCase().includes(lowerQuery) ||
    recipe.description?.toLowerCase().includes(lowerQuery)
  );
}

// Kombinované vyhledávání a filtrování
export function filterRecipes(
  query: string,
  categories: RecipeCategory[]
): Recipe[] {
  let results = getAllRecipes();
  
  // Aplikovat vyhledávání
  if (query.trim()) {
    results = searchRecipes(query);
  }
  
  // Aplikovat filtrování podle kategorií
  if (categories.length > 0) {
    results = results.filter(recipe =>
      categories.some(category => recipe.categories.includes(category))
    );
  }
  
  return results;
}

// Získání všech dostupných kategorií
export function getAllCategories(): RecipeCategory[] {
  const categories = new Set<RecipeCategory>();
  getAllRecipes().forEach(recipe => {
    recipe.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories).sort();
}

