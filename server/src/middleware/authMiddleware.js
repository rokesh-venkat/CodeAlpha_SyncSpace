import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protect — middleware that guards private routes.
 *
 * Workflow:
 * 1. Read the Authorization header: "Bearer <token>"
 * 2. Verify the token using JWT_SECRET
 * 3. Decode the payload to get the user ID
 * 4. Look up the user in MongoDB (ensures the account still exists)
 * 5. Attach the user document to req.user for downstream handlers
 * 6. Call next() to pass control to the route handler
 *
 * On any failure, respond with 401 Unauthorized immediately.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // ── Extract token from Authorization header ───────────────────────
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    // ── Verify token signature and expiry ─────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // jwt.verify throws specific errors we can use for better messages
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired — please log in again",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Not authorized — invalid token",
      });
    }

    // ── Load user from DB ─────────────────────────────────────────────
    // This confirms the account still exists (e.g. not deleted after token was issued).
    // Password is excluded via select:false on the model.
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists",
      });
    }

    // ── Attach user to request object ─────────────────────────────────
    req.user = user;
    next();
  } catch (error) {
    console.error("protect middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};