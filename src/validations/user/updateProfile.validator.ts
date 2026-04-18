import Joi from "joi";

const httpsUri = Joi.string()
    .uri({ scheme: ["https"] })
    .optional();

export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    bio: Joi.string().trim().max(160).optional(),
    headline: Joi.string().trim().max(100).optional(),
    githubURI: httpsUri,
    linkedinURI: httpsUri,
    portfolioURI: httpsUri,
    lastKnownLocation: Joi.array().items(Joi.number()).length(2).optional(),
}).min(1);
