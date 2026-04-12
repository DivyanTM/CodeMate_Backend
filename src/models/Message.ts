import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
}, {
    timestamps: true
});

export const Message = mongoose.model("Message", messageSchema);