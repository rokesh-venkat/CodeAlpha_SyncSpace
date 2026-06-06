/**
 * errorMiddleware — global Express error handler.
 *
 * Must be registered LAST in app.js (after all routes).
 * Called when a route handler calls next(error) or throws
 * inside an async handler wrapped with asyncHandler.
 *
 * Handles:
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose duplicate key error (code 11000)
 * - Mongoose ValidationError
 * - Generic server errors
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: invalid ObjectId ────────────────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // ── Mongoose: duplicate key (e.g. duplicate email) ────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists`;
  }

  // ── Mongoose: validation errors ───────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Log full error stack in development only
  if (process.env.NODE_ENV === "development") {
    console.error("[ErrorHandler]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * notFound — catches any request that falls through all routes.
 * Register this BEFORE errorHandler in app.js.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};