import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    person1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    person2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, {
    timestamps: true
});

export const Match = mongoose.model("Match", matchSchema);