import fs from 'fs';
import path from 'path';
import { ResponseBody } from '../models/ResponseBody.js';
import AppError from '../utils/AppError.js';

const logDir = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDir, 'error.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        if (err.statusCode === 500) {
            const time = new Date().toISOString();
            const log = `${time} [${req.method}] ${req.path} - ${err.stack || err.toString()}\n`;

            fs.appendFile(logFilePath, log, fileErr => {
                if (fileErr) console.error('Error writing to log file:', fileErr);
            });
        }

        return res.status(err.statusCode).json(
            ResponseBody.error(err.message, err.data)
        );
    }


    console.error(`EM [${req.path}] :`, err);
    const time = new Date().toISOString();
    const log = `${time} [${req.method}] ${req.path} - ${err.stack || err.toString()}\n`;

    fs.appendFile(logFilePath, log, fileErr => {
        if (fileErr) console.error('Error writing to log file:', fileErr);
    });

    return res.status(500).json(
        ResponseBody.error('Internal Server Error', { error: 'An unexpected error occurred' })
    );
};

export default errorMiddleware;