import { Types } from "mongoose";

export interface IMatch {
    _id: Types.ObjectId;
    person1: Types.ObjectId;
    person2: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

export interface IMatchCandidate {
    user: {
        _id: Types.ObjectId;
        name: string;
        headline: string;
        bio: string;
        profilePicture: Buffer | null;
        lastKnownLocation: number[];
    };
    score: number;
    sharedSkills: string[];
    distanceKm: number | null;
}
