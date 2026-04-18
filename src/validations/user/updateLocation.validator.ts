import Joi from "joi";


export const updateLocationSchema = Joi.object({
    lastKnownLocation: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required()
        .messages({
        "array.length":
            "Location must contain exactly 2 values [longitude, latitude]",
        "array.base": "Location must be an array",
        "any.required": "Location is required",
        }),
});