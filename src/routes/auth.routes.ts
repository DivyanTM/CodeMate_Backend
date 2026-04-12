import { AuthController } from "../controllers/auth.controller.js";
import Express from "express";

const router = Express.Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/refresh-tokens", AuthController.refreshTokens);

export const AuthRoutes = router;