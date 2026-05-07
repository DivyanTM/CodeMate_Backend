import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/Token.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";

export function authMiddleware(
  req: Request,
  _: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      throw new AppError("No token provided.", HTTPStatusCodes.UNAUTHORIZED);

    const token = authHeader.split(" ")[1] || "";
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    // 🚀 CRITICAL FIX: Intercept JWT errors and convert them to your AppError
    if (err.name === "TokenExpiredError") {
      next(new AppError("Token expired. Please log in again.", HTTPStatusCodes.UNAUTHORIZED));
    } else if (err.name === "JsonWebTokenError") {
      next(new AppError("Invalid token.", HTTPStatusCodes.UNAUTHORIZED));
    } else {
      // If it's already an AppError (like the "No token provided" one), pass it normally
      next(err); 
    }
  }
}
