import { Types } from "mongoose";

export interface IProject {
    _id: Types.ObjectId;
    title: string;
    status: "active" | "inactive";
    createdBy: Types.ObjectId;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectSkill {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    skillId: Types.ObjectId;
    proficiencyLevel: "beginner" | "intermediate" | "advanced";
    createdAt: Date;
    updatedAt: Date;
}

export interface IProjectMember {
    _id: Types.ObjectId;
    projectId: Types.ObjectId;
    userId: Types.ObjectId;
    role: "developer" | "admin" | "owner";
    joinedAt: Date;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}
