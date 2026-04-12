import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String},
},
    { timestamps: true }
);


export const Skill = mongoose.model("Skill", skillSchema);