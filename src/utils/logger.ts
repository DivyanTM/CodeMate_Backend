import winston from "winston";


    const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    };

    const logger = winston.createLogger({
    level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    ),
    transports: [
        
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" }),
    ],
    });

    if (process.env["NODE_ENV"] !== "production") {
    logger.add(
        new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple(),
        ),
        }),
    );
}

export default logger;
