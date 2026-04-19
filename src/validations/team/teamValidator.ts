import Joi from "joi";

const createTeamSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required().messages({
        "any.required": "Team name is required",
        "string.min": "Team name must be at least 3 characters",
        "string.max": "Team name must not exceed 100 characters",
    }),
    visibility: Joi.string().valid("public", "private").required().messages({
        "any.required": "Visibility is required",
        "any.only": "Visibility must be public or private",
    }),
    description: Joi.string().trim().max(500).optional().messages({
        "string.max": "Description must not exceed 500 characters",
    }),
    });

    const updateTeamSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).optional(),
    visibility: Joi.string().valid("public", "private").optional(),
    description: Joi.string().trim().max(500).optional(),
    skills: Joi.array().items(Joi.string().trim()).optional(),
    }).min(1);

    const addTeamSkillSchema = Joi.object({
    skillId: Joi.string().hex().length(24).required().messages({
        "any.required": "Skill ID is required",
        "string.hex": "Skill ID must be a valid ID",
    }),
    proficiencyLevel: Joi.string()
        .valid("beginner", "intermediate", "advanced")
        .default("beginner")
        .messages({
        "any.only":
            "Proficiency level must be beginner, intermediate, or advanced",
        }),
});

const addTeamMemberSchema = Joi.object({
    identifier: Joi.string().trim().required().messages({
        "any.required": "Username or email is required",
        "string.empty": "Username or email cannot be empty",
    }),
    role: Joi.string().valid("developer", "admin").default("developer").messages({
        "any.only": "Role must be developer or admin",
    }),
});

const updateMemberRoleSchema = Joi.object({
    role: Joi.string().valid("developer", "admin").required().messages({
        "any.required": "Role is required",
        "any.only": "Role must be developer or admin",
    }),
});

const assignTeamToProjectSchema = Joi.object({
    projectId: Joi.string().hex().length(24).required().messages({
        "any.required": "Project ID is required",
        "string.hex": "Project ID must be a valid ID",
    }),
});



export const TeamValidator = {
    createTeamSchema,
    updateTeamSchema,
    addTeamSkillSchema,
    addTeamMemberSchema,
    updateMemberRoleSchema,
    assignTeamToProjectSchema,
};
