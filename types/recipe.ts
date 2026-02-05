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
  | 'omáčky'
  | 'dipy'
  | 'nápoje';

export interface IngredientGroup {
  name?: string; // Název skupiny (např. "Těsto", "Náplň", "Poleva") - volitelné
  items: string[]; // Seznam ingrediencí ve skupině
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string; // název souboru v public/ (např. "nazevreceptu.webp")
  categories: RecipeCategory[];
  ingredients?: string[]; // Starý formát - pro zpětnou kompatibilitu
  ingredientGroups?: IngredientGroup[]; // Nový formát - skupiny ingrediencí
  instructions: string[];
  prepTime?: number; // v minutách
  cookTime?: number; // v minutách
  servings?: number;
  author?: 'maminka' | 'babička' | 'sousedka' | string;
  createdAt?: string;
}

