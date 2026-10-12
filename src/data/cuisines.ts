// Keep restaurant choices, server validation, and passport pages in sync.
export const CUISINES = [
  "American",
  "Argentinian",
  "Brazilian",
  "British",
  "Caribbean",
  "Chinese",
  "Cuban",
  "Ethiopian",
  "Filipino",
  "French",
  "German",
  "Greek",
  "Hawaiian",
  "Indian",
  "Indonesian",
  "Iranian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Korean",
  "Lebanese",
  "Malaysian",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Moroccan",
  "Nepalese",
  "Nigerian",
  "Pakistani",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Taiwanese",
  "Texas Barbecue",
  "Thai",
  "Turkish",
  "Vietnamese",
] as const;

export type Cuisine = (typeof CUISINES)[number];

// Normalize older free-text entries without changing their stored restaurant data.
export function normalizeCuisine(value: string): string {
  const trimmed = value.trim();
  return CUISINES.find((cuisine) => cuisine.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
}

export function isCuisine(value: unknown): value is Cuisine {
  return typeof value === "string" && CUISINES.some((cuisine) => cuisine === value);
}

export function getUnlockedCuisines(user: {
  unlockedCuisines?: string[];
  restaurants: { cuisine: string }[];
}): string[] {
  return Array.from(
    new Set(
      [...(user.unlockedCuisines ?? []), ...user.restaurants.map((restaurant) => restaurant.cuisine)].map(
        normalizeCuisine,
      ),
    ),
  ).filter(Boolean);
}

// Regional cuisines span countries, so use a globe instead of an arbitrary national flag.
const CUISINE_FLAGS: Record<Cuisine, string> = {
  American: "🇺🇸",
  Argentinian: "🇦🇷",
  Brazilian: "🇧🇷",
  British: "🇬🇧",
  Caribbean: "🌎",
  Chinese: "🇨🇳",
  Cuban: "🇨🇺",
  Ethiopian: "🇪🇹",
  Filipino: "🇵🇭",
  French: "🇫🇷",
  German: "🇩🇪",
  Greek: "🇬🇷",
  Hawaiian: "🇺🇸",
  Indian: "🇮🇳",
  Indonesian: "🇮🇩",
  Iranian: "🇮🇷",
  Irish: "🇮🇪",
  Italian: "🇮🇹",
  Jamaican: "🇯🇲",
  Japanese: "🇯🇵",
  Korean: "🇰🇷",
  Lebanese: "🇱🇧",
  Malaysian: "🇲🇾",
  Mediterranean: "🌍",
  Mexican: "🇲🇽",
  "Middle Eastern": "🌍",
  Moroccan: "🇲🇦",
  Nepalese: "🇳🇵",
  Nigerian: "🇳🇬",
  Pakistani: "🇵🇰",
  Peruvian: "🇵🇪",
  Polish: "🇵🇱",
  Portuguese: "🇵🇹",
  Russian: "🇷🇺",
  Spanish: "🇪🇸",
  Taiwanese: "🇹🇼",
  "Texas Barbecue": "🇺🇸",
  Thai: "🇹🇭",
  Turkish: "🇹🇷",
  Vietnamese: "🇻🇳",
};

export function cuisineFlag(cuisine: string): string {
  return isCuisine(cuisine) ? CUISINE_FLAGS[cuisine] : "🌐";
}

const CUISINE_COUNTRIES: Partial<Record<Cuisine, string>> = {
  American: "United States",
  Argentinian: "Argentina",
  Brazilian: "Brazil",
  British: "United Kingdom",
  Chinese: "China",
  Cuban: "Cuba",
  Ethiopian: "Ethiopia",
  Filipino: "Philippines",
  French: "France",
  German: "Germany",
  Greek: "Greece",
  Hawaiian: "Hawaii",
  Indian: "India",
  Indonesian: "Indonesia",
  Iranian: "Iran",
  Irish: "Ireland",
  Italian: "Italy",
  Jamaican: "Jamaica",
  Japanese: "Japan",
  Korean: "South Korea",
  Lebanese: "Lebanon",
  Malaysian: "Malaysia",
  Mexican: "Mexico",
  "Middle Eastern": "Middle East",
  Moroccan: "Morocco",
  Nepalese: "Nepal",
  Nigerian: "Nigeria",
  Pakistani: "Pakistan",
  Peruvian: "Peru",
  Polish: "Poland",
  Portuguese: "Portugal",
  Russian: "Russia",
  Spanish: "Spain",
  Taiwanese: "Taiwan",
  "Texas Barbecue": "Texas",
  Thai: "Thailand",
  Turkish: "Turkey",
  Vietnamese: "Vietnam",
};

export function cuisineCountryName(cuisine: string): string {
  return (isCuisine(cuisine) && CUISINE_COUNTRIES[cuisine]) || cuisine;
}

export function cuisineFlagImage(cuisine: string): string | null {
  const characters = Array.from(cuisineFlag(cuisine));
  // National flag emoji are two regional indicator characters encoding the country code.
  if (characters.length !== 2) return null;
  const code = characters.map((character) => String.fromCharCode(character.codePointAt(0)! - 0x1f1e6 + 97)).join("");
  return `/flags/${code}.svg`;
}
