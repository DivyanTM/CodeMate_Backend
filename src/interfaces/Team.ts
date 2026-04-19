import { Types } from "mongoose";

export interface ITeam {
    _id: Types.ObjectId;
    name: string;
    visibility: "public" | "private";
    description?: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
    }

export interface ITeamMember {
    _id: Types.ObjectId;
    teamId: Types.ObjectId;
    userId: Types.ObjectId;
    role: "developer" | "admin" | "owner";
    joinedAt: Date;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeamSkill {
    _id: Types.ObjectId;
    teamId: Types.ObjectId;
    skillId: Types.ObjectId;
    proficiencyLevel: "beginner" | "intermediate" | "advanced";
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectTeam {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    teamId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
