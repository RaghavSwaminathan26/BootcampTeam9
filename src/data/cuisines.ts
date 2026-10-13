export const CUISINES = [
  "American",
  "Mexican",
  "Italian",
  "French",
  "Spanish",
  "Greek",
  "Mediterranean",
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Indian",
  "Middle Eastern",
  "Lebanese",
  "Turkish",
  "Ethiopian",
  "Caribbean",
  "Brazilian",
  "Peruvian",
  "Seafood",
  "Vegetarian",
  "Vegan",
  "Bakery & Café",
  "Fusion",
  "Other",
] as const;

export function normalizeCuisine(value: string): string {
  const aliases: Record<string, string> = {
    cafe: "Bakery & Café",
    bakery: "Bakery & Café",
    café: "Bakery & Café",
    bbq: "American",
    barbecue: "American",
    pizza: "Italian",
    sushi: "Japanese",
  };
  const key = value.trim().toLowerCase();
  return CUISINES.find((cuisine) => cuisine.toLowerCase() === key) || aliases[key] || "Other";
}
