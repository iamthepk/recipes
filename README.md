# Rodinný archiv receptů

Moderní webová aplikace pro správu rodinných receptů od maminky a babičky.

## Technologie

- **Next.js 16** (App Router) s TypeScript
- **Tailwind CSS 4** pro styling
- **Minimalistický UI** inspirovaný moderními designy

## Struktura projektu

```
recipes/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Hlavní stránka se seznamem receptů
│   ├── recept/[id]/       # Detail receptu
│   └── layout.tsx         # Root layout
├── components/            # React komponenty
│   ├── RecipeCard.tsx     # Karta receptu
│   ├── SearchBar.tsx      # Vyhledávací pole
│   └── CategoryFilter.tsx # Filtry kategorií
├── data/                  # Data receptů (JSON soubory podle kategorií)
│   ├── saltyRecipes.json  # Slané recepty
│   ├── sweetRecipes.json  # Sladké recepty
│   ├── christmasRecipes.json # Vánoční recepty
│   └── soupsAndCreamsRecipes.json # Polévky a krémy
├── lib/                   # Utility funkce
│   └── recipes.ts         # Funkce pro práci s recepty
├── types/                 # TypeScript typy
│   └── recipe.ts          # Typy pro recepty
└── public/                # Statické soubory (obrázky)
```

## Jak přidat recept

### Krok 1: Přidejte obrázek (volitelné)

Pokud máte obrázek receptu:
1. Převeďte ho do formátu `.webp` (doporučeno pro lepší výkon)
2. Pojmenujte ho podle ID receptu (např. `vanocni-cukrovi.webp`)
3. Vložte ho do složky `public/`

Pokud obrázek nemáte, použije se automaticky `default-image.webp`.

### Krok 2: Přidejte recept do správného JSON souboru

Recepty jsou rozděleny do více JSON souborů podle kategorií. Vyberte správný soubor nebo vytvořte nový:

- **`data/saltyRecipes.json`** - pro slané recepty
- **`data/sweetRecipes.json`** - pro sladké recepty
- **`data/christmasRecipes.json`** - pro vánoční recepty
- **`data/soupsAndCreamsRecipes.json`** - pro polévky a krémy
- Můžete vytvořit další soubory podle potřeby (např. `data/cakesRecipes.json`)

**Důležité:** Po vytvoření nového JSON souboru musíte přidat import v souboru `lib/recipes.ts`:

```typescript
import novySoubor from '@/data/novySoubor.json';

// A v getAllRecipes() přidat:
if (Array.isArray(novySoubor)) {
  allRecipes.push(...(novySoubor as Recipe[]));
}
```

### Struktura receptu

Každý recept má následující strukturu:

```json
{
  "id": "jedinecny-id-receptu",
  "title": "Název receptu",
  "description": "Krátký popis (volitelné)",
  "image": "nazevreceptu.webp",
  "categories": ["sladké", "buchty"],
  "ingredients": [
    "500g hladké mouky",
    "250ml mléka"
  ],
  // NEBO pro více skupin ingrediencí použijte:
  // "ingredientGroups": [
  //   {
  //     "name": "Těsto",
  //     "items": ["500g mouky", "250ml mléka"]
  //   },
  //   {
  //     "name": "Náplň",
  //     "items": ["500g tvarohu", "2 vejce"]
  //   }
  // ],
  "instructions": [
    "První krok",
    "Druhý krok"
  ],
  "prepTime": 30,
  "cookTime": 45,
  "servings": 8,
  "author": "maminka"
}
```

### Důležité poznámky

- **id**: Musí být jedinečné napříč všemi soubory, použijte malá písmena a pomlčky (např. `vanocni-cukrovi`)
- **categories**: Můžete použít více kategorií najednou
- **image**: Pokud obrázek nemáte, prostě toto pole vynechejte nebo nastavte na `null`
- **author**: Buď `"maminka"` nebo `"babička"`
- **prepTime**, **cookTime**, **servings**: Všechna tato pole jsou volitelná. Pokud je hodnota `0`, pole se nezobrazí

### Kategorie

Dostupné kategorie (můžete použít více najednou):
- `slané`
- `sladké`
- `cukroví`
- `vánoční`
- `buchty`
- `koláče`
- `polévky`
- `hlavní jídla`
- `saláty`
- `nápoje`

Pokud potřebujete přidat novou kategorii, upravte soubor `types/recipe.ts`.

## Spuštění projektu

```bash
# Instalace závislostí
npm install

# Vývojový server
npm run dev

# Build pro produkci
npm run build

# Spuštění produkční verze
npm start
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000)

## Nasazení na Vercel

1. Pushněte kód na GitHub
2. Připojte repozitář k Vercel
3. Vercel automaticky detekuje Next.js a nasadí aplikaci

**Poznámka:** Přidávání receptů přes webové rozhraní funguje pouze lokálně. Na Vercelu je souborový systém read-only, takže změny nelze ukládat přes web.

## Funkce

- ✅ Vyhledávání receptů podle názvu
- ✅ Filtrování podle kategorií
- ✅ Responzivní design
- ✅ Dark mode podpora
- ✅ Detailní zobrazení receptu
- ✅ Minimalistický UI
