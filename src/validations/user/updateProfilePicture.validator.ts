import Joi from "joi";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

export const updateProfilePictureSchema = Joi.object({
    mimetype: Joi.string()
        .valid(...ALLOWED_MIME_TYPES)
        .required()
        .messages({
        "any.only": `File must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`,
        }),
    size: Joi.number().max(MAX_FILE_SIZE).required().messages({
        "number.max": "File size must not exceed 5MB",
    }),
});
    