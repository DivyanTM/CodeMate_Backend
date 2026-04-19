import { Team } from "../models/Team.js";
import { TeamMember } from "../models/mappings/TeamMember.js";
import { TeamSkills } from "../models/mappings/TeamSkills.js";
import { ProjectTeam } from "../models/mappings/ProjectTeam.js";
import type {
    ITeam,
    ITeamMember,
    ITeamSkill,
    IProjectTeam,
} from "../interfaces/Team.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { User } from "../models/User.js";
import { Skill } from "../models/Skills.js";

async function createTeam( userId: string, name: string, visibility: "public" | "private", description?: string, ): Promise<ITeam> {
    const team = await Team.create({
        name,
        visibility,
        description: description ?? null,
        status: true,
    });

    await TeamMember.create({
        teamId: (team as any)._id,
        userId,
        role: "owner",
        joinedAt: new Date(),
        status: "active",
    });

    return (team as any).toObject() as ITeam;
}

async function getTeamById(teamId: string): Promise<ITeam | null> {
    const team = await Team.findById(teamId);
    return team ? (team.toObject() as ITeam) : null;
}

async function updateTeam( teamId: string,name?: string, visibility?: "public" | "private",description?: string,skillNames?: string[] ): Promise<ITeam | null> {
    
        const team = await Team.findByIdAndUpdate(
        teamId,
        {
            ...(name && { name }),
            ...(visibility && { visibility }),
            ...(description !== undefined && { description }),
            updatedAt: new Date(),
        },
        { new: true, runValidators: true },
    );

    if (!team) return null;

    
    if (skillNames && Array.isArray(skillNames)) {
        const teamSkillEntries = [];

        for (const sName of skillNames) {
            const cleanName = sName.trim();
            if (!cleanName) continue;


            let skillDoc = await Skill.findOne({ name: new RegExp(`^${cleanName}$`, 'i') });
            
            if (!skillDoc) {
                skillDoc = await Skill.create({ name: cleanName, type: "general" });
            }

            teamSkillEntries.push({
                teamId,
                skillId: skillDoc._id,
                proficiencyLevel: "intermediate" 
            });
        }

        
        await TeamSkills.deleteMany({ teamId });
        if (teamSkillEntries.length > 0) {
            await TeamSkills.insertMany(teamSkillEntries);
        }
    }

    return team.toObject() as ITeam;
}

async function addTeamSkill( teamId: string, skillId: string, proficiencyLevel: "beginner" | "intermediate" | "advanced" = "beginner", ): Promise<ITeamSkill> {
    const existing = await TeamSkills.findOne({ teamId, skillId });
    if (existing)
        throw new AppError("Skill already added to team", HTTPStatusCodes.CONFLICT);

    const skill = await TeamSkills.create({ teamId, skillId, proficiencyLevel });
    return skill.toObject() as ITeamSkill;
}

async function removeTeamSkill(teamId: string, skillId: string): Promise<void> {
    const skill = await TeamSkills.findOneAndDelete({ teamId, skillId });
    if (!skill)
        throw new AppError("Skill not found in team", HTTPStatusCodes.NOT_FOUND);
}

async function getTeamSkills(teamId: string): Promise<ITeamSkill[]> {
    const skills = await TeamSkills.find({ teamId }).populate("skillId");
    return skills.map((s) => s.toObject() as ITeamSkill);
}



async function addTeamMember( 
    teamId: string, 
    identifier: string,    role: "developer" | "admin" = "developer", 
): Promise<ITeamMember> {

       const userDoc = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    if (!userDoc) {
        throw new AppError("User not found with that email or username", HTTPStatusCodes.NOT_FOUND);
    }

    const targetUserId = (userDoc as any)._id.toString();

        const existing = await TeamMember.findOne({ teamId, userId: targetUserId, status: "active" });
    if (existing) {
        throw new AppError("User is already a member of this team", HTTPStatusCodes.CONFLICT);
    }

        const member = await TeamMember.create({
        teamId,
        userId: targetUserId,
        role,
        joinedAt: new Date(),
        status: "active",
    });

    return member.toObject() as ITeamMember;
}

async function removeTeamMember(teamId: string, userId: string): Promise<void> {
    const member = await TeamMember.findOne({ teamId, userId });
    if (!member)
        throw new AppError("Member not found in team", HTTPStatusCodes.NOT_FOUND);
    if (member.role === "owner")
        throw new AppError("Cannot remove team owner", HTTPStatusCodes.FORBIDDEN);

    await TeamMember.findOneAndUpdate(
        { teamId, userId },
        { status: "inactive", updatedAt: new Date() },
    );
}

async function updateMemberRole( teamId: string, userId: string, role: "developer" | "admin",): Promise<ITeamMember | null> {
    const member = await TeamMember.findOne({ teamId, userId });
    if (!member)
        throw new AppError("Member not found in team", HTTPStatusCodes.NOT_FOUND);
    if (member.role === "owner")
        throw new AppError("Cannot change owner role", HTTPStatusCodes.FORBIDDEN);

    const updated = await TeamMember.findOneAndUpdate(
        { teamId, userId, status: "active" },
        { role, updatedAt: new Date() },
        { new: true },
    );
    return updated ? (updated.toObject() as ITeamMember) : null;
}

async function getTeamMembers(teamId: string): Promise<ITeamMember[]> {
    const members = await TeamMember.find({ teamId, status: "active" }).populate(
        "userId",
    );
    return members.map((m) => m.toObject() as ITeamMember);
}

async function getTeamsByUser(userId: string): Promise<ITeamMember[]> {
    const teams = await TeamMember.find({ userId, status: "active" }).populate(
        "teamId",
    );
    return teams.map((t) => t.toObject() as ITeamMember);
}



async function assignTeamToProject( projectId: string, teamId: string, ): Promise<IProjectTeam> {
    const existing = await ProjectTeam.findOne({ projectId, teamId });
    if (existing)
        throw new AppError(
        "Team already assigned to project",
        HTTPStatusCodes.CONFLICT,
        );

    const projectTeam = await ProjectTeam.create({ projectId, teamId });
    return projectTeam.toObject() as IProjectTeam;
}

async function removeTeamFromProject( projectId: string, teamId: string, ): Promise<void> {
    const mapping = await ProjectTeam.findOneAndDelete({ projectId, teamId });
    if (!mapping)
        throw new AppError(
        "Team not assigned to this project",
        HTTPStatusCodes.NOT_FOUND,
        );
}

async function getProjectTeams(projectId: string): Promise<IProjectTeam[]> {
    const teams = await ProjectTeam.find({ projectId }).populate("teamId");
    return teams.map((t) => t.toObject() as IProjectTeam);
}

export const TeamService = {
    createTeam,
    getTeamById,
    updateTeam,
    addTeamSkill,
    removeTeamSkill,
    getTeamSkills,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    getTeamMembers,
    getTeamsByUser,
    assignTeamToProject,
    removeTeamFromProject,
    getProjectTeams,
};
