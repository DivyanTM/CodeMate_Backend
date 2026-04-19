import { Project } from "../models/Project.js";
import { ProjectSkills } from "../models/mappings/ProjectSkills.js";
import { ProjectMember } from "../models/mappings/ProjectMember.js";

import type { IProject, IProjectSkill, IProjectMember } from "../interfaces/Project.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { Skill } from "../models/Skills.js";
import { ProjectTeam } from "../models/mappings/ProjectTeam.js";

// ─────────────────────────── CRUD ────────────────────────────────────

async function createProject( userId: string, title: string,description?: string, ): Promise<IProject> {
    const project = await Project.create({
        title,
        description: description ?? null, 
        status: "active",
        createdBy: userId,
    });

    await ProjectMember.create({
        projectId: (project as any)._id,
        userId,
        role: "owner",
        joinedAt: new Date(),
        status: "active",
    });

    return (project as any).toObject() as IProject;
}

async function getProjectById(projectId: string): Promise<IProject | null> {
    const project = await Project.findById(projectId);
    return project ? (project.toObject() as IProject) : null;
}

async function updateProject( 
    projectId: string,
    title?: string,
    description?: string,
    status?: "active" | "inactive",
    skills?: string[],
    teamId?: string | null
): Promise<IProject | null> {
    
    // 1. Update the core project document
    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            updatedAt: new Date(),
        },
        { returnDocument: 'after', runValidators: true },
    );

    if (!project) return null;

    // 2. Sync the skills mapping if an array was provided
    if (skills && Array.isArray(skills)) {
        const projectSkillEntries = [];

        for (const sName of skills) {
            const cleanName = sName.trim();
            if (!cleanName) continue;

            // Find existing skill or create a new one
            let skillDoc = await Skill.findOne({ name: new RegExp(`^${cleanName}$`, 'i') });
            if (!skillDoc) {
                skillDoc = await Skill.create({ name: cleanName, type: "technical" });
            }

            projectSkillEntries.push({
                projectId,
                skillId: skillDoc._id,
                proficiencyLevel: "intermediate"
            });
        }

        // Wipe old skills for this project and insert the fresh list
        await ProjectSkills.deleteMany({ projectId });
        if (projectSkillEntries.length > 0) {
            await ProjectSkills.insertMany(projectSkillEntries);
        }
    }

    if (teamId !== undefined) {
        if (teamId === null || teamId === "") {
            // Remove the team assignment
            await ProjectTeam.findOneAndDelete({ projectId });
        } else {
            // Upsert: Update if exists, Create if it doesn't
            await ProjectTeam.findOneAndUpdate(
                { projectId },
                { teamId },
                { upsert: true, returnDocument: 'after' }        
            );
        }
    }

    return project.toObject() as IProject;
}
async function deleteProject(projectId: string): Promise<void> {
    await Project.findByIdAndUpdate(projectId, {
        status: "inactive",
        updatedAt: new Date(),
    });
}

// ─────────────────────────────────────────────────── Project Skills ──────────────────────────────────────────────────────────

async function addProjectSkill( projectId: string, skillId: string,proficiencyLevel: "beginner" | "intermediate" | "advanced" = "beginner",): Promise<IProjectSkill> {
    const existing = await ProjectSkills.findOne({ projectId, skillId });
    if (existing)
        throw new AppError(
        "Skill already added to project",
        HTTPStatusCodes.CONFLICT,
        );

    const skill = await ProjectSkills.create({
        projectId,
        skillId,
        proficiencyLevel,
    });
    return skill.toObject() as IProjectSkill;
}

async function removeProjectSkill( projectId: string,skillId: string, ): Promise<void> {
    const skill = await ProjectSkills.findOneAndDelete({ projectId, skillId });
    if (!skill)
        throw new AppError("Skill not found in project", HTTPStatusCodes.NOT_FOUND);
}

async function getProjectSkills(projectId: string): Promise<IProjectSkill[]> {
    const skills = await ProjectSkills.find({ projectId }).populate("skillId");
    return skills.map((s) => s.toObject() as IProjectSkill);
}

// ─────────────────────────────────────────────────── Project Members ─────────────────────────────────────────────────────────

async function addProjectMember( projectId: string, userId: string, role: "developer" | "admin" = "developer", ): Promise<IProjectMember> {
    const existing = await ProjectMember.findOne({ projectId, userId });
    if (existing)
        throw new AppError("User is already a member", HTTPStatusCodes.CONFLICT);

    const member = await ProjectMember.create({
        projectId,
        userId,
        role,
        joinedAt: new Date(),
        status: "active",
    });
    return member.toObject() as IProjectMember;
}

async function removeProjectMember( projectId: string, userId: string,
): Promise<void> {
    const member = await ProjectMember.findOne({ projectId, userId });
    if (!member)
        throw new AppError(
        "Member not found in project",
        HTTPStatusCodes.NOT_FOUND,
        );
    if (member.role === "owner")
        throw new AppError(
        "Cannot remove project owner",
        HTTPStatusCodes.FORBIDDEN,
        );

    await ProjectMember.findOneAndUpdate(
        { projectId, userId },
        { status: "inactive", updatedAt: new Date() },
    );
}

async function updateMemberRole( projectId: string,userId: string, role: "developer" | "admin", ): Promise<IProjectMember | null> {
    const member = await ProjectMember.findOne({ projectId, userId });
    if (!member)
        throw new AppError( 
        "Member not found in project",
        HTTPStatusCodes.NOT_FOUND,
        );
    if (member.role === "owner")
        throw new AppError("Cannot change owner role", HTTPStatusCodes.FORBIDDEN);

    const updated = await ProjectMember.findOneAndUpdate(
        { projectId, userId, status: "active" },
        { role, updatedAt: new Date() },
        { new: true },
    );
    return updated ? (updated.toObject() as IProjectMember) : null;
}

async function getProjectMembers(projectId: string): Promise<IProjectMember[]> {
    const members = await ProjectMember.find({
        projectId,
        status: "active",
    }).populate("userId");
    return members.map((m) => m.toObject() as IProjectMember);
}

async function getProjectsByUser(userId: string): Promise<any[]> {
    const projectMembers = await ProjectMember.find({
        userId,
        status: "active",
    }).populate("projectId");

    const projectsWithTeams = await Promise.all(
        projectMembers.map(async (p) => {
            const projectObj = p.toObject();
            const projectData = projectObj.projectId as any;
            
            // Check if projectId populated successfully
            if (projectData && projectData._id) {
                // Look for the team mapping
                const teamMapping = await ProjectTeam.findOne({ projectId: projectData._id });
                
                if (teamMapping) {
                    // Force it to a string so it easily passes through JSON
                    projectData.linkedTeamId = teamMapping.teamId.toString();
                    console.log(`Attached Team ${projectData.linkedTeamId} to Project ${projectData.title}`); // <-- DEBUG LOG
                }
            }
            return projectObj;
        })
    );

    return projectsWithTeams;
}

export const ProjectService = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectSkill,
    removeProjectSkill,
    getProjectSkills,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    getProjectMembers,
    getProjectsByUser,
};
