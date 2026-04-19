import { Router } from "express";
import { TeamController } from "../controllers/team.controller.js";

const router = Router();


router.post("/",  TeamController.createTeam);
router.get("/:teamId", TeamController.getTeamById);
router.patch("/:teamId",  TeamController.updateTeam);


router.post("/:teamId/skills",  TeamController.addTeamSkill);
router.delete("/:teamId/skills/:skillId",TeamController.removeTeamSkill,);
router.get("/:teamId/skills", TeamController.getTeamSkills);


router.post("/:teamId/members",  TeamController.addTeamMember);
router.delete("/:teamId/members/:memberId",TeamController.removeTeamMember,);
router.patch("/:teamId/members/:memberId",TeamController.updateMemberRole,);
router.get("/:teamId/members", TeamController.getTeamMembers);


router.get("/user/me",  TeamController.getTeamsByUser);


router.post("/:teamId/projects",  TeamController.assignTeamToProject,);
router.delete("/:teamId/projects/:projectId",TeamController.removeTeamFromProject,);
router.get("/projects/:projectId/teams", TeamController.getProjectTeams);

export const TeamRoutes = router;
