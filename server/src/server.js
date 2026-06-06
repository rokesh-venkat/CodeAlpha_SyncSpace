import dotenv from "dotenv";
import { createServer } from "http";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";
import initSocket from "./socket/index.js";

const PORT = process.env.PORT || 5000;

/**
 * Startup sequence:
 * 1. Connect MongoDB
 * 2. Create HTTP server from Express app
 * 3. Attach Socket.IO to the HTTP server
 * 4. Start listening
 *
 * IMPORTANT: Socket.IO must share the same HTTP server as Express
 * so both REST and WebSocket traffic go through port 5000.
 */
const startServer = async () => {
  await connectDB();

  // Wrap Express in a raw HTTP server — required for Socket.IO
  const httpServer = createServer(app);

  // Attach Socket.IO
  const io = initSocket(httpServer);

  // Make io available to Express route handlers if needed in future
  app.set("io", io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`Socket.IO ready on ws://localhost:${PORT}`);
  });
};

startServer();