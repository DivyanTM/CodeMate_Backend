import Joi from "joi";

const createProjectSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required().messages({
        "any.required": "Title is required",
        "string.min": "Title must be at least 3 characters",
        "string.max": "Title must not exceed 100 characters",
    }),
    description: Joi.string().trim().max(500).optional().messages({
        "string.max": "Description must not exceed 500 characters",
    }),
});

const updateProjectSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
}).min(1);

const addProjectSkillSchema = Joi.object({
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

const addProjectMemberSchema = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        "any.required": "User ID is required",
        "string.hex": "User ID must be a valid ID",
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

export const ProjectValidator = {
    createProjectSchema,
    updateProjectSchema,
    addProjectSkillSchema,
    addProjectMemberSchema,
    updateMemberRoleSchema,
};
