import multer from "multer";
import { HTTPStatusCodes } from "../constants/HttpStatusCodes.js";
import { AppError } from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
        } else {
        cb(new AppError("Invalid file type", HTTPStatusCodes.BAD_REQUEST));
        }
    },
});
