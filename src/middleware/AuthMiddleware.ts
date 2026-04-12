import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/Token.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
        throw new AppError("No token provided.", HTTPStatusCodes.UNAUTHORIZED);

    const token = authHeader.split(" ")[1] || "";

    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
}
