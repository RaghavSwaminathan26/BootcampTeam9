export interface RestaurantInput {
  name: string;
  cuisine: string;
  location: string;
  status: "visited" | "want-to-visit";
  rating?: number;
  imageURL?: string;
}

export interface Restaurant extends RestaurantInput {
  id: string;
}
