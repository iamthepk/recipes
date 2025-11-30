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

// Funkce pro získání GitHub konfigurace z environment variables
function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';

  return { owner, repo, token, branch };
}

// Funkce pro získání aktuálního obsahu souboru z GitHubu
async function getFileFromGitHub(filePath: string): Promise<{ content: string; sha: string | null }> {
  const { owner, repo, token, branch } = getGitHubConfig();

  if (!owner || !repo || !token) {
    throw new Error('GitHub konfigurace není nastavena');
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/data/${filePath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      // Soubor neexistuje, vrátíme prázdný obsah
      return { content: '[]', sha: null };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
  } catch (error) {
    console.error('Chyba při načítání souboru z GitHubu:', error);
    throw error;
  }
}

// Funkce pro uložení souboru na GitHub
async function saveFileToGitHub(filePath: string, content: string, sha: string | null, message: string) {
  const { owner, repo, token, branch } = getGitHubConfig();

  if (!owner || !repo || !token) {
    throw new Error('GitHub konfigurace není nastavena');
  }

  const encodedContent = Buffer.from(content).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/data/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha, // Pokud je null, vytvoří se nový soubor
        branch,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

// Funkce pro kontrolu existence ID ve všech souborech na GitHubu
async function checkIdExists(recipeId: string): Promise<boolean> {
  const allFiles = ['saltyRecipes.json', 'sweetRecipes.json', 'christmasRecipes.json', 'soupsAndCreamsRecipes.json'];
  
  for (const file of allFiles) {
    try {
      const { content } = await getFileFromGitHub(file);
      const recipes: Recipe[] = JSON.parse(content);
      if (recipes.some(r => r.id === recipeId)) {
        return true;
      }
    } catch {
      // Soubor neexistuje nebo chyba, pokračujeme
    }
  }
  
  return false;
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
    const { owner, repo, token } = getGitHubConfig();

    // Pokud není nastaven GitHub, použijeme lokální souborový systém (pro vývoj)
    if (!owner || !repo || !token) {
      // Lokální režim - pro vývoj
      const filePath = path.join(process.cwd(), 'data', targetFile);

      // Načíst existující recepty
      let existingRecipes: Recipe[] = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        existingRecipes = JSON.parse(fileContent);
      } catch (error) {
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
    }

    // Produkční režim - použít GitHub API
    // Zkontrolovat, zda ID už neexistuje
    const idExists = await checkIdExists(recipeData.id);
    if (idExists) {
      return NextResponse.json(
        { error: `Recept s ID "${recipeData.id}" již existuje` },
        { status: 400 }
      );
    }

    // Načíst aktuální obsah souboru z GitHubu
    const { content: currentContent, sha } = await getFileFromGitHub(targetFile);
    const existingRecipes: Recipe[] = JSON.parse(currentContent);

    // Přidat nový recept
    existingRecipes.push(recipeData);

    // Uložit na GitHub
    const newContent = JSON.stringify(existingRecipes, null, 2);
    const commitMessage = `Přidán recept: ${recipeData.title}`;

    await saveFileToGitHub(targetFile, newContent, sha, commitMessage);

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

