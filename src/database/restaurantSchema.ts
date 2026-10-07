import mongoose, { Schema } from "mongoose";
import { RestaurantInput } from "@/types/restaurant";

const restaurantSchema = new Schema<RestaurantInput>({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: false },
  status: { type: String, required: true, enum: ["visited", "want-to-visit"] },
  imageURL: { type: String },
});

export default mongoose.models.Restaurant || mongoose.model<RestaurantInput>("Restaurant", restaurantSchema);
