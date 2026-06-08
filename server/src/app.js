import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "SyncSpace API running", env: process.env.NODE_ENV });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", chatRoutes);

// Error handling — must be last
app.use(notFound);
app.use(errorHandler);

export default app;