import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    profilePicture: { type: Buffer, default: null, contentType: String },
    headline: { type: String, default: "" },
    githubURI: { type: String, default: "" },
    linkedinURI: { type: String, default: "" },
    portfolioURI: { type: String, default: "" },
    lastKnownLocation: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
});


export const User = mongoose.model("User", userSchema);