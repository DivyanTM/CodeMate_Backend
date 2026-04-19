import type { Request, Response } from "express";
import { TeamService } from "../services/Team.service.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { TeamValidator } from "../validations/team/teamValidator.js";

const VALIDATE_OPTS = {
    errors: { wrap: { label: false as false } },
    stripUnknown: true,
};

function getParam(req: Request, key: string): string {
    const val = req.params[key];
    if (!val || Array.isArray(val))
        throw new AppError(`Missing param: ${key}`, HTTPStatusCodes.BAD_REQUEST);
    return val;
}



async function createTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = TeamValidator.createTeamSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { name, visibility, description } = value;
    const team = await TeamService.createTeam(
        userId,
        name,
        visibility,
        description,
    );

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { team } });
}

async function getTeamById(req: Request, res: Response): Promise<void> {
    const teamId = getParam(req, "teamId");

    const team = await TeamService.getTeamById(teamId);
    if (!team) throw new AppError("Team not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { team } });
}

async function updateTeam(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");

    const { error, value } = TeamValidator.updateTeamSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { name, visibility, description,skills } = value;
    const team = await TeamService.updateTeam(
        teamId,
        name,
        visibility,
        description,
        skills
    );
    if (!team) throw new AppError("Team not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { team } });
}


async function addTeamSkill(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");

    const { error, value } = TeamValidator.addTeamSkillSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { skillId, proficiencyLevel } = value;
    const skill = await TeamService.addTeamSkill(
        teamId,
        skillId,
        proficiencyLevel,
    );

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { skill } });
}

async function removeTeamSkill(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");
    const skillId = getParam(req, "skillId");
    await TeamService.removeTeamSkill(teamId, skillId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Skill removed from team" });
}

async function getTeamSkills(req: Request, res: Response): Promise<void> {
    const teamId = getParam(req, "teamId");
    const skills = await TeamService.getTeamSkills(teamId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { skills } });
}



async function addTeamMember(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");

    const { error, value } = TeamValidator.addTeamMemberSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { identifier, role } = value;
    const member = await TeamService.addTeamMember(teamId, identifier, role);

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { member } });
}

async function removeTeamMember(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");
    const memberId = getParam(req, "memberId");
    await TeamService.removeTeamMember(teamId, memberId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Member removed from team" });
}

async function updateMemberRole(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");
    const memberId = getParam(req, "memberId");

    const { error, value } = TeamValidator.updateMemberRoleSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { role } = value;
    const member = await TeamService.updateMemberRole(teamId, memberId, role);
    if (!member)
        throw new AppError("Member not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { member } });
}

async function getTeamMembers(req: Request, res: Response): Promise<void> {
    const teamId = getParam(req, "teamId");
    const members = await TeamService.getTeamMembers(teamId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { members } });
}

async function getTeamsByUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teams = await TeamService.getTeamsByUser(userId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { teams } });
}


async function assignTeamToProject(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");

    const { error, value } = TeamValidator.assignTeamToProjectSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { projectId } = value;
    const mapping = await TeamService.assignTeamToProject(projectId, teamId);

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { mapping } });
}

async function removeTeamFromProject(req: Request, res: Response,): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const teamId = getParam(req, "teamId");
    const projectId = getParam(req, "projectId");
    await TeamService.removeTeamFromProject(projectId, teamId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Team removed from project" });
}

async function getProjectTeams(req: Request, res: Response): Promise<void> {
    const projectId = getParam(req, "projectId");
    const teams = await TeamService.getProjectTeams(projectId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { teams } });
}

export const TeamController = {
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
