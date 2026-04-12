import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({

    organisationName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    role: { type: String, required: true },
    description: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
},{
    timestamps: true
});


export const Experience = mongoose.model("Experience", experienceSchema);