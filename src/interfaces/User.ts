import mongoose from "mongoose";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    dateOfBirth: Date;
    email: string;
    password: string;
    bio: string;
    profilePicture: Buffer | null;
    headline: string;
    githubURI: string;
    linkedinURI: string;
    portfolioURI: string;
    lastKnownLocation: number[];
    createdAt: Date;
    updatedAt?: Date;
    status: "active" | "inactive";
}

export interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
