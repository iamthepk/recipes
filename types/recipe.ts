export type RecipeCategory = 
  | 'slané'
  | 'sladké'
  | 'cukroví'
  | 'vánoční'
  | 'buchty'
  | 'koláče'
  | 'polévky'
  | 'hlavní jídla'
  | 'saláty'
  | 'nápoje';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string; // název souboru v public/ (např. "nazevreceptu.webp")
  categories: RecipeCategory[];
  ingredients: string[];
  instructions: string[];
  prepTime?: number; // v minutách
  cookTime?: number; // v minutách
  servings?: number;
  author?: 'maminka' | 'babička' | 'sousedka' | string;
  createdAt?: string;
}

