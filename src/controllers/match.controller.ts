import type { Request, Response } from "express";
import { MatchService } from "../services/Match.service.js";
import { AppError } from "../utils/AppError.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { MatchValidator } from "../validations/match/match.validator.js";

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

async function getCandidates(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const { error, value } = MatchValidator.getCandidatesSchema.validate(
        req.query ?? {},
        VALIDATE_OPTS,
    );
    if (error)
        throw new AppError(
        error.details?.[0]?.message || "Invalid input",
        HTTPStatusCodes.BAD_REQUEST,
        );

    const { maxDistanceKm, limit } = value;
    const candidates = await MatchService.getCandidates(
        userId,
        maxDistanceKm,
        limit,
    );

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { candidates },
    });
}

async function likeUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    const targetId = getParam(req, "targetId");

    const match = await MatchService.likeUser(userId, targetId);

    res.status(HTTPStatusCodes.CREATED).json({
        status: "success",
        data: {
        match,
        
        matched: match.status === "accepted",
        },
    });
}

async function rejectUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    const targetId = getParam(req, "targetId");

    await MatchService.rejectUser(userId, targetId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "User rejected",
    });
}

async function getAcceptedMatches(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const matches = await MatchService.getAcceptedMatches(userId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { matches },
    });
}

async function getPendingLikes(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);

    const likes = await MatchService.getPendingLikes(userId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        data: { likes },
    });
}

async function unmatch(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", HTTPStatusCodes.UNAUTHORIZED);
    const matchId = getParam(req, "matchId");

    await MatchService.unmatch(userId, matchId);

    res.status(HTTPStatusCodes.OK).json({
        status: "success",
        message: "Unmatched successfully",
    });
}

export const MatchController = {
    getCandidates,
    likeUser,
    rejectUser,
    getAcceptedMatches,
    getPendingLikes,
    unmatch,
};
