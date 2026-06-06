import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * socketAuth — middleware that runs before a socket connection is accepted.
 *
 * The client must pass the JWT in the handshake auth object:
 *   socket = io(URL, { auth: { token: "Bearer eyJ..." } })
 *
 * Workflow:
 * 1. Extract token from socket.handshake.auth.token
 * 2. Verify with JWT_SECRET
 * 3. Load the user from MongoDB
 * 4. Attach user to socket.user
 * 5. Call next() to allow the connection
 * 6. On any failure, call next(error) to reject the connection
 */
const socketAuth = async (socket, next) => {
  try {
    // ── Extract token ──────────────────────────────────────────────
    const rawToken = socket.handshake.auth?.token;

    if (!rawToken) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Strip "Bearer " prefix if present
    const token = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7)
      : rawToken;

    // ── Verify token ───────────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("Authentication error: Token expired"));
      }
      return next(new Error("Authentication error: Invalid token"));
    }

    // ── Load user ──────────────────────────────────────────────────
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // ── Attach to socket ───────────────────────────────────────────
    socket.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    console.error("socketAuth error:", error.message);
    next(new Error("Authentication error: Server error"));
  }
};

export default socketAuth;