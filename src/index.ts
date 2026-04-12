import dotenv from "dotenv";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { errorMiddleWare } from "./middleware/ErrorMiddleware.js";
import { AppError } from "./utils/AppError.js";
import logger from "./utils/logger.js";

dotenv.config();

await connectDB();

const app: Application = express();

app.use(helmet());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  logger.http(`Accessing root from ${req.ip}`);
  throw new AppError("Test error triggered", 400);
});

app.use(errorMiddleWare);

const PORT = process.env['PORT'] || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
