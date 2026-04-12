import Joi from "joi";

export const registrationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    dateOfBirth: Joi.date().less('now').required()
});