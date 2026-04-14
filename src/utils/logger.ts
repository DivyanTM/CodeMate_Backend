import winston from "winston";

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const isProduction = process.env["NODE_ENV"] === "production";


const jsonFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);


const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple(),
);


const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",
    levels,
    format: jsonFormat,
    transports: [
        new winston.transports.Console({
        format: isProduction ? jsonFormat : consoleFormat,
        }),
    ],
});


if (!isProduction) {
    logger.add(
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    );
    logger.add(new winston.transports.File({ filename: "logs/combined.log" }));

    logger.exceptions.handle(
        new winston.transports.File({ filename: "logs/exceptions.log" }),
    );
    logger.rejections.handle(
        new winston.transports.File({ filename: "logs/rejections.log" }),
    );
}

export default logger;
