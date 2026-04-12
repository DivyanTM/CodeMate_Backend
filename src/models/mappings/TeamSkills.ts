import mongoose from "mongoose";

const teamSkillsSchema = new mongoose.Schema({

    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    proficiencyLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },    

}, {
    timestamps: true
});

export const TeamSkills = mongoose.model("TeamSkills", teamSkillsSchema);