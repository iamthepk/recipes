import { NextRequest, NextResponse } from 'next/server';
import { Recipe, RecipeCategory } from '@/types/recipe';
import fs from 'fs/promises';
import path from 'path';

// Určení, do kterého souboru recept uložit na základě kategorií
function getTargetFile(categories: RecipeCategory[]): string {
  // Priorita kategorií pro určení souboru
  if (categories.includes('vánoční') || categories.includes('cukroví')) {
    return 'christmasRecipes.json';
  }
  if (categories.includes('polévky') || categories.some(cat => cat.includes('krém'))) {
    return 'soupsAndCreamsRecipes.json';
  }
  if (categories.includes('sladké')) {
    return 'sweetRecipes.json';
  }
  if (categories.includes('slané')) {
    return 'saltyRecipes.json';
  }
  
  // Výchozí - sladké recepty
  return 'sweetRecipes.json';
}

export async function POST(request: NextRequest) {
  try {
    const recipeData: Recipe = await request.json();

    // Validace
    if (!recipeData.title || !recipeData.categories || recipeData.categories.length === 0) {
      return NextResponse.json(
        { error: 'Název a kategorie jsou povinné' },
        { status: 400 }
      );
    }

    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      return NextResponse.json(
        { error: 'Postup je povinný' },
        { status: 400 }
      );
    }

    const hasIngredients = recipeData.ingredients && recipeData.ingredients.length > 0;
    const hasIngredientGroups = recipeData.ingredientGroups && recipeData.ingredientGroups.length > 0;
    
    if (!hasIngredients && !hasIngredientGroups) {
      return NextResponse.json(
        { error: 'Ingredience jsou povinné' },
        { status: 400 }
      );
    }

    // Určit cílový soubor
    const targetFile = getTargetFile(recipeData.categories);
    const filePath = path.join(process.cwd(), 'data', targetFile);

    // Načíst existující recepty
    let existingRecipes: Recipe[] = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingRecipes = JSON.parse(fileContent);
    } catch (error) {
      // Pokud soubor neexistuje, začneme s prázdným polem
      existingRecipes = [];
    }

    // Zkontrolovat, zda ID už neexistuje
    const allFiles = ['saltyRecipes.json', 'sweetRecipes.json', 'christmasRecipes.json', 'soupsAndCreamsRecipes.json'];
    for (const file of allFiles) {
      const checkPath = path.join(process.cwd(), 'data', file);
      try {
        const content = await fs.readFile(checkPath, 'utf-8');
        const recipes: Recipe[] = JSON.parse(content);
        if (recipes.some(r => r.id === recipeData.id)) {
          return NextResponse.json(
            { error: `Recept s ID "${recipeData.id}" již existuje` },
            { status: 400 }
          );
        }
      } catch {
        // Soubor neexistuje, pokračujeme
      }
    }

    // Přidat nový recept
    existingRecipes.push(recipeData);

    // Uložit zpět do souboru
    await fs.writeFile(
      filePath,
      JSON.stringify(existingRecipes, null, 2),
      'utf-8'
    );

    return NextResponse.json(
      { success: true, recipe: recipeData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chyba při ukládání receptu:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nastala chyba při ukládání receptu' },
      { status: 500 }
    );
  }
}

