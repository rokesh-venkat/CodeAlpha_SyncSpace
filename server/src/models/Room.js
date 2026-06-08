import mongoose from "mongoose";

/**
 * RoomSchema — tracks active meeting rooms and their participants.
 */
const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "SyncSpace Meeting" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String, default: "" },
        isHost: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;