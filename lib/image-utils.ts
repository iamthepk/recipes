/**
 * Získá cestu k obrázku receptu nebo výchozí obrázek
 */
export function getRecipeImage(image: string | null | undefined): string {
  // Pokud image není definováno, je null, nebo je prázdný string, použij default
  if (!image || (typeof image === 'string' && image.trim() === '')) {
    return 'default-image.webp';
  }
  return image;
}

