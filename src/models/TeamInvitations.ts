import mongoose from "mongoose";


const teamInvitationSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    role: { type: String, enum: ["developer", "admin"], default: "developer" },
}, {
    timestamps: true,
    expireAfterSeconds: 30 * 24 * 60 * 60
});

export const TeamInvitation = mongoose.model("TeamInvitation",teamInvitationSchema);