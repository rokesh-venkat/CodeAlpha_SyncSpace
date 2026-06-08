import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    sender: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    message: { type: String, required: true, trim: true, maxlength: [2000, "Message too long"] },
    reactions: [{ emoji: String, users: [String] }],
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: 1 });
const Message = mongoose.model("Message", messageSchema);
export default Message;