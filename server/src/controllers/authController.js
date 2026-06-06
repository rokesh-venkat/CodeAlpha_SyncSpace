import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 *
 * Flow:
 * 1. Validate that all required fields are present
 * 2. Check that the email is not already taken
 * 3. Create the user (password is hashed by the pre-save hook in User.js)
 * 4. Return the new user object + a fresh JWT
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Field validation ──────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ── Duplicate email check ─────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    // ── Create user ───────────────────────────────────────────────────
    // The User pre-save hook automatically hashes the password.
    const user = await User.create({ name, email, password });

    // ── Respond ───────────────────────────────────────────────────────
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Mongoose validation errors (e.g. invalid email format, name too short)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0], // Return the first validation error
      });
    }

    console.error("registerUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 *
 * Flow:
 * 1. Validate email + password are present
 * 2. Find the user by email (explicitly selecting password since it's select:false)
 * 3. Compare the entered password against the stored hash
 * 4. Return the user object + a fresh JWT
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Field validation ──────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // ── Find user — must opt-in to password field ─────────────────────
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Use a generic message to avoid revealing whether the email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── Password comparison ───────────────────────────────────────────
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── Respond ───────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private (requires valid JWT via protect middleware)
 *
 * By the time this runs, protect middleware has already:
 * - Verified the JWT
 * - Attached req.user to the request
 *
 * We simply return req.user — no extra DB query needed here.
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};