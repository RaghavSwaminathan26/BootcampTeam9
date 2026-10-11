import mongoose, { Schema } from "mongoose";
import { RestaurantInput } from "@/types/restaurant";

export const restaurantSchema = new Schema<RestaurantInput>({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true, enum: ["visited", "want-to-visit"] },
  rating: { type: Number, required: false, min: 0, max: 5 },
  imageURL: { type: String },
});

export default mongoose.models.Restaurant || mongoose.model<RestaurantInput>("Restaurant", restaurantSchema);
