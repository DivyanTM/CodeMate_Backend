import Express from "express";
import { ChatController } from "../controllers/chat.controller.js";

const router = Express.Router();


router.get("/rooms", ChatController.getMyRooms);
router.post("/rooms/dm/:targetUserId", ChatController.openDM);
router.post("/rooms/project/:projectId", ChatController.openProjectRoom);
router.post("/rooms/team/:teamId", ChatController.openTeamRoom);


router.get("/rooms/:roomId/messages", ChatController.getMessages);
router.post("/rooms/:roomId/messages", ChatController.sendMessage);
router.patch("/rooms/:roomId/read", ChatController.markAsRead);

export const ChatRoutes = router;
