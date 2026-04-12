import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    visibility: { type: String, required: true },
    description: { type: String },
    status:{type: Boolean, default: true},
}, {
    timestamps: true
});

export const Team = mongoose.model("Team", teamSchema);