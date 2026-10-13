import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

//only keep a hash of the session token in the database
const sessionSchema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "UserModel" },
  expiresAt: { type: Date, required: true, expires: 0 },
});

type SessionDocument = InferSchemaType<typeof sessionSchema>;
export default (mongoose.models.Session as Model<SessionDocument>) || mongoose.model("Session", sessionSchema);
