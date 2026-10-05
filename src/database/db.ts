import mongoose from "mongoose";
import * as dotenv from "dotenv";

let connection: typeof mongoose;

/**
 * Makes a connection to a MongoDB database. If a connection already exists, does nothing
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  dotenv.config({ path: ".env.local" });

  if (!connection) {
    connection = await mongoose.connect(process.env.MONGODB_URI as string);
    return connection;
  }
};

export default connectDB;
