import express from "express";
import { getRoomInfo, getUserRooms } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getUserRooms);
router.get("/:roomId", getRoomInfo);

export default router;