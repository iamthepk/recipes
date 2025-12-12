import { Recipe, IngredientGroup } from '@/types/recipe';

/**
 * Získá skupiny ingrediencí z receptu
 * Podporuje jak starý formát (ingredients: string[]) tak nový (ingredientGroups)
 */
export function getIngredientGroups(recipe: Recipe): IngredientGroup[] {
  // Pokud má nový formát s ingredientGroups, použij ho
  if (recipe.ingredientGroups && recipe.ingredientGroups.length > 0) {
    return recipe.ingredientGroups;
  }
  
  // Jinak použij starý formát a převeď ho na skupinu
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    return [{ items: recipe.ingredients }];
  }
  
  return [];
}




