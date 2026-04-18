import type { Request, Response } from "express";
import { ProjectService } from "../services/Project.service.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { ProjectValidator } from "../validations/project/projectValidator.js";


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



async function createProject(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = ProjectValidator.createProjectSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { title, description } = value;
    const project = await ProjectService.createProject(
        userId,
        title,
        description,
    );

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { project } });
}

async function getProjectById(req: Request, res: Response): Promise<void> {
    const projectId = getParam(req, "projectId");

    const project = await ProjectService.getProjectById(projectId);
    if (!project)
        throw new AppError("Project not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { project } });
}

async function updateProject(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");

    const { error, value } = ProjectValidator.updateProjectSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { title, description } = value;
    const project = await ProjectService.updateProject(
        projectId,
        title,
        description,
    );
    if (!project)
        throw new AppError("Project not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { project } });
}

async function deleteProject(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");
    await ProjectService.deleteProject(projectId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Project deleted successfully" });
}



async function addProjectSkill(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");

    const { error, value } = ProjectValidator.addProjectSkillSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { skillId, proficiencyLevel } = value;
    const skill = await ProjectService.addProjectSkill(
        projectId,
        skillId,
        proficiencyLevel,
    );

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { skill } });
}

async function removeProjectSkill(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");
    const skillId = getParam(req, "skillId");

    await ProjectService.removeProjectSkill(projectId, skillId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Skill removed from project" });
}

async function getProjectSkills(req: Request, res: Response): Promise<void> {
    const projectId = getParam(req, "projectId");
    const skills = await ProjectService.getProjectSkills(projectId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { skills } });
}



async function addProjectMember(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");

    const { error, value } = ProjectValidator.addProjectMemberSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { userId: memberId, role } = value;
    const member = await ProjectService.addProjectMember(
        projectId,
        memberId,
        role,
    );

    res
        .status(HTTPStatusCodes.CREATED)
        .json({ status: "success", data: { member } });
}

async function removeProjectMember(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");
    const memberId = getParam(req, "memberId");

    await ProjectService.removeProjectMember(projectId, memberId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", message: "Member removed from project" });
}

async function updateMemberRole(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projectId = getParam(req, "projectId");
    const memberId = getParam(req, "memberId");

    const { error, value } = ProjectValidator.updateMemberRoleSchema.validate(
        req.body ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { role } = value;
    const member = await ProjectService.updateMemberRole(
        projectId,
        memberId,
        role,
    );
    if (!member)
        throw new AppError("Member not found", HTTPStatusCodes.NOT_FOUND);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { member } });
}

async function getProjectMembers(req: Request, res: Response): Promise<void> {
    const projectId = getParam(req, "projectId");
    const members = await ProjectService.getProjectMembers(projectId);

    res.status(HTTPStatusCodes.OK).json({ status: "success", data: { members } });
}

async function getProjectsByUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const projects = await ProjectService.getProjectsByUser(userId);

    res
        .status(HTTPStatusCodes.OK)
        .json({ status: "success", data: { projects } });
}

export const ProjectController = {
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
