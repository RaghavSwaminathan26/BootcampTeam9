export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  status: "visited" | "want-to-visit";
  rating?: number;
  imageURL?: string;
}
