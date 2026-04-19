import dotenv from "dotenv";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { authMiddleware } from "./middleware/AuthMiddleware.js";
import { errorMiddleWare } from "./middleware/ErrorMiddleware.js";
import { AuthRoutes } from "./routes/auth.routes.js";
import { MatchRoutes } from "./routes/match.routes.js";
import { ProjectRoutes } from "./routes/project.routes.js";
import { TeamRoutes } from "./routes/team.routes.js";
import { UserRoutes } from "./routes/user.routes.js";
import { AppError } from "./utils/AppError.js";
import logger from "./utils/logger.js";

dotenv.config();

await connectDB();

const app: Application = express();

app.use(helmet());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const url = req.originalUrl;
  if (url.startsWith("/api/auth")) {
    next();
  } else {
    authMiddleware(req, res, next);
  }
});

app.get("/", (req: Request, _: Response) => {
  logger.http(`Accessing root from ${req.ip}`);
  throw new AppError("Test error triggered", 400);
});

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/project", ProjectRoutes);
app.use("/api/team", TeamRoutes);
app.use("/api/match", MatchRoutes);

app.use(errorMiddleWare);

const PORT = parseInt(process.env["PORT"] || "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on http://0.0.0.0:${PORT}`);
});
