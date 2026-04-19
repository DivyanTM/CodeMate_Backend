import Express from "express";
import { UserController } from '../controllers/user.controller.js';
import { upload } from "../middleware/MulterMiddleware.js";


const router = Express.Router();

router.get("/profile/me", UserController.getMyProfile);
router.put("/profile/basic", UserController.updateProfile);
router.patch("/profile/picture", upload.single("profilePicture"), UserController.updateProfilePicture,);
router.patch("/profile/location", UserController.updateLocation);
router.patch("/profile/password", UserController.changePassword);
router.patch("/profile/resetPassword", UserController.resetPassword);
router.patch("/profile/deactivate", UserController.deactivateUser);
router.patch("/profile/reactivate", UserController.reactivateUser);
router.delete("/profile", UserController.deleteUser);

export const UserRoutes = router;
