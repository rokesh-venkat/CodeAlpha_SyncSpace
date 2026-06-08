import Room from "../models/Room.js";

/**
 * getRoomInfo — GET /api/rooms/:roomId
 */
export const getRoomInfo = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate("createdBy", "name avatar")
      .populate("participants", "name avatar");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch room" });
  }
};

/**
 * getUserRooms — GET /api/rooms — rooms the current user has participated in
 */
export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("createdBy", "name avatar")
      .lean();

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
};