import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import mongoose from "mongoose";

/**
 * connectDB — establishes a Mongoose connection to MongoDB Atlas.
 *
 * Called once at server startup BEFORE Express begins accepting requests.
 * If the connection fails, the process exits so the server never starts
 * in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings in Mongoose 6+
      // and are the recommended defaults for Atlas connections.
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown — close the Mongoose connection when Node exits.
    // This ensures in-flight writes complete before the process stops.
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed (app termination)");
      process.exit(0);
    });
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit with failure code so Docker/PM2/systemd can restart the process.
    process.exit(1);
  }
};

export default connectDB;