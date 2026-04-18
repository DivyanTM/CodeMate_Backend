import dotenv from "dotenv";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { errorMiddleWare } from "./middleware/ErrorMiddleware.js";
import { AuthRoutes } from "./routes/auth.routes.js";
import { AppError } from "./utils/AppError.js";
import logger from "./utils/logger.js";
import { UserRoutes } from "./routes/user.routes.js";

dotenv.config();

await connectDB();

const app: Application = express();

app.use(helmet());
app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const url = req.originalUrl;
  if (url.startsWith("/api/auth")) {
    next();
  } else {
    errorMiddleWare(err,req, res, next);
  }
});

app.get("/", (req: Request, _: Response) => {
  logger.http(`Accessing root from ${req.ip}`);
  throw new AppError("Test error triggered", 400);
});

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);

app.use(errorMiddleWare);

const PORT = process.env["PORT"] || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
