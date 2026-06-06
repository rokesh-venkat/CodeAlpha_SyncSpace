import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Auth API Routes
 *
 * Base path: /api/auth  (mounted in app.js)
 *
 * POST /api/auth/register  — create a new account
 * POST /api/auth/login     — login and receive a JWT
 * GET  /api/auth/me        — get the authenticated user (protected)
 */

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;