import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// CORRECT
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
// Load environment variables from .env
dotenv.config();

const app = express();

// ─── Core Middleware ───────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// CORS — allow requests from the React client
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Health Check ──────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SyncSpace API is running",
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);

// Future phases — uncomment as they are implemented:
// app.use("/api/rooms", roomRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────

// Must be in this order: notFound THEN errorHandler
app.use(notFound);
app.use(errorHandler);

export default app;