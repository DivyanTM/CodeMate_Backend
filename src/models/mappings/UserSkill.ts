import mongoose from 'mongoose';

const UserSkillSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    proficiency: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },

}, { timestamps: true });

export const UserSkill = mongoose.model("UserSkill", UserSkillSchema);