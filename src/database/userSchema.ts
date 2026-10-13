import mongoose, { Schema, Model, InferSchemaType } from "mongoose";
import { restaurantSchema } from "@/database/restaurantSchema";

//each user has a username, a hashed password, and their own restaurants
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    restaurants: { type: [restaurantSchema], default: [] },
  },
  { collection: "users" },
);

type UserDocument = InferSchemaType<typeof UserSchema>;
export default (mongoose.models.UserModel as Model<UserDocument>) || mongoose.model("UserModel", UserSchema);
