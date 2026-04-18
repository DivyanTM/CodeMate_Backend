import Joi from "joi";

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        "any.required": "Current password is required",
        "string.base": "Current password must be a string",
    }),
    newPassword: Joi.string()
        .min(8)
        .max(64)
        .pattern(/[A-Z]/, "uppercase")
        .pattern(/[a-z]/, "lowercase")
        .pattern(/[0-9]/, "number")
        .pattern(/[^A-Za-z0-9]/, "special character")
        .disallow(Joi.ref("currentPassword"))
        .required()
        .messages({
        "any.required": "New password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 64 characters",
        "string.pattern.name": "Password must contain at least one {#name}",
        "any.invalid": "New password must differ from current password",
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your new password",
        }),
});
