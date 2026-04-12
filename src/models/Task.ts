import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
    doneBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doneAt : { type: Date },
}, {
    timestamps: true
});

export const Task = mongoose.model("Task", taskSchema);