import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
    {
        teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
        },
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        role: {
        type: String,
        enum: ["developer", "admin", "owner"],
        default: "developer",
        },
        joinedAt: { type: Date },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    {
        timestamps: true,
    },
);

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
