import Joi from "joi";

const getCandidatesSchema = Joi.object({
    maxDistanceKm: Joi.number().min(1).max(20000).default(100).messages({
        "number.min": "Distance must be at least 1km",
        "number.max": "Distance must not exceed 20000km",
    }),
    limit: Joi.number().min(1).max(100).default(20).messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit must not exceed 100",
    }),
});

export const MatchValidator = { getCandidatesSchema };
