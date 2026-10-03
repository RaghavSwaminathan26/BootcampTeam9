import mongoose, { Schema } from "mongoose";
import { Restaurant } from "@/types/restaurant";

const ResturnatSchema = new Schema<Restaurant>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true },
  rating: { type: Number, required: true },
  imageURL: { type: String },
});

export default mongoose.models.Restaurant || mongoose.model("Restaurant", ResturnatSchema);
