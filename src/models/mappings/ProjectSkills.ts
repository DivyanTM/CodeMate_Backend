import mongoose from "mongoose";

const projectSkillsSchema = new mongoose.Schema({

    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    proficiencyLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },

}, {
    timestamps: true
});

export const ProjectSkills = mongoose.model("ProjectSkills", projectSkillsSchema);