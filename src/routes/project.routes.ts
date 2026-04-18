import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";

const router = Router();


router.post("/",  ProjectController.createProject);
router.get("/:projectId", ProjectController.getProjectById);
router.patch("/:projectId",  ProjectController.updateProject);
router.delete("/:projectId",  ProjectController.deleteProject);


router.post(  "/:projectId/skills",ProjectController.addProjectSkill,);
router.delete( "/:projectId/skills/:skillId", ProjectController.removeProjectSkill,);
router.get("/:projectId/skills", ProjectController.getProjectSkills);


router.post( "/:projectId/members", ProjectController.addProjectMember,);
router.delete("/:projectId/members/:memberId",ProjectController.removeProjectMember,);
router.patch("/:projectId/members/:memberId",ProjectController.updateMemberRole,);
router.get("/:projectId/members", ProjectController.getProjectMembers);


router.get("/user/me",  ProjectController.getProjectsByUser);

export const ProjectRoutes = router;
