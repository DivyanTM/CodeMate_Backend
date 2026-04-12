import mongoose from "mongoose";

const projectTeamSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
}, {
    timestamps: true
});

export const ProjectTeam = mongoose.model("ProjectTeam", projectTeamSchema);