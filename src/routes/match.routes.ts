import { Router } from "express";
import { MatchController } from "../controllers/match.controller.js";

const router = Router();

router.get("/candidates",  MatchController.getCandidates);
router.post("/like/:targetId",  MatchController.likeUser);
router.post("/reject/:targetId",  MatchController.rejectUser);
router.get("/matches",  MatchController.getAcceptedMatches);
router.get("/pending",  MatchController.getPendingLikes);
router.delete("/unmatch/:matchId",  MatchController.unmatch);

export const MatchRoutes = router;
