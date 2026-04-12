import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";



export const errorMiddleWare: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
    ) => {
    const statusCode = err instanceof AppError ? err.statusCode : HTTPStatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || "Something went wrong!";

    logger.error(
        `${err instanceof AppError ? "AppError" : "Unexpected Error"}: ${message}`,
        {
        method: req.method,
        path: req.path,
        stack: err.stack,
        },
    );

    res.status(statusCode).json({
        status: "error",
        message: message,
        ...(process.env['NODE_ENV'] === "development" && { stack: err.stack }),
    });
};
