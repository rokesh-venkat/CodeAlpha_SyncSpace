import express from "express";
import { getMessages, deleteMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/messages/:roomId — load chat history
router.get("/:roomId", protect, getMessages);

// DELETE /api/messages/:messageId
router.delete("/:messageId", protect, deleteMessage);

export default router;