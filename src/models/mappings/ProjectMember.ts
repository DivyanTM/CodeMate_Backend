import mongoose from "mongoose";

const projectMemberSchemea = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["developer", "admin", "owner"], default: "developer" },
    joinedAt: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, {
    timestamps: true
});


export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchemea);