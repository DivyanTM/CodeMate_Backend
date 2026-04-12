import mongoose from "mongoose";

const projectTaskSchema = new mongoose.Schema({

    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },

}, {
    timestamps: true
});


export const ProjectTask = mongoose.model("ProjectTask", projectTaskSchema);