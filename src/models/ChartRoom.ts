import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["dm", "project", "team"],
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["Project", "Team"],
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true },
);

chatRoomSchema.index({ type: 1, participants: 1 });

// CORRECTED INDEX:
chatRoomSchema.index(
  { type: 1, reference: 1 }, 
  { 
    unique: true, 
    // This tells MongoDB to completely ignore "dm" rooms for this unique rule
    partialFilterExpression: { type: { $ne: "dm" } } 
  }
);

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
