import Message from "../models/Message.js";

/**
 * getMessages — GET /api/messages/:roomId
 * Returns the last 50 messages for a room (chat history on join).
 */
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("getMessages error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

/**
 * deleteMessage — DELETE /api/messages/:messageId
 * Only the sender can delete their own message.
 */
export const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (msg.sender._id !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    await msg.deleteOne();
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};