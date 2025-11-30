import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRecipeById, getAllRecipes } from '@/lib/recipes';
import RecipeImage from '@/components/RecipeImage';

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

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

// Revalidace každých 60 sekund - stránky se aktualizují při změnách v JSON
export const revalidate = 60;

export async function generateStaticParams() {
  const recipes = getAllRecipes();
  return recipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  
  if (!recipe) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Zpět */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Zpět na seznam receptů
        </Link>
        
        {/* Obrázek */}
        <RecipeImage recipe={recipe} />
        
        {/* Hlavní informace */}
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {recipe.title}
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
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Ingredience
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        
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
      </main>
    </div>
  );
}

