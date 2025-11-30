'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeCategory, IngredientGroup } from '@/types/recipe';
import { getAllCategories } from '@/lib/recipes';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type IngredientInputMode = 'simple' | 'groups';

export default function AddRecipeModal({ isOpen, onClose, onSuccess }: AddRecipeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientMode, setIngredientMode] = useState<IngredientInputMode>('simple');
  
  // Formulářové stavy
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<RecipeCategory[]>([]);
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([{ items: [''] }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [prepTime, setPrepTime] = useState<string>('');
  const [cookTime, setCookTime] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [author, setAuthor] = useState<string>('');

  const allCategories = getAllCategories();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset formuláře při zavření
      resetForm();
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage('');
    setSelectedCategories([]);
    setIngredients(['']);
    setIngredientGroups([{ items: [''] }]);
    setInstructions(['']);
    setPrepTime('');
    setCookTime('');
    setServings('');
    setAuthor('');
    setError(null);
    setIngredientMode('simple');
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleCategory = (category: RecipeCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addIngredientGroup = () => {
    setIngredientGroups([...ingredientGroups, { items: [''] }]);
  };

  const updateIngredientGroupName = (index: number, name: string) => {
    const newGroups = [...ingredientGroups];
    newGroups[index] = { ...newGroups[index], name: name || undefined };
    setIngredientGroups(newGroups);
  };

  const addIngredientToGroup = (groupIndex: number) => {
    const newGroups = [...ingredientGroups];
    newGroups[groupIndex].items.push('');
    setIngredientGroups(newGroups);
  };

  const updateIngredientInGroup = (groupIndex: number, itemIndex: number, value: string) => {
    const newGroups = [...ingredientGroups];
    newGroups[groupIndex].items[itemIndex] = value;
    setIngredientGroups(newGroups);
  };

  const removeIngredientFromGroup = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...ingredientGroups];
    newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
    setIngredientGroups(newGroups);
  };

  const removeIngredientGroup = (index: number) => {
    setIngredientGroups(ingredientGroups.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Odstranit diakritiku
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validace
    if (!title.trim()) {
      setError('Název receptu je povinný');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Vyberte alespoň jednu kategorii');
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.trim());
    const filteredGroups = ingredientGroups.map(group => ({
      ...group,
      items: group.items.filter(item => item.trim())
    })).filter(group => group.items.length > 0);

    if (ingredientMode === 'simple' && filteredIngredients.length === 0) {
      setError('Přidejte alespoň jednu ingredienci');
      return;
    }

    if (ingredientMode === 'groups' && filteredGroups.length === 0) {
      setError('Přidejte alespoň jednu skupinu ingrediencí');
      return;
    }

    const filteredInstructions = instructions.filter(i => i.trim());
    if (filteredInstructions.length === 0) {
      setError('Přidejte alespoň jeden krok postupu');
      return;
    }

    setIsSubmitting(true);

    try {
      const recipeData: Partial<Recipe> = {
        id: generateId(title),
        title: title.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        categories: selectedCategories,
        instructions: filteredInstructions,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        author: author.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      if (ingredientMode === 'simple') {
        recipeData.ingredients = filteredIngredients;
      } else {
        recipeData.ingredientGroups = filteredGroups;
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chyba při ukládání receptu');
      }

      // Úspěch
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba při ukládání receptu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-zinc-900">
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
          <h2 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Přidat nový recept
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Název */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Název receptu *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                required
              />
            </div>

            {/* Popis */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Popis (volitelné)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Obrázek */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Název obrázku (volitelné, např. "nazevreceptu.webp")
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="nazevreceptu.webp"
              />
            </div>

            {/* Kategorie */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kategorie *
              </label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredience - režim */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ingredience *
              </label>
              <div className="mb-4 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={ingredientMode === 'simple'}
                    onChange={() => setIngredientMode('simple')}
                    className="h-4 w-4"
                  />
                  <span>Jednoduchý seznam</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={ingredientMode === 'groups'}
                    onChange={() => setIngredientMode('groups')}
                    className="h-4 w-4"
                  />
                  <span>Skupiny (těsto, náplň, atd.)</span>
                </label>
              </div>

              {ingredientMode === 'simple' ? (
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder="Např. 500g hladké mouky"
                        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                        >
                          Odstranit
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    + Přidat ingredienci
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredientGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                      <div className="mb-2">
                        <input
                          type="text"
                          value={group.name || ''}
                          onChange={(e) => updateIngredientGroupName(groupIndex, e.target.value)}
                          placeholder="Název skupiny (např. Těsto)"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateIngredientInGroup(groupIndex, itemIndex, e.target.value)}
                              placeholder="Např. 500g hladké mouky"
                              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            {group.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeIngredientFromGroup(groupIndex, itemIndex)}
                                className="rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                              >
                                Odstranit
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addIngredientToGroup(groupIndex)}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          + Přidat ingredienci
                        </button>
                      </div>
                      {ingredientGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredientGroup(groupIndex)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          Odstranit skupinu
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addIngredientGroup}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    + Přidat skupinu ingrediencí
                  </button>
                </div>
              )}
            </div>

            {/* Postup */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Postup *
              </label>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder="Popište krok..."
                      rows={2}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="rounded-lg bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                      >
                        Odstranit
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  + Přidat krok
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Doba přípravy (min)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  min="0"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Doba vaření/pečení (min)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  min="0"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Počet porcí
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="0"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Autor */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Autor (volitelné)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="maminka, babička, sousedka..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Tlačítka */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? 'Ukládám...' : 'Přidat recept'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

