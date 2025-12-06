import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

export default connectDatabase;